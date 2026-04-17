import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';

const app = express();

dotenv.config();
const PORT = process.env.PORT;

//middleware to handle json-----
app.use(express.json());

//auth routing------------------
app.use("/api/auth", authRoutes)

//starting the server-----------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    //calling fn to connect to DB
    connectDB();
})