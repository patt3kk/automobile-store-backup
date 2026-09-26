const { config } = require("../config");
const jwt = require("jsonwebtoken");

// Middleware to ensure only authenticated admins can access routes
exports.authAdminOnly = (req, res, next) => {
    try {
        // Get token from header
        let token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Remove 'Bearer ' prefix if present
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        // Verify token
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        
        // Check if user is admin
        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        // Add user info to request object
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired."
            });
        }
        
        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }
};