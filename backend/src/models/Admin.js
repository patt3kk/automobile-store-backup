const { Schema, model } = require("mongoose");

const AdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin',
        required: true
    },
    mustChangePassword: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Admin", AdminSchema);