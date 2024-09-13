import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoConnect";
import { User } from "@/models/User";
import { ObjectId } from "mongodb"; // Import ObjectId

export async function GET(req: Request) {
  if (req.method == "GET") {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const userID = searchParams.get('userID');

        if (!userID) {
            return new NextResponse(JSON.stringify({ message: `User ID is required`}),{status: 400} )
        }

         // Convert userID string to ObjectId
        const objectId = new ObjectId(userID);

      const user = await User.findOne({ _id: objectId }).exec(); // collecting one collection who have same value of email as email coming from the json
      // console.log("user",user);

      if (!user) {return new NextResponse(JSON.stringify({ message: "User Not Found!!" }), { status: 404 })};

      return new NextResponse(JSON.stringify({ user }), { status: 200 });

    } catch (error) {
      console.error("Error fetching user:", error);
      return new NextResponse(JSON.stringify({ message: "Error fetching user", error: error.message }),{ status: 500 });
    }
  } else {
    return new NextResponse(JSON.stringify({ message: `Method ${req.method} Not Allowed` }), { status: 405 });
  }
}
