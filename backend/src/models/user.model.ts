import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true 
    },
    password: {
        type: String,
        required: true
    }
});

const userModel = mongoose.model<IUser>('users', userSchema);
export default userModel;
