import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoConnect";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

export async function POST(req: Request) {
  if (req.method === "POST") {
    const { name, email, password } = await req.json(); // collecting data from the json

    // console.log("name", name)
    // console.log("email", email)
    // console.log("password", password)

    if (!name || !email || !password) {
      return new NextResponse(
        JSON.stringify({ message: `missing creadentials` }),
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      const hashedPassword = await bcrypt.hash(password, 10); // converting password to hashedPassword

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: "client",
      });

      await newUser.save();

      // creating jwt token with user's details
      const token = jwt.sign(
        {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );

      return new NextResponse(
        JSON.stringify({
          message: "User Created Successfully",
          token,
          role: newUser.role,
        }),
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return new NextResponse(
        JSON.stringify({ message: "Error creating user", error: error }),
        { status: 500 }
      );
    }
  } else {
    return new NextResponse(
      JSON.stringify({ message: `Method ${req.method} Not Allowed` }),
      { status: 405 }
    );
  }
}
