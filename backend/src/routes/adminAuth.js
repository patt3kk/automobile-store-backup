const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { adminAuth, requireRole } = require('../middlewares/adminAuth.middleware');
const router = express.Router();

// Generate secure random password
function generateSecurePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Check if admin must change password
        if (admin.mustChangePassword) {
            // Generate a temporary token that expires in 5 minutes for password change
            const tempToken = jwt.sign(
                { id: admin._id, mustChangePassword: true },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5m' }
            );
            
            return res.status(200).json({
                message: 'Password change required',
                token: tempToken,
                mustChangePassword: true,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    username: admin.username,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role
                }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                username: admin.username,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Change password (for first login or forced change)
router.post('/change-password', adminAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = req.admin;

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        // If admin must change password (first login), we don't check current password
        if (admin.mustChangePassword) {
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            // Update admin with new password and reset mustChangePassword flag
            await Admin.findByIdAndUpdate(
                admin._id,
                {
                    password: hashedPassword,
                    mustChangePassword: false,
                    lastPasswordChange: new Date()
                }
            );

            // Generate new JWT token
            const token = jwt.sign(
                { id: admin._id, role: admin.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                message: 'Password changed successfully',
                token
            });
        }

        // For regular password change, verify current password
        if (!currentPassword) {
            return res.status(400).json({ message: 'Current password is required for regular password change.' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update admin with new password
        await Admin.findByIdAndUpdate(
            admin._id,
            {
                password: hashedPassword,
                lastPasswordChange: new Date()
            }
        );

        res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error during password change.' });
    }
});

// Create new admin (super-admin only)
router.post('/admins', adminAuth, requireRole(['super-admin']), async (req, res) => {
    try {
        const { firstName, lastName, username, email } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !username || !email) {
            return res.status(400).json({ message: 'First name, last name, username, and email are required.' });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email or username already exists.' });
        }

        // Generate secure password
        const password = generateSecurePassword();
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new admin with 'admin' role (super-admins can only create regular admins)
        const newAdmin = new Admin({
            firstName,
            lastName,
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'admin',
            mustChangePassword: true
        });

        await newAdmin.save();

        // Log the generated password to console (for manual copy)
        console.log(`New admin created: ${email} / Password: ${password}`);

        res.status(201).json({
            message: 'Admin created successfully. Password has been logged to console.',
            admin: {
                id: newAdmin._id,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                username: newAdmin.username,
                email: newAdmin.email,
                role: newAdmin.role,
                mustChangePassword: newAdmin.mustChangePassword
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ message: 'Server error during admin creation.' });
    }
});

// Get all admins (super-admin only)
router.get('/admins', adminAuth, requireRole(['super-admin']), async (req, res) => {
    try {
        const admins = await Admin.find({}, { password: 0 }); // Exclude password from response
        res.status(200).json({ admins });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ message: 'Server error during fetching admins.' });
    }
});

// Delete admin (super-admin only)
router.delete('/admins/:id', adminAuth, requireRole(['super-admin']), async (req, res) => {
    try {
        const { id } = req.params;

        // Don't allow deleting the super-admin account that's making the request
        if (id === req.admin._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account.' });
        }

        const deletedAdmin = await Admin.findByIdAndDelete(id);

        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        res.status(200).json({
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ message: 'Server error during admin deletion.' });
    }
});

module.exports = router;