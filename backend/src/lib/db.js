import mongoose from 'mongoose'

//function to connect to database
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, { family: 4});
        console.log("MongoDB connected: " + conn.connection.host);
    } catch (err) {
        console.log("MongoDB connection error: " + err);
    }
}