import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectionRoutes from "./routes/connection.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { io, app, server } from "./lib/socket.js";

dotenv.config();
const PORT = process.env.PORT;

//middleware to handle json-----
app.use(express.json({ limit: "50mb" }));
//middleware to parse the cookie
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//auth routing------------------
app.use("/api/auth", authRoutes);
//message routing------------------
app.use("/api/message", messageRoutes);
//connection routing------------------
app.use("/api/connection", connectionRoutes);

//starting the server-----------
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  //calling fn to connect to DB
  connectDB();
});
