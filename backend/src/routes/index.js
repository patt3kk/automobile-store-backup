const express = require("express");
const adminAuthRoutes = require("./adminAuth");
const postsRoutes = require("./posts");
const router = express.Router();

// Mount admin authentication routes
router.use("/admin", adminAuthRoutes);

// Mount posts routes
router.use("/posts", postsRoutes);

module.exports = router;