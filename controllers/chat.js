const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/jwtUtils')
const Chat = require('../models/chat')

// Get all chats for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userIDs: { $in: [req.user._id] } })
      .populate('userIDs', 'username avatar')
      .populate('messages.sender', 'username')

    res.status(200).json({ success: true, data: chats })
  } catch (err) {
    console.error('Error fetching chats:', err.message)
    res.status(500).json({ success: false, error: 'Failed to fetch chats.' })
  }
})

// Get a specific chat by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('userIDs', 'username avatar')
      .populate('messages.sender', 'username')

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found.' })
    }

    if (!chat.userIDs.some((user) => user._id.toString() === req.user._id)) {
      return res
        .status(403)
        .json({ success: false, error: 'Unauthorized access to this chat.' })
    }

    res.status(200).json({ success: true, data: chat })
  } catch (err) {
    console.error('Error fetching chat:', err.message)
    res.status(500).json({ success: false, error: 'Failed to fetch chat.' })
  }
})

router.post('/', verifyToken, async (req, res) => {
  const senderId = req.user._id
  const { receiverId } = req.body

  if (!receiverId) {
    return res
      .status(400)
      .json({ success: false, error: 'Receiver ID is required.' })
  }

  try {
    // Check if a chat already exists between the two users
    let chat = await Chat.findOne({
      userIDs: { $all: [senderId, receiverId] }
    })

    if (!chat) {
      // Create a new chat if none exists
      chat = new Chat({
        userIDs: [senderId, receiverId],
        lastMessage: ''
      })
      await chat.save()
    }

    res.status(201).json({ success: true, data: chat })
  } catch (err) {
    console.error('Error creating chat:', err.message)
    res.status(500).json({ success: false, error: 'Failed to create chat.' })
  }
})

router.post('/', verifyToken, async (req, res) => {
  const senderId = req.user._id // Extract sender ID from token
  const { receiverId } = req.body // Extract receiver ID from request body

  if (!receiverId) {
    return res
      .status(400)
      .json({ success: false, error: 'Receiver ID is required.' })
  }

  try {
    // Check if a chat already exists between the two users
    let chat = await Chat.findOne({
      userIDs: { $all: [senderId, receiverId] } // Check for both sender and receiver
    })

    // If no chat exists, create one
    if (!chat) {
      chat = new Chat({
        userIDs: [senderId, receiverId],
        lastMessage: ''
      })
      await chat.save()
    }

    res.status(201).json({ success: true, data: chat })
  } catch (err) {
    console.error('Error creating chat:', err.message)
    res.status(500).json({ success: false, error: 'Failed to create chat.' })
  }
})
router.post('/:id/send-message', verifyToken, async (req, res) => {
  const { id: chatId } = req.params
  const { text } = req.body
  const senderId = req.user._id

  if (!text) {
    return res.status(400).json({ error: 'Message text is required.' })
  }

  try {
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found.' })
    }

    if (!chat.userIDs.includes(senderId)) {
      return res.status(403).json({ error: 'You are not part of this chat.' })
    }

    const newMessage = { sender: senderId, text, createdAt: new Date() }
    chat.messages.push(newMessage)
    chat.lastMessage = text
    await chat.save()

    res.status(201).json(newMessage)
  } catch (err) {
    console.error('Error sending message:', err.message)
    res.status(500).json({ error: 'Failed to send message.' })
  }
})

module.exports = router
