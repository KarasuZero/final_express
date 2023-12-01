const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Render login form
router.get('/login', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.render('login');
    }
});

// Render register form
router.get('/register', (req, res) => {
    res.render('register');
});

// Render dashboard
router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.render('/login');
    }
});

// Get user by email
router.get('/user/email', async (req, res) => {
    const email = req.body.email;

    try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        } else {
            return res.status(200).json({ message: 'Email is available' });
        }

    } catch (error) {
        console.error('Error checking username:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Check if the email exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Compare the password using bcrypt
            const passwordMatch = await bcrypt.compare(password, existingUser.password);

            if (passwordMatch) {
                // Set session data for the logged-in user
                req.session.user = existingUser;
                return res.status(200).json({ message: 'Login successful' });
            } else {
                return res.status(400).json({ message: 'Incorrect password' });
            }
        } else {
            return res.status(400).json({ message: 'Email does not exist' });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Register
router.post('/register', async (req, res) => {
    const { name, password, email, age } = req.body;

    try {
        // Check if the email already exists in the database
        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); 

        // If the email doesn't exist
        const newUser = new User({ name, password: hashedPassword, email, age });
        const savedUser = await newUser.save();

        // Set session data for the registered user
        req.session.user = savedUser;
        
        res.redirect('/survey/init');

    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect('/login');
    });
});

// Delete user by email and password
router.delete('/user', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Check if the email exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Compare the password using bcrypt
            const passwordMatch = await bcrypt.compare(password, existingUser.password);

            if (passwordMatch) {
                // Delete the user
                await User.deleteOne({ email });
                return res.status(200).json({ message: 'User deleted' });
            } else {
                return res.status(400).json({ message: 'Incorrect password' });
            }
        } else {
            return res.status(400).json({ message: 'Email does not exist' });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;