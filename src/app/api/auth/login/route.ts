import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoConnect";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

export async function POST(req: Request) {
  if (req.method == "POST") {
    const { email, password } = await req.json(); // collecting data from the json

    try {
      await connectToDatabase();
      const user = await User.findOne({ email }).exec(); // collecting one collection who have same value of email as email coming from the json
      // console.log("user",user); 

      if (!user) {
        return new NextResponse(
          JSON.stringify({ message: "User Not Found!!" }),
          { status: 404 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.password); // comparing the bcrypted password of database to the password coming from json

      if (!isMatch) {
        return new NextResponse(
          JSON.stringify({ message: "Invalid creadencials" }),
          { status: 401 }
        );
      }

      // creating jwt token with user's details
      const token = jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );

      return new NextResponse(
        JSON.stringify({ message: "Login Successful", token, role: user.role }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error logging in user:", error);
      return new NextResponse(
        JSON.stringify({ message: "Error logging in user", error: error }),
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
