import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


export const protectRoute = async (req, res, next) => {
    try {
        const token = req?.cookies?.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        //verifing the JWT token
        const {userId} = jwt.verify(token, process.env.JWT_SECRET);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        //finding user in DB using userId
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protect route: ", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}