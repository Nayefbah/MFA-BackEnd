const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || req.headers.authorization?.split('Bearer ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Token missing.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Ensure this contains `id` or `_id`
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' })
  }
}

module.exports = { verifyToken }
