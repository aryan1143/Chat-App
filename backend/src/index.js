import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

dotenv.config();
const PORT = process.env.PORT;

//middleware to handle json-----
app.use(express.json());
//middleware to parse the cookie
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

//auth routing------------------
app.use("/api/auth", authRoutes);
//message routing------------------
app.use("/api/message", messageRoutes);

//starting the server-----------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    //calling fn to connect to DB
    connectDB();
})