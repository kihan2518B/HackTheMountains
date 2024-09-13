"use client"

import { Availability, Provider, Slot } from "@/types";
import { getUserIdFromToken } from "@/utils/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css"; // Import the datepicker's CSS
import { collection, query, where, getDocs, updateDoc, onSnapshot, } from "firebase/firestore";
import { db } from "@/config/firebase";
import SlotContainer from "@/components/provider/SlotContainer";
import CalendarSection from "@/components/provider/CalendarSection";
import ProviderProfile from "@/components/provider/ProviderProfile";
import { formatDate } from "@/helpers/formateDate";

export default function ProviderDashboard() {

  const [token, setToken] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // default placing today's date
  const [formattedDate, setFormattedDate] = useState<string>(formatDate(new Date()));
  const [slotTime, setSlotTime] = useState<String>('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
  const [mergedAvailability, setMergedAvailability] = useState<Availability[]>([])
  const [isAddSlotsDialogOpen, setIsAddSlotsDialogOpen] = useState<boolean>(false);

  // this is used for fetching the token from the localstorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = localStorage.getItem("token");
      setToken(userToken);

      if (userToken) {
        const userID = getUserIdFromToken(userToken);
        setUserID(userID);
        // console.log("availability", availability);
      }
    }
  }, []);

  // this we are used for fetching the provider from the provider collection of mongoDB, who has the same value of userId as the userID coming from the token
  useEffect(() => {
    const getProvider = async () => {
      if (!userID) return;

      try {
        const response = await fetch(`/api/provider/getProvider?userID=${userID}`);
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

  // console.log("formattedDate", formattedDate)  

  // real-time fetching availability from Firestore for the selected date
  useEffect(() => {

    const fetchAvailability = async () => {
      try {
        const q = query(collection(db, "availabilities"), where("providerID", "==", userID));

        // Set up the real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedAvailability = [] as any;

          // Loop through each document to extract availability
          querySnapshot.forEach((doc) => {
            fetchedAvailability.push(...doc.data().availability);
          });

          // Call the merge function after fetching data and local state update
          mergeAvailability([...fetchedAvailability, ...availability]); // Merge firestore and local state availabilities
          // console.log("mergedAvailability", mergedAvailability);

          const existingSlotsForSelectedDate = fetchedAvailability.find((avail) => avail.date === formattedDate); // finding array who has same value of date as current selected date
          setExistingSlots(existingSlotsForSelectedDate?.slots || []); // storing slots array of selected date
        });

        // Clean up the subscription on component unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };

    if (userID) fetchAvailability();
  }, [selectedDate, userID, availability]);

  // for open the add slot dialog
  const handleDialogOpen = () => { setIsAddSlotsDialogOpen(true) };

  // for close the add slot dialog and set the ('') value to the time field of dialog
  const handleDialogClose = () => { setIsAddSlotsDialogOpen(false); setSlotTime('') };

  // adding slot for local state
  const addSlot = () => {
    if (slotTime) {
      // console.log("Adding slot:", slotTime, "for date:", formattedDate);

      // Check if the slot already exists in existingSlots (coming from Firestore)
      const slotExistsInFirestore = existingSlots.some((slot) => slot.time === slotTime);

      if (slotExistsInFirestore) {
        toast.error("Slot already saved for selected date");
        setSlotTime(""); // set the ('') value to the time field of dialog
        return; // Exit early if the slot already exists in Firestore

      }

      // Check if there's already availability for the selected date in local state
      const existingAvailability = availability.find((a) => a.date === formattedDate);

      if (existingAvailability) {
        // If date exists, check if slot already exists locally
        const slotExistsInLocalState = existingAvailability.slots.some((slot) => slot.time === slotTime);

        if (slotExistsInLocalState) {
          toast.error("Slot already added for selected date");
          setSlotTime(""); // set the ('') value to the time field of dialog
          return; // Exit early if the slot already exists locally
        }

        // Add the new slot to the existing slots array for the already existing date
        const updatedAvailability = availability.map((a) =>
          a.date === formattedDate
            ? { ...a, slots: [...a.slots, { time: slotTime, isBooked: false }], }
            : a
        );

        setAvailability(updatedAvailability);
      } else {
        // If date doesn't exist, create new availability for the selected date
        const newAvailability = [
          ...availability,
          { date: formattedDate, slots: [{ time: slotTime, isBooked: false }] },
        ];

        setAvailability(newAvailability);
      }

      setSlotTime(''); // set the ('') value to the time field of dialog
      setIsAddSlotsDialogOpen(false);
    }
  };

  // console.log("selectedDate", selectedDate)

  // Function to merge availability by date and remove duplicates
  const mergeAvailability = (availabilityArray: any[]) => {
    const mergedAvailability: { [key: string]: any } = {}; // creating empty object

    // looping through each array of availability
    availabilityArray.forEach((entry) => {
      const { date, slots } = entry; // collection date and slots array from the current array of availability

      // puting the the value of time and isBooked which is coming from the props
      const updatedSlots = slots.map((slot) => ({
        time: slot.time || slot,
        isBooked: slot.isBooked
      })).filter((slot) => slot.time);

      // Only add the date if there are valid slots
      if (updatedSlots.length > 0) {
        if (mergedAvailability[date]) {
          // If date already exists, merge the slots array
          mergedAvailability[date].slots = [
            ...mergedAvailability[date].slots, // existing slots array
            ...updatedSlots // adding new array of slots
          ];
        } else {
          // Otherwise, add the new date and its slots
          mergedAvailability[date] = { date, slots: updatedSlots };
        }
      }
    });

    // Filter out dates with empty slots before setting state
    const filteredAvailability = Object.values(mergedAvailability).filter((availability) => availability.slots.length > 0);

    setMergedAvailability(filteredAvailability as Availability[]); //set to the mergedAvailability array
  }

  // Save Availability to Firestore
  const saveAvailabilityToFirestore = async () => {
    try {
      if (!userID) { toast.error("No provider found"); return; }

      const q = query(collection(db, "availabilities"), where("providerID", "==", userID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If availability exists, update the document
        const docRef = querySnapshot.docs[0].ref; // Get the first matching document (assuming only one per provider)

        setAvailability([]); // set the value of availability to '[]', because that is already exist in 'mergedAvailability' so for preventing duplication

        await updateDoc(docRef, { availability: mergedAvailability });
        toast.success("Schedule saved successfully");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save schedule");
    }
  };

  // console.log("availability", availability);
  // console.log("existingSlots", existingSlots);

  // for the removing slot functionality
  const handleRemoveSlot = (slotTime) => {

    // Make a copy of the availability data
    const updatedAvailability = mergedAvailability.map((availability) => {
      if (availability.date === formattedDate) {
        // Filter out the slot with the specified time
        const filteredSlots = availability.slots.filter((slot) => slot.time !== slotTime);

        // Only keep the date if there are remaining slots
        if (filteredSlots.length > 0) {
          return {
            ...availability,
            slots: filteredSlots,
          };
        } else {
          // Return null for dates with no slots, to filter them out later
          return null;
        }
      }
      return availability;
    }).filter((availability) => availability !== null); // Filter out null entries for prevent the case of date with empty slots

    // Update the state with the new availability after removing the slot
    setMergedAvailability(updatedAvailability);
  };

  // for set the colour difference of time div
  const localTimeColour = new Set(availability.find((a) => a.date === formattedDate)?.slots.map(slot => slot.time));

  // finding the slots for the selected date
  const slotsForSelectedDate = mergedAvailability.find((a) => a.date === formattedDate)?.slots;

  // to manage the changing date by calender
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setFormattedDate(formatDate(date));
    }
  };

  // console.log("mergedAvailability", mergedAvailability)

  return (
    <div className="flex justify-between items-start p-6">
      <ProviderProfile provider={provider} />

      <CalendarSection
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
      />
      <SlotContainer
        selectedDate={selectedDate}
        slotsForSelectedDate={slotsForSelectedDate}
        saveAvailabilityToFirestore={saveAvailabilityToFirestore}
        handleRemoveSlot={handleRemoveSlot}
        handleDialogOpen={handleDialogOpen}
        handleDialogClose={handleDialogClose}
        addSlot={addSlot}
        slotTime={slotTime}
        setSlotTime={setSlotTime}
        isAddSlotsDialogOpen={isAddSlotsDialogOpen}
        localTimeColour={localTimeColour}
      />
    </div>
  );
}