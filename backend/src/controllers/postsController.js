const Post = require("../models/Post");
const Admin = require("../models/Admin");
const { cloudinary } = require("../utils/cloudinary");

// Create a new post
exports.createPost = async (req, res, next) => {
    try {
        const { name, description, whatsappNumber } = req.body;

        // Validation
        if (!name || !description || !whatsappNumber) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, description, and WhatsApp number are required" 
            });
        }
        
        // Check if images are provided and valid
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (!file.mimetype || !file.mimetype.startsWith('image/')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Only image files are allowed'
                    });
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    return res.status(400).json({
                        success: false,
                        message: 'File size too large (max 5MB)'
                    });
                }
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required'
            });
        }

        // Get admin details
        const admin = req.admin; // Using the authenticated admin from middleware
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin not found" 
            });
        }

        // Handle multiple image uploads to Cloudinary
        console.log('Files received:', req.files ? req.files.length : 0);
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    console.log('Uploading file:', file.originalname, 'Size:', file.size);
                    // Upload image buffer to Cloudinary using stream
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'vehicle_posts',
                                use_filename: false,
                                unique_filename: true,
                                overwrite: false,
                                resource_type: 'image'
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );
                        // Write the buffer to the upload stream
                        uploadStream.end(file.buffer);
                    });
                    
                    // Add the Cloudinary URL to our array
                    imageUrls.push(result.secure_url);
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error uploading image to Cloudinary: ' + uploadError.message
                    });
                }
            }
        }

        // Create new post
        const newPost = new Post({
            name,
            description,
            images: imageUrls,
            whatsappNumber,
            createdBy: admin._id
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            success: true,
            message: "Vehicle post created successfully",
            post: savedPost
        });
    } catch (error) {
        next(error);
    }
};

// Get all posts
exports.getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        next(error);
    }
};

// Get the 6 most recent posts
exports.getRecentPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(6);
        
        res.status(200).json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        next(error);
    }
};

// Get a single post by ID
exports.getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        res.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        next(error);
    }
};

// Update a post
exports.updatePost = async (req, res, next) => {
    try {
        const { name, description, whatsappNumber } = req.body;

        // Find post by ID
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        // Get admin details
        const admin = req.admin; // Using the authenticated admin from middleware
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin not found" 
            });
        }

        // Update post fields if provided
        if (name) post.name = name;
        if (description) post.description = description;
        if (whatsappNumber) post.whatsappNumber = whatsappNumber;
        
        // Handle multiple image uploads to Cloudinary
        console.log('Update - Files received:', req.files ? req.files.length : 0);
        if (req.files && req.files.length > 0) {
            let newImageUrls = [];
            for (const file of req.files) {
                try {
                    console.log('Updating - Uploading file:', file.originalname, 'Size:', file.size);
                    // Upload image buffer to Cloudinary using stream
                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'vehicle_posts',
                                use_filename: false,
                                unique_filename: true,
                                overwrite: false,
                                resource_type: 'image'
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );
                        // Write the buffer to the upload stream
                        uploadStream.end(file.buffer);
                    });
                    
                    // Add the Cloudinary URL to our array
                    newImageUrls.push(result.secure_url);
                } catch (uploadError) {
                    console.error('Cloudinary upload error:', uploadError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error uploading image to Cloudinary: ' + uploadError.message
                    });
                }
            }
            post.images = [...post.images, ...newImageUrls]; // Add new images to existing ones
        }
        
        post.updatedAt = Date.now();

        const updatedPost = await post.save();

        res.status(200).json({
            success: true,
            message: "Vehicle post updated successfully",
            post: updatedPost
        });
    } catch (error) {
        next(error);
    }
};

// Delete a post
exports.deletePost = async (req, res, next) => {
    try {
        // Get admin details
        const admin = req.admin; // Using the authenticated admin from middleware
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin not found" 
            });
        }

        const post = await Post.findByIdAndDelete(req.params.id);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};