const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Token = require('../models/tokenModel'); // Import Token model
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto'); // Import crypto

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { full_name, email, password, student_id, department_id, batch } = req.body;

    // Basic validation
    if (!full_name || !email || !password || !student_id || !department_id || !batch) {
        return res.status(400).json({ message: 'Please include all fields' });
    }

    // Email domain validation (Must be like @cse.uiu.ac.bd)
    const emailRegex = /^[^\s@]+@[a-zA-Z0-9]+\.uiu\.ac\.bd$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email must follow the format (e.g., id@cse.uiu.ac.bd)' });
    }

    try {
        // Check if user exists
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const studentIdExists = await User.findByStudentId(student_id);
        if (studentIdExists) {
            return res.status(400).json({ message: 'User with this Student ID already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userId = await User.create({
            full_name,
            email,
            password_hash: hashedPassword,
            student_id,
            department_id,
            batch
        });

        // Create verification token (mock implementation for now)
        // In production, generating a token and saving to verification_tokens table would happen here
        // And sending email via nodemailer

        // For now, respond with success
        res.status(201).json({
            message: 'Registration successful. Please check your email to verify account.',
            userId: userId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please include all fields' });
    }

    try {
        // Check for user email
        const user = await User.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            res.json({
                _id: user.id,
                full_name: user.full_name,
                email: user.email,
                student_id: user.student_id,
                department_id: user.department_id,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log(`[DEBUG] Forgot Password requested for email: '${email}'`);

    try {
        const user = await User.findByEmail(email);
        console.log(`[DEBUG] User found in DB:`, user ? user.email : 'null');

        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hash = await bcrypt.hash(resetToken, 10); // Optionally hash token in DB for security, but simpler to store plain for now or hash. 
        // For this implementation, I will store strict token to match exact link.

        // Let's stick to simple string storage for this "MVP" phase to ensure it works with the email link.
        // In prod, you'd hash it. 

        // Expiration: 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await Token.deleteByUserIdAndType(user.id, 'password_reset'); // Clear old tokens
        await Token.create({
            user_id: user.id,
            token: resetToken,
            type: 'password_reset',
            expires_at: expiresAt
        });

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        // Mock Email Sending
        console.log(`\n========================================`);
        console.log(`[EMAIL SERVICE] To: ${email}`);
        console.log(`Subject: Password Reset Request`);
        console.log(`Message: Click the link to reset your password: ${resetLink}`);
        console.log(`========================================\n`);

        res.json({
            message: 'Password reset link sent to your email.',
            // TODO: Remove this in production!
            debug_link: resetLink
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const dbToken = await Token.findByToken(token);
        if (!dbToken) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Check expiration
        if (new Date(dbToken.expires_at) < new Date()) {
            await Token.deleteByToken(token);
            return res.status(400).json({ message: 'Token expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user
        await User.updatePassword(dbToken.user_id, hashedPassword);

        // Delete token
        await Token.deleteByToken(token);

        res.json({ message: 'Password reset successful. You can now login.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};
