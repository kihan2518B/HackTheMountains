import { NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { connectToDatabase } from '@/config/MongoConnect';
import { db } from '@/config/firebase';
import { Provider } from '@/models/Provider';
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

export async function POST(req: Request) {
    const {method} = req;

    if (method == "POST") {
        const { name, email, password, category, speciality, location, imageUrl } = await req.json();

        try {
    
        await connectToDatabase();

        const hashedPassword = await bcrypt.hash(password, 10); // converting password to hashedPassword

        // 1. creating the user with role 'provider'
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "provider",
        });

        await newUser.save();

        // creating jwt token with user's details
        const token = jwt.sign({ id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // 2. Creating a new provider in MongoDB
        const newProvider = new Provider({
          name, 
          email, 
          category,
          location,
          speciality, 
          userID: newUser._id,
          availabilityID: '',
          imageUrl,
        });

        await newProvider.save();

        // 3. Create an availability document in Firestore for the new doctor
        const availabilityRef = await addDoc(collection(db, 'availabilities'), {
          providerID: newProvider._id.toString(), // Reference to the MongoDB doctor's ID
          availability: [], // Initially empty; will be updated with actual availability data
        });

        // 4. Update the provider in MongoDB with the availability ID from Firestore
        newProvider.availabilityID = availabilityRef.id;
        await newProvider.save();

        return new NextResponse(JSON.stringify({ message: "Provider added Successfully", token, role: newUser.role }), { status: 201 });

        } catch (error) {
          console.error("Error creating user:", error);
          return new NextResponse(JSON.stringify({ message: "Error adding provider", error: error.message}), {status: 500})
        }
      } else {
        return new NextResponse(JSON.stringify({ message: `Method ${method} Not Allowed`}),{status: 405} )
      }
}