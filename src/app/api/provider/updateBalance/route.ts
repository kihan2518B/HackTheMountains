import { NextResponse } from "next/server";
import { connectToDatabase } from "@/config/MongoConnect";
import { Provider } from "@/models/Provider";
import { db } from "@/config/firebase"; 
import { doc, updateDoc } from "firebase/firestore";


export async function PATCH(req: Request) {
  if (req.method == "PATCH") {
    try {
      await connectToDatabase();

      const { providerID, increment, appointmentID } = await req.json()

      if (!providerID || !increment || !appointmentID) {
        return new NextResponse(JSON.stringify({ message: `ProviderID and appointmentID is required` }), { status: 400 })
      }

      const provider = await Provider.findOne({ userID: providerID }).exec(); // collecting one collection who have same value of email as email coming from the json
      // console.log("provider",provider);

      if (!provider) { return new NextResponse(JSON.stringify({ message: "Provider Not Found!!" }), { status: 404 }) };

      provider.balance += increment;
      await provider.save();

      // Firestore: Update the `isServiceCompleted` field of the corresponding appointment
      const appointmentRef = doc(db, "appointments", appointmentID);
      await updateDoc(appointmentRef, {
        isServiceCompleted: true,
      });

      return new NextResponse(JSON.stringify({ message: "Congratulation, payment added to your wallet" }), { status: 200 });

    } catch (error) {
      console.error("Error fetching provider:", error);
      return new NextResponse(JSON.stringify({ message: "Error fetching provider", error: error.message }), { status: 500 });
    }
  } else {
    return new NextResponse(JSON.stringify({ message: `Method ${req.method} Not Allowed` }), { status: 405 });
  }
}
