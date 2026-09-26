const express = require("express");
const multer = require("multer");
const { createPost, getAllPosts, getPostById, updatePost, deletePost, getRecentPosts } = require("../controllers/postsController");
const { adminAuth, requireRole } = require("../middlewares/adminAuth.middleware");

// Multer configuration for file uploads - using memory storage for Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Public route to get all posts
router.get("/", getAllPosts);

// Public route to get the 6 most recent posts
router.get("/recent/6", getRecentPosts);

// Public route to get a single post by ID
router.get("/:id", getPostById);

// Admin-only routes for post management
router.post("/", adminAuth, requireRole(['admin', 'super-admin']), upload.array('images', 10), createPost);
router.put("/:id", adminAuth, requireRole(['admin', 'super-admin']), upload.array('images', 10), updatePost);
router.delete("/:id", adminAuth, requireRole(['admin', 'super-admin']), deletePost);

module.exports = router;