require('dotenv').config()

const express = require('express')
const session = require('express-session');
const app = express()
const mongoose = require('mongoose')
const path = require('path')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

// Set the view engine and views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true
}));

// Root route redirects to the login page
app.get('/', (req, res) => {
    res.redirect('/login');
});

// routes
const userRouter = require('./routes/users')
app.use('/', userRouter)

const surveyRouter = require('./routes/surveys')
app.use('/survey', surveyRouter)

app.listen(4200, () => console.log('Server Started'))