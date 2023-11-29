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

// Get survey stats
router.get('/stats', async (req, res) => {
    try {
        const surveys = await Survey.find({}, 'answers');

        const formattedStats = {};

        surveys.forEach(survey => {
            survey.answers.forEach((answer, index) => {
                const questionId = `Q${index + 1}`;

                if (!formattedStats[questionId]) {
                    formattedStats[questionId] = {};
                }

                if (!formattedStats[questionId][answer]) {
                    formattedStats[questionId][answer] = 0; // Initialize counter for the option
                }

                formattedStats[questionId][answer]++;
            });
        });

        // Fill in missing options with a count of 0 for Q1 and Q2
        ['Q1', 'Q2'].forEach(question => {
            const options = ['A', 'B'];
            options.forEach(option => {
                if (!formattedStats[question][option]) {
                    formattedStats[question][option] = 0;
                }
            });
        });

        const question = 'Q3';
        const optionsQ3 = ['A', 'B', 'C'];
        optionsQ3.forEach(option => {
            if (!formattedStats[question][option]) {
                formattedStats[question][option] = 0;
            }
        });

        // Sort options alphabetically within each question
        for (const questionId in formattedStats) {
            formattedStats[questionId] = Object.fromEntries(
                Object.entries(formattedStats[questionId]).sort((a, b) => a[0].localeCompare(b[0]))
            );
        }

        res.json(formattedStats);
    } catch (error) {
        console.error('Error fetching survey stats:', error);
        res.status(500).json({ message: 'Error fetching survey stats' });
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