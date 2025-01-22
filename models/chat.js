const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema(
  {
    userIDs: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    ], // Consistent naming
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    lastMessage: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Chat', chatSchema)
