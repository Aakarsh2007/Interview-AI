const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema({
    question: { 
        type: String, 
        required: true 
    },
    userAnswer: { 
        type: String, 
        required: true 
    },
    aiFeedback: { 
        type: String, 
        required: true 
    },
    score: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 10 
    }
}, {
    _id: false
});

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    totalScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    qaList: [ qaSchema ]
}, {
    timestamps: true
});

const mockInterviewModel = mongoose.model("MockInterview", mockInterviewSchema);

module.exports = mockInterviewModel;