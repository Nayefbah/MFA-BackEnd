require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRouter = require('./controllers/auth')
const userRouter = require('./controllers/user')
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

app.use('/auth', authRouter)
app.use('/user', verifyToken, userRouter)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}!`)
})
