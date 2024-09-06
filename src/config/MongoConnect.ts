import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL ?? "";

export const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) {
      console.log("Using existing database connection");
      return { db: mongoose.connection };
    }
  
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Error connecting to the database:", error);
      throw new Error("Error connecting to the database");
    }
  
    return { db: mongoose.connection };
  };