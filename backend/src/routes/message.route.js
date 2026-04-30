import { Router } from "express";
import {
  getMessages,
  getNewMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

//message router-----------------------------------------!
const router = Router();

//route to get messages of specific user by id
router.get("/messages/:id", protectRoute, getMessages);

//route to send message to a specific user by id
router.post("/send/:id", protectRoute, sendMessage);

//route to get all new messages
router.get("/new-messages", protectRoute, getNewMessages);

export default router;
