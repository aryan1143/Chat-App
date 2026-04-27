import { Router } from "express";
import {
  acceptRequest,
  deleteFriend,
  findFriendRequests,
  findFriends,
  findUsers,
  rejectRequest,
  sendRequest,
} from "../controllers/connection.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

//router to find a user via email or name to send friend request
router.get("/find", protectRoute, findUsers);

//router to find friend requests
router.get("/find/requests", protectRoute, findFriendRequests);

//router to find friend requests
router.get("/find/friends", protectRoute, findFriends);

//router to send friend request to a specific user via id of the recipient
router.post("/send/:id", protectRoute, sendRequest);

//router to delete a specific friend by user id
router.delete("/delete/:id", protectRoute, deleteFriend);

//router to accept a specific friend request by connection id
router.put("/accept/:connectionID", protectRoute, acceptRequest);

//router to reject a specific friend request by connection id
router.delete("/reject/:connectionID", protectRoute, rejectRequest);

export default router;
