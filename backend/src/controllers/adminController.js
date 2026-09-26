const Admin = require("../models/Admin");
const { hashSync, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { config } = require("../config");

// Register a new admin
exports.registerAdmin = async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Validation
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required: username, email, password, firstName, lastName" 
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { username }]
        });

        if (existingAdmin) {
            return res.status(400).json({ 
                success: false, 
                message: "Admin with this email or username already exists" 
            });
        }

        // Hash password
        const hashedPassword = hashSync(password, 10);

        // Create new admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        const savedAdmin = await newAdmin.save();

        // Create JWT token
        const token = jwt.sign(
            { id: savedAdmin._id, email: savedAdmin.email, role: "admin" },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            token,
            admin: {
                id: savedAdmin._id,
                username: savedAdmin.username,
                email: savedAdmin.email,
                firstName: savedAdmin.firstName,
                lastName: savedAdmin.lastName
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login admin
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Compare password
        const isPasswordValid = compareSync(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: "admin" },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName
            }
        });
    } catch (error) {
        next(error);
    }
};