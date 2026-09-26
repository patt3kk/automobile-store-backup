const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');
require('dotenv').config();

// Generate a secure random password
function generateSecurePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function seedSuperAdmins() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB');

        // Check if super-admins already exist
        const existingAdmins = await Admin.countDocuments({ role: 'super-admin' });
        
        if (existingAdmins > 0) {
            console.log(`Found ${existingAdmins} existing super-admin(s). Skipping seed script.`);
            await mongoose.connection.close();
            return;
        }

        // Create 3 super-admins with auto-generated passwords
        const superAdmins = [];
        const generatedPasswords = [];

        for (let i = 1; i <= 3; i++) {
            const password = generateSecurePassword();
            generatedPasswords.push(password);
            
            const hashedPassword = await bcrypt.hash(password, 12);
            
            const admin = new Admin({
                username: `superadmin${i}`,
                email: `superadmin${i}@example.com`,
                password: hashedPassword,
                firstName: `Super`,
                lastName: `Admin${i}`,
                role: 'super-admin', // Add role field
                mustChangePassword: true // Force password change on first login
            });
            
            superAdmins.push(admin);
        }

        // Save all super-admins to the database
        await Promise.all(superAdmins.map(admin => admin.save()));
        
        console.log('Super-admins created successfully!');
        console.log('\nGenerated passwords (copy these now - they will only be shown once):');
        generatedPasswords.forEach((password, index) => {
            console.log(`Super Admin ${index + 1}: ${password}`);
        });
        console.log('\nLogin credentials:');
        superAdmins.forEach((admin, index) => {
            console.log(`${admin.email} / Password: ${generatedPasswords[index]}`);
        });

        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    } catch (error) {
        console.error('Error seeding super-admins:', error);
        process.exit(1);
    }
}

seedSuperAdmins();