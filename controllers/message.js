const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/jwtUtils') // Ensure this file exists and is correctly implemented

router.get('/:id/messages', verifyToken, async (req, res) => {
  try {
    const { id } = req.params // Get chat ID from the URL
    const messages = await Message.find({ chatId: id }).populate(
      'userId',
      'username email'
    )

    if (!messages || messages.length === 0) {
      return res
        .status(404)
        .json({ message: 'No messages available for this chat.' })
    }

    res.status(200).json({ data: messages })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages.' })
  }
})

module.exports = router
