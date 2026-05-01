import { Router } from "express";
import {
  deleteMessage,
  editMessage,
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

//route to edit message via message id
router.put("/edit/:id", protectRoute, editMessage);

//route to delete message via message id
router.delete("/delete/:id", protectRoute, deleteMessage);

//route to get all new messages
router.get("/new-messages", protectRoute, getNewMessages);

export default router;
