// server/src/controllers/postsController.js
const Post = require('../models/Post');
const mongoose = require('mongoose');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const posts = await Post.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('author', 'username email');

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    const post = await Post.findById(id).populate('author', 'username email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Get post by slug
// @route   GET /api/posts/slug/:slug
// @access  Public
const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug }).populate('author', 'username email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Create post
    const post = await Post.create({
      title,
      content,
      category,
      author: req.user.id,
    });

    res.status(201).json(post);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Don't allow updating author field
    delete req.body.author;

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};