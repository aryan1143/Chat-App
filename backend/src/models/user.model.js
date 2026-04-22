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
            required: true,
            minlength: 3,
            maxlength: 40
        },
        bio: {
            type: String,
            default: "Hi, Nice to meet you"
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profilePic: {
            type: String,
            default: "https://res.cloudinary.com/dujfvcxjl/image/upload/v1776753314/defaultpfp.png"
        },
        profilePicId: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

//exporting user model
const User = mongoose.model("User", userSchema);

export default User;