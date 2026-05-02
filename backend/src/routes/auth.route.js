import express from "express";
import {
  checkUser,
  deleteFcmToken,
  login,
  logout,
  setFcmToken,
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
router.post("/logout", protectRoute, logout);

//setting FCM token route
router.post("/fcm-token", protectRoute, setFcmToken);

//deleting FCM token route
router.delete("/fcm-token", protectRoute, deleteFcmToken);

//update profile route
router.put("/update-profile", protectRoute, updateProfile);

//update privacy settings route
router.put("/update-privacy", protectRoute, updatePrivacy);

//check-user route
router.get("/check", protectRoute, checkUser);

export default router;
