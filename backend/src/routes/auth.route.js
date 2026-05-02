import express from "express";
import {
  checkUser,
  login,
  logout,
  signup,
  updatePrivacy,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

//auth router-----------------------------------------!
const router = express.Router();

//signup route
router.post("/signup", signup);

//login route
router.post("/login", login);

//logout route
router.post("/logout", logout);

//update profile route
router.put("/update-profile", protectRoute, updateProfile);

//update privacy settings route
router.put("/update-privacy", protectRoute, updatePrivacy);

//check-user route
router.get("/check", protectRoute, checkUser);

export default router;
