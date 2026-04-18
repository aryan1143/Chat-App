import { generateJWT } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

//function to signup/create user in DB-------------
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All feilds are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        //checking if user already exists in the DB
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User with this email already exists" });

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating new-user useing User model
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            //generate JWT
            generateJWT(newUser._id, res);
            //saving new-user to DB
            await newUser.save();

            res.status(200).json({
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("error in signup controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

//function to login/verify user in DB-------------
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All feilds are required" });
        }

        //checking if user exists in the DB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //checking if provided password is correct or not
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //generating the JWT
        generateJWT(user._id, res);
        res.status(200).json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.log("error in ligin controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }

}

//function to logout the user---------------------
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("error in logout controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

//function to update user data in DB--------------
export const updateProfile = async (req, res) => {
    const { profilePic } = req.body;
    const userId = req.user._id;

    try {
        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }
    
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {returnDocument: 'after'});

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in update-profile controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

//function to check user -------------------------
export const checkUser = (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        console.log("error in check-user controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}