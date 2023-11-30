const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Survey = require('../models/survey');
const bcrypt = require('bcrypt');

// Render settings page and retrieve survey data
router.get('/', async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.redirect('/login');
        }

        const userEmail = req.session.user.email;

        const userSurvey = await Survey.findOne({ email: userEmail });
        if (!userSurvey) {
            return res.status(404).json({ message: 'Survey answers not found' });
        }

        // Render settings page and pass user and survey data to the template
        res.render('settings', { user: req.session.user, userSurvey: userSurvey });
    } catch (error) {
        console.error('Error fetching user survey answers:', error);
        return res.status(500).json({ message: 'Error fetching user survey answers' });
    }
});

// Update user details
router.patch('/update/user_info', async (req, res) => {
    try {
        const { name, email, age, password } = req.body;

        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userEmail = req.session.user.email;

        if (email !== userEmail) {
            // If the user is changing the email, check if it already exists
            const existingEmail = await User.findOne({ email });

            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); 

        // Update user details in the database
        await User.findOneAndUpdate({ email: userEmail }, { name, email, age, password: hashedPassword });

        // Update session user data with the new information
        req.session.user.name = name;
        req.session.user.email = email;
        req.session.user.age = age;
        req.session.user.password = password;

        return res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
        console.error('Error updating user details:', error);
        return res.status(500).json({ message: 'Error updating user details' });
    }
});

// Update survey answers
router.patch('/update/answers', async (req, res) => {
    try {
        const { answers } = req.body;

        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userEmail = req.session.user.email;

        // Ensure answers is an array of strings
        const updatedAnswers = Object.values(answers).map(ans => ans.trim());

        // Update survey answers in the database
        await Survey.findOneAndUpdate({ email: userEmail }, { answers: updatedAnswers });

        return res.status(200).json({ message: 'Survey answers updated successfully' });
    } catch (error) {
        console.error('Error updating survey answers:', error);
        return res.status(500).json({ message: 'Error updating survey answers' });
    }
});


module.exports = router;
