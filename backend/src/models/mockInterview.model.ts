import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMockQAItem {
    question: string;
    userAnswer: string;
    aiFeedback: string;
    score: number;
    durationSeconds?: number;
    isSpoken?: boolean;
}

export interface IMockInterview extends Document {
    user: Types.ObjectId;
    interviewReport: Types.ObjectId;
    jobTitle: string;
    totalScore: number;
    qaList: IMockQAItem[];
    createdAt: Date;
    updatedAt: Date;
}

const qaSchema = new Schema<IMockQAItem>({
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
    },
    durationSeconds: {
        type: Number
    },
    isSpoken: {
        type: Boolean,
        default: false
    }
}, {
    _id: false
});

const mockInterviewSchema = new Schema<IMockInterview>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    interviewReport: {
        type: Schema.Types.ObjectId,
        ref: 'InterviewReport',
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

// Optimization Indexes
mockInterviewSchema.index({ user: 1 });
mockInterviewSchema.index({ createdAt: -1 });
mockInterviewSchema.index({ totalScore: 1 });
mockInterviewSchema.index({ jobTitle: 1 });

const mockInterviewModel = mongoose.model<IMockInterview>('MockInterview', mockInterviewSchema);

export default mockInterviewModel;
