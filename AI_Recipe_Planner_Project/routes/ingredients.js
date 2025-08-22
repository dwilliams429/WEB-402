const express = require('express');
const Ingredient = require('../models/Ingredient');
const auth = require('../middleware/auth');

const router = express.Router();

// Create
router.post('/', auth, async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const ing = await Ingredient.create({ userId: req.user.id, name, quantity, unit });
    return res.status(201).json(ing);
  } catch (err) {
    console.error('Create ingredient error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Read all
router.get('/', auth, async (req, res) => {
  try {
    const list = await Ingredient.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error('List ingredients error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Ingredient.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Ingredient not found' });
    return res.json(updated);
  } catch (err) {
    console.error('Update ingredient error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Ingredient.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!del) return res.status(404).json({ message: 'Ingredient not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete ingredient error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
