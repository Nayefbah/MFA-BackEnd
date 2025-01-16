const User = require('../models/user')
const router = require('express').Router()
const { verifyToken } = require('../middleware/jwtUtils')

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    res.status(200).json(user)
  } catch (error) {
    console.error('Error fetching profile:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

module.exports = router
