const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: {
      type: String,
      enum: ['electronics', 'vehicles', 'tools'],
      required: true
    },
    condition: {
      type: String,
      enum: ['new', 'used'],
      required: true
    },
    description: { type: String, required: true },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Item', itemSchema)
