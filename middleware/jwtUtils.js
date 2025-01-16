const jwt = require('jsonwebtoken')

const signToken = (user) => {
  return jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || req.headers.authorization?.split('Bearer ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Token missing.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error('JWT Verification Error:', error.message)
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' })
  }
}

module.exports = { signToken, verifyToken }
