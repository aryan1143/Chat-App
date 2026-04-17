import mongoose from 'mongoose'

//user schema
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profilePic: {
            type: String,
            default: ""
        }
    },
    {timestamps: true}
);

//exporting user model
const User = mongoose.model("User", userSchema);

export default User;