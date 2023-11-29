const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    answers: { 
        type: Array,
        required: true
    }
})

module.exports = mongoose.model('Survey', surveySchema)