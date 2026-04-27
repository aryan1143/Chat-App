import { generateJWT } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import imagekit from "../lib/imagekit.js";

//function to signup/create user in DB-------------
export const signup = async (req, res) => {
    const data = req.body;
    try {
        if (!data?.fullName || !data?.email || !data?.password) {
            return res.status(400).json({ message: "All feilds are required" });
        }

        if (data?.password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        //checking if user already exists in the DB
        const user = await User.findOne({ email: data?.email });
        if (user) return res.status(400).json({ message: "User with this email already exists" });

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        //creating new-user useing User model
        const newUser = new User({
            fullName: data?.fullName,
            email: data.email,
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
        console.log("Error in signup auth-controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

//function to login/verify user in DB-------------
export const login = async (req, res) => {
    const data = req.body;

    try {
        if (!data?.email || !data?.password) {
            return res.status(400).json({ message: "All feilds are required" });
        }

        //checking if user exists in the DB
        const user = await User.findOne({ email: data?.email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //checking if provided password is correct or not
        const isPasswordCorrect = await bcrypt.compare(data.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //generating the JWT
        generateJWT(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.log("Error in login auth-controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }

}

//function to logout the user---------------------
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout auth-controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

//function to update user data in DB--------------
export const updateProfile = async (req, res) => {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    const updateFeilds = {};
    try {
        if (!profilePic && !bio && !fullName) {
            return res.status(400).json({ message: "Profile data is required to update" });
        }

        //updating profile pic
        if (profilePic) {
            try {
                const user = await User.findById(userId);
                const oldProfileURL = user.profilePic;
                const isDefaultPfp = oldProfileURL.split('/').pop().split('.')[0] === "defaultpfp";
                if (!isDefaultPfp && user.profilePicId) {
                    try {
                        await imagekit.deleteFile(user.profilePicId);
                    } catch (deleteError) {
                        throw new Error("Failed to delete old image:", deleteError.message);
                    }
                }
            } catch (error) {
                console.log("Error in update-profile-profile-url-delete auth-controller:", error.message);
            }

            const uploadResponse = await imagekit.upload({
                file: profilePic,
                fileName: `profile_${Date.now()}.jpg`,
                folder: "/user_profiles/",
                useUniqueFileName: true
            });
            updateFeilds.profilePic = uploadResponse.url;
            updateFeilds.profilePicId = uploadResponse.fileId;
        }

        //updating profile bio
        if (bio) updateFeilds.bio = bio;

        //updating full-name
        if (fullName) updateFeilds.fullName = fullName;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFeilds },
            { returnDocument: 'after' }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update-profile auth-controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

//function to check user -------------------------
export const checkUser = (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in check-user auth-controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}