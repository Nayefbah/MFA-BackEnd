const { signToken } = require('../middleware/jwtUtils')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const jwt = require('jsonwebtoken')

router.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body
    if (!username || !password || !email)
      return res.status(400).json({ error: 'Missing required fields.' })
    const userExist = await User.findOne({ username })
    if (userExist)
      return res.status(409).json({ error: 'Username already taken.' })
    const hashedPassword = await bcrypt.hash(password, +process.env.SALT || 10)
    const user = await User.create({
      username,
      password: hashedPassword,
      email
    })
    const token = signToken(user)
    return res.status(201).json({ message: 'User created successfully', token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong!' })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ error: 'Invalid Credentials!' })
    }

    const matched = await bcrypt.compare(password, user.password)
    if (!matched) {
      return res.status(401).json({ error: 'Invalid Credentials!' })
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    const age = 1000 * 60 * 60 * 24 * 7
    res
      .cookie('token', token, { httpOnly: true, maxAge: age })
      .status(200)
      .json({ message: 'Signin successfully', token })
  } catch (error) {
    console.error('Signin Error:', error.message)
    res.status(500).json({ error: 'Failed to Signin!' })
  }
})

router.post('/signout', async (req, res) => {
  try {
    res
      .clearCookie('token')
      .status(201)
      .json({ message: 'Signout Successfully!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to login!' })
  }
})
module.exports = router
