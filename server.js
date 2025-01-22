require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoute = require('./controllers/auth')
const userRoute = require('./controllers/user')
const itemRoute = require('./controllers/item')
const chatRoute = require('./controllers/chat')
const messageRoute = require('./controllers/message')
const { verifyToken } = require('./middleware/jwtUtils')

const app = express()
const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.FRONT_END_URL, credentials: true }))

app.use('/auth', authRoute)
app.use('/user', verifyToken, userRoute)
app.use('/items', itemRoute)
app.use('/chat', verifyToken, chatRoute)
app.use('/message', verifyToken, messageRoute)

app.use((err, req, res, next) => {
  console.error('Global Error:', err.message)
  res.status(500).json({ success: false, error: 'Something went wrong.' })
})

app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}!`)
})
