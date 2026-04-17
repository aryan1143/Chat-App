import { generateJWT } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'

//function to signup/create user in DB-------------
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if(!fullName || !email || !password) {
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

export const login = (req, res) => {
    res.send("Login Route !");
}

export const logout = (req, res) => {
    res.send("Logout Route !");
}