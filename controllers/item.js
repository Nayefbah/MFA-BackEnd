const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Item = require('../models/item')
const { verifyToken } = require('../middleware/jwtUtils')

router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query

  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const totalItems = await Item.countDocuments()

    res.status(200).json({
      items,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page)
    })
  } catch (err) {
    console.error('Error fetching items:', err.message)
    res.status(500).json({ error: 'Failed to get items' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID format.' })
    }

    const item = await Item.findById(req.params.id).populate(
      'sellerId',
      'username email avatar'
    )

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' })
    }

    res.status(200).json(item)
  } catch (err) {
    console.error('Error fetching item:', err.message)
    res.status(500).json({ error: 'Failed to get item' })
  }
})

router.post('/', verifyToken, async (req, res) => {
  const { title, price, images, category, condition, description } = req.body

  if (!title || !price || !category || !condition) {
    return res
      .status(400)
      .json({ error: 'All required fields must be filled.' })
  }

  try {
    const newItem = new Item({
      title,
      price,
      images,
      category,
      condition,
      description,
      sellerId: req.user._id
    })

    await newItem.save()
    res.status(201).json(newItem)
  } catch (err) {
    console.error('Error creating item:', err.message)
    res.status(500).json({ error: 'Failed to add item' })
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  const { title, price, images, category, condition, description } = req.body

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID format.' })
    }

    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' })
    }

    if (item.sellerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'Not Authorized to update this item.' })
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { title, price, images, category, condition, description },
      { new: true }
    )

    res.status(200).json(updatedItem)
  } catch (err) {
    console.error('Error updating item:', err.message)
    res.status(500).json({ error: 'Failed to update item' })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID format.' })
    }

    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' })
    }

    if (item.sellerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'Not Authorized to delete this item.' })
    }

    await item.deleteOne()
    res.status(200).json({ message: 'Item deleted successfully.' })
  } catch (err) {
    console.error('Error deleting item:', err.message)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

module.exports = router
