const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    answers: { 
        type: Array,
        required: true
    }
})

module.exports = mongoose.model('Survey', surveySchema)