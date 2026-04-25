import { Router } from "express";
import {
  acceptRequest,
  deleteFriend,
  findUsers,
  rejectRequest,
  sendRequest,
} from "../controllers/connection.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

//router to find a user via email or name to send friend request
router.get("/find", protectRoute, findUsers);

//router to send friend request to a specific user via id of the recipient
router.post("/send_request/:id", protectRoute, sendRequest);

//router to delete a specific friend by user id
router.delete("/delete/:id", protectRoute, deleteFriend);

//router to accept a specific friend request by connection id
router.put("/accept_request/:connectionID", protectRoute, acceptRequest);

//router to reject a specific friend request by connection id
router.delete("/reject_request/:connectionID", protectRoute, rejectRequest);

export default router;
