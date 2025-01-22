const User = require('../models/user')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { verifyToken } = require('../middleware/jwtUtils')

router.get('/profile', verifyToken, async (req, res) => {
  try {
    console.log('Fetching profile for user ID:', req.user._id) // Debug log
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      console.log('User not found for ID:', req.user._id)
      return res.status(404).json({ error: 'User not found.' })
    }
    console.log('Profile fetched successfully:', user)
    res.status(200).json(user)
  } catch (error) {
    console.error('Error fetching profile:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Failed to get users' })
  }
})
router.get('/:id'),
  router.get('/:id', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password')
      if (!user) {
        return res.status(404).json({ error: 'User not found.' })
      }
      res.status(200).json(user)
    } catch (err) {
      console.error('Error fetching user:', err.message)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  })
router.put('/:id', verifyToken, async (req, res) => {
  const { username, email, password, avatar } = req.body
  const updates = { username, email, avatar }

  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not Authorized' })
    }

    if (password) {
      updates.password = await bcrypt.hash(
        password,
        parseInt(process.env.SALT) || 10
      )
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true
    })

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' })
    }

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
router.delete('/:id', verifyToken, async (req, res) => {
  const id = req.params.id
  const tokenUserId = req.user._id

  if (id !== tokenUserId.toString()) {
    return res.status(403).json({ error: 'Not Authorized' })
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id)

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found.' })
    }

    res.status(200).json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('Error deleting user:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

module.exports = router
