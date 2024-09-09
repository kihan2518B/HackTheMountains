"use client"

import LogoutButton from "@/components/LogoutButton";
import { Availability, Provider, Slot } from "@/types";
import { getUserIdFromToken, getUserRoleFromToken } from "@/utils/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the datepicker's CSS
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, Timestamp, addDoc, } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function ProviderDashboard() {
  // Function to format the date
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [token, setToken] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // default placing today's date
  const [formattedDate, setFormattedDate] = useState<string>(formatDate(new Date()));
  const [slotTime, setSlotTime] = useState<String>('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
  const [isAddSlotsDialogOpen, setIsAddSlotsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = localStorage.getItem("token");
      setToken(userToken);

      if (userToken) {
        const userID = getUserIdFromToken(userToken);
        setUserID(userID);
        console.log("availability", availability);
      }
    }
  }, []);

  useEffect(() => {
    const getProvider = async () => {
      if (!userID) return;

      try {
        const response = await fetch(`/api/provider/getProvider?providerID=${userID}`);
        const result = await response.json();

        if (result.user) {
          setProvider(result.user);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An error occurred while fetching provider data");
      }
    };

    if (userID) { getProvider(); }
  }, [userID]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setFormattedDate(formatDate(date));
    }
  };

  // console.log("formattedDate", formattedDate)  

  // Fetch availability from Firestore for the selected date
  useEffect(() => {

    const fetchAvailability = async () => { 
      try {
        const q = query(collection(db, "availabilities"), where("providerID", "==", provider?._id));
        const querySnapshot = await getDocs(q);
        
        const fetchedAvailability = [] as any;

        // Loop through each document to extract availability
        querySnapshot.forEach( (doc) => {fetchedAvailability.push(...doc.data().availability)} );

        const existingSlotsForSelectedDate = fetchedAvailability.find((avail) => avail.date === formattedDate);

        setExistingSlots(existingSlotsForSelectedDate?.slots || []);        
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };
    
      if(provider?._id) fetchAvailability();
    },[selectedDate, provider?._id]);

  const handleDialogOpen = () => {setIsAddSlotsDialogOpen(true)};
  const handleDialogClose = () => {setIsAddSlotsDialogOpen(false)};

  // Handle adding slot locally
  const addSlot = () => {
    if(slotTime){
      // Check if there's already availability for the selected date
      const existingAvailability = availability.find((a) => a.date === formattedDate);

      if(existingAvailability){
        // If date exists, add the new slot to the slots array
        const updatedAvailability = availability.map((a) =>
           a.date === formattedDate
            ? { ...a, slots: [ ...a.slots, { time: slotTime } ]} // if date is selectedDate then add the slot into slots array
            : a // else the availability remain as it is
        );

        setAvailability(updatedAvailability);
      } else {
        // If date doesn't exist, create new availability for the selected date
        setAvailability([
          ...availability,
          { date: formattedDate, slots: [{ time: slotTime }] },
        ]);
    }

    // Clear the input field and close the dialog
    setSlotTime("");
    setIsAddSlotsDialogOpen(false);
  }
};

// console.log("selectedDate", selectedDate)

// Function to merge availability by date and remove duplicates
const mergeAvailability = (availabilityArray: any[]) => {
  const mergedAvailability: { [key: string]: any } = {};

  availabilityArray.forEach((entry) => {
    const { date, slots } = entry;

    if (mergedAvailability[date]) {
      // If date already exists, merge the slots array
      mergedAvailability[date].slots = [ 
        ...mergedAvailability[date].slots, // this will merge existing slots 
        ...slots, // with the new slots
      ];

      mergedAvailability[date].isBooked = false;
    } else {
      // Otherwise, add the new date and its slots
      mergedAvailability[date] = { date, slots, isBooked: false };
    }
  });

  return Object.values(mergedAvailability); // converting object back into the string
}

 // Save Availability to Firestore
 const saveAvailabilityToFirestore = async () => {
  try {
    if (!provider?._id) { toast.error("No provider found"); return; }

    const q = query(collection(db, "availabilities"), where("providerID", "==", provider?._id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If availability exists, update the document
      const docRef = querySnapshot.docs[0].ref; // Get the first matching document (assuming only one per provider)
      const existingData = querySnapshot.docs[0].data();

      // Merge existing availability with the new availability, removing duplicates
      const mergedAvailability = mergeAvailability([...existingData.availability, ...availability]);

      await updateDoc(docRef, { availability: mergedAvailability });
      toast.success("Schedule updated successfully");
    } 
  } catch (error) {
    console.error("Error saving availability:", error);
    toast.error("Failed to update schedule");
  }
};

// Get slots for the selected date
const selectedDateSlots = availability.find((a) => a.date === formattedDate)?.slots;

console.log("availability", availability);
console.log("existingSlots", existingSlots);

  return (
    <div className="flex justify-between items-start p-6">
      <div className="max-w-md p-4 bg-white shadow-lg rounded-lg border border-gray-200 flex-1">
      {provider ? (
          <div className="0">
            <div className="flex items-center space-x-4">
              <img
                src={provider.imageUrl}
                alt={`${provider.name}'s profile`}
                className="w-40 h-40 rounded-full object-cover shadow-md"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-semibold text-gray-800 mb-2">{provider.name}</h2>
                <p className="text-lg text-gray-600 mb-2">Email: <span className="text-gray-800 font-medium">{provider.email}</span></p>
                <p className="text-lg text-gray-600 mb-2">Category: <span className="text-gray-800 font-medium">{provider.category}</span></p>
                <p className="text-lg text-gray-600 mb-2">Speciality: <span className="text-gray-800 font-medium">{provider.speciality}</span></p>
                <p className="text-lg text-gray-600 mb-2">Location: <span className="text-gray-800 font-medium">{provider.location}</span></p>
              </div>
            </div>
          </div>
        ) : (
          <p>No provider data available</p>
        )}
      </div>

      {/* Calendar and Selected Date Section */}
      <div className="flex flex-1 justify-between items-start ml-6">
        {/* Calendar Section */}
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200 mr-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Calendar</h3>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange} // Update selected date on click
            inline
            className="mb-4"
          />
        </div>

        {/* Selected Date Section */}
        <div className="bg-white w-52 p-4 shadow-lg rounded-md border border-gray-200 flex-1">
          <h4 className="text-2xl font-semibold mb-2 text-gray-800">Selected Date</h4>
          <p className="text-lg text-gray-600">
            Date:{" "}
            <span className="font-medium text-gray-800">
              {selectedDate ? selectedDate.toDateString() : "No date selected"}
            </span>
          </p>

          {/* Display Slots for Selected Date */}
          <div className="mt-4">
            <h5 className="text-lg font-medium mb-2">Slots:</h5>
            {existingSlots && existingSlots.length > 0 ? (
            <ul className="list-disc list-inside">
              {/* Display existing slots from Firestore */}
              {existingSlots.map((slot, index) => (
                <li key={index} className="text-blue-600 font-semibold">
                  {slot.time} (from database)
                </li>
              ))}

              {/* Display newly added slots from state */}
              {selectedDateSlots
                ?.filter((newSlot) => !existingSlots.some((slot) => slot.time === newSlot.time)) // Only display new slots
                .map((slot, index) => (
                  <li key={index} className="text-violet-600 font-semibold">
                    {slot.time} (newly added)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No slots added for this date</p>
            )}
          </div>

          {/* Add Slot Button */}
          <button
            onClick={handleDialogOpen}
            className="mt-4 mr-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            Add Slots
          </button>

          {/* Save Availability Button */}
          <button
            onClick={saveAvailabilityToFirestore}
            className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
          >
            Save Availability
          </button>
        </div>
      </div>

      {/* Add Slot Dialog */}
      {isAddSlotsDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Add Slot for {selectedDate.toDateString()}</h4>
            <input
              type="time"
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded-md"
            />
            <div className="flex space-x-4">
              <button
                onClick={addSlot}
                className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
              >
                Add Slot
              </button>
              <button
                onClick={handleDialogClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
