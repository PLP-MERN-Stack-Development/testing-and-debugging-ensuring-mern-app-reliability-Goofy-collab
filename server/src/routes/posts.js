const express = require('express');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Post = require('../models/Post');

const router = express.Router();

// Using asyncHandler to catch errors automatically
router.get('/', asyncHandler(async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  
  res.json(post);
}));

router.post('/', asyncHandler(async (req, res) => {
  // Validation
  if (!req.body.title) {
    throw new AppError('Title is required', 400);
  }
  
  const post = await Post.create(req.body);
  res.status(201).json(post);
}));

module.exports = router;