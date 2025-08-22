const express = require('express');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

const router = express.Router();

// Save recipe
router.post('/', auth, async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };
    if (!payload.title || !payload.instructions) {
      return res.status(400).json({ message: 'title and instructions are required' });
    }
    const recipe = await Recipe.create(payload);
    return res.status(201).json(recipe);
  } catch (err) {
    console.error('Create recipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all recipes
router.get('/', auth, async (req, res) => {
  try {
    const list = await Recipe.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error('List recipes error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get one
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Recipe.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Recipe not found' });
    return res.json(item);
  } catch (err) {
    console.error('Get recipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Recipe not found' });
    return res.json(updated);
  } catch (err) {
    console.error('Update recipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const del = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!del) return res.status(404).json({ message: 'Recipe not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete recipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
