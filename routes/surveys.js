const express = require('express');
const router = express.Router();
const Survey = require('../models/survey');

// Render Suervey form for registering user
router.get('/init', (req, res) => {
    if (req.session.user) {
        res.render('survey', { user: req.session.user });
    } else {
        // tell user that session is invalid
        console.log('session is invalid');
        res.redirect('/login');
    }
});

// Render Suervey form for returning user
router.get('/', (req, res) => {
    if (req.session.user) {
        res.render('settings', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

// Submit survey
router.post('/', async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userEmail = req.session.user.email;
        const { answers } = req.body;

        // Save the survey
        const survey = new Survey({
            email: userEmail,
            answers: answers
        });

        await survey.save();

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error submitting survey:', error);
        res.status(500).json({ message: 'Error submitting survey' });
    }
});


module.exports = router;