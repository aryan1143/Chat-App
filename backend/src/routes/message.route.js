import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

//message router-----------------------------------------!
const router = Router();

//route to get messages of specific user by id
router.get("/:id", protectRoute, getMessages);

//route to send message to a specific user by id
router.post("/send/:id", protectRoute, sendMessage)

export default router;