import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITechnicalQuestion {
    question: string;
    intention: string;
    answer: string;
}

export interface IBehavioralQuestion {
    question: string;
    intention: string;
    answer: string;
}

export interface ISkillGap {
    skill: string;
    severity: 'low' | 'medium' | 'high';
}

export interface IResource {
    title: string;
    url: string;
    type: 'video' | 'article' | 'docs' | 'practice';
}

export interface ITask {
    text: string;
    resources: IResource[];
}

export interface IPreparationPlan {
    day: number;
    focus: string;
    tasks: ITask[];
}

export interface IInterviewReport extends Document {
    jobDescription: string;
    resume?: string;
    selfDescription?: string;
    matchScore?: number;
    technicalQuestions: ITechnicalQuestion[];
    behavioralQuestions: IBehavioralQuestion[];
    skillGaps: ISkillGap[];
    preparationPlan: IPreparationPlan[];
    completedTasks: string[];
    atsKeywordsMissing: string[];
    atsSuggestedBullets: string[];
    user: Types.ObjectId;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

const technicalQuestionSchema = new Schema<ITechnicalQuestion>({
    question: {
        type: String,
        required: [ true, 'Technical question is required' ]
    },
    intention: {
        type: String,
        required: [ true, 'Intention is required' ]
    },
    answer: {
        type: String,
        required: [ true, 'Answer is required' ]
    }
}, {
    _id: false
});

const behavioralQuestionSchema = new Schema<IBehavioralQuestion>({
    question: {
        type: String,
        required: [ true, 'Technical question is required' ]
    },
    intention: {
        type: String,
        required: [ true, 'Intention is required' ]
    },
    answer: {
        type: String,
        required: [ true, 'Answer is required' ]
    }
}, {
    _id: false
});

const skillGapSchema = new Schema<ISkillGap>({
    skill: {
        type: String,
        required: [ true, 'Skill is required' ]
    },
    severity: {
        type: String,
        enum: [ 'low', 'medium', 'high' ],
        required: [ true, 'Severity is required' ]
    }
}, {
    _id: false
});

const resourceSchema = new Schema<IResource>({
    title: {
        type: String,
        required: [ true, 'Resource title is required' ]
    },
    url: {
        type: String,
        required: [ true, 'Resource URL or search term is required' ]
    },
    type: {
        type: String,
        enum: [ 'video', 'article', 'docs', 'practice' ],
        required: [ true, 'Resource type is required' ]
    }
}, {
    _id: false
});

const taskSchema = new Schema<ITask>({
    text: {
        type: String,
        required: [ true, 'Task text is required' ]
    },
    resources: [ resourceSchema ]
}, {
    _id: false
});

const preparationPlanSchema = new Schema<IPreparationPlan>({
    day: {
        type: Number,
        required: [ true, 'Day is required' ]
    },
    focus: {
        type: String,
        required: [ true, 'Focus is required' ]
    },
    tasks: [ taskSchema ]
});

const interviewReportSchema = new Schema<IInterviewReport>({
    jobDescription: {
        type: String,
        required: [ true, 'Job description is required' ]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    completedTasks: {
        type: [ String ],
        default: []
    },
    atsKeywordsMissing: {
        type: [ String ],
        default: []
    },
    atsSuggestedBullets: {
        type: [ String ],
        default: []
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: {
        type: String,
        required: [ true, 'Job title is required' ]
    }
}, {
    timestamps: true
});

// Optimization Indexes
interviewReportSchema.index({ user: 1 });
interviewReportSchema.index({ createdAt: -1 });
interviewReportSchema.index({ title: 1 });

const interviewReportModel = mongoose.model<IInterviewReport>('InterviewReport', interviewReportSchema);

export default interviewReportModel;
