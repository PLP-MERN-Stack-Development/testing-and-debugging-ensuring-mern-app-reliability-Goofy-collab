// server/src/routes/posts.js
const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postsController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPostById);

// Protected routes (require authentication)
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);

module.exports = router;



