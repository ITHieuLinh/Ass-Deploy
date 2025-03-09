const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: { type: [String], required: true },
    keywords: { type: [String], default: [] },
    correctAnswerIndex: { type: Number, required: true },
    mainStatus: { type: String, default: "normal" } 
});

module.exports = mongoose.model('Question', QuestionSchema);
