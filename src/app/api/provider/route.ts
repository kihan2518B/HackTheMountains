import { NextResponse } from "next/server";

import { middleware } from "@/middleware/middleware"
import { Provider } from "@/models/Provider";

import { connectToDatabase } from "@/config/MongoConnect";


export const GET = async (req: Request) => {
    try {
        const decodedUser = await middleware(req)
        try {
            await connectToDatabase();

            const providers = await Provider.find();
            
            if (providers.length == 0) {
                throw new Error('Error while fetching Providers!!');
            }

            return new NextResponse(JSON.stringify({ message: 'Found Providers!!' ,providers}), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.log("Error while fetching Providers: ", error);
            return new NextResponse(JSON.stringify({ message: 'Error while fetching Providers!!' }),
                { status: 500 }
            );
        }
    } catch (error) {
        console.log("error: ", error)
        return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
    }
} 