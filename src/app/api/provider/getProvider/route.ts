import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoConnect";
import { Provider } from "@/models/Provider";


export async function GET(req: Request) {
  if (req.method == "GET") {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const userID = searchParams.get('userID');
        // console.log("route",userID);

        if (!userID) {
            return new NextResponse(JSON.stringify({ message: `Provider ID is required`}),{status: 400} )
        }

      const user = await Provider.findOne({ userID }).exec(); // collecting one collection who have same value of email as email coming from the json
      // console.log("user",user);

      if (!user) {return new NextResponse(JSON.stringify({ message: "Provider Not Found!!" }), { status: 404 })};

      return new NextResponse(JSON.stringify({ user }), { status: 200 });

    } catch (error) {
      console.error("Error fetching provider:", error);
      return new NextResponse(JSON.stringify({ message: "Error fetching provider", error: error.message }),{ status: 500 });
    }
  } else {
    return new NextResponse(JSON.stringify({ message: `Method ${req.method} Not Allowed` }), { status: 405 });
  }
}
