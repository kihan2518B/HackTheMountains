"use client"

import { Appointment, Availability, Provider, Slot, TypeUser } from "@/types";
import { getUserIdFromToken } from "@/utils/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css"; // Import the datepicker's CSS
import { collection, query, where, getDocs, updateDoc, onSnapshot, } from "firebase/firestore";
import { db } from "@/config/firebase";
import SlotContainer from "@/components/provider/SlotContainer";
import CalendarSection from "@/components/provider/CalendarSection";
import ProviderProfile from "@/components/provider/ProviderProfile";
import BookedAppointments from "@/components/provider/BookedAppointments";
import { formatDate } from "@/helpers/formateDate";

export default function ProviderDashboard() {

  const [token, setToken] = useState<string | null>(null);
  const [providerID, setProviderID] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // default placing today's date
  const [formattedDate, setFormattedDate] = useState<string>(formatDate(new Date()));
  const [slotTime, setSlotTime] = useState<String>('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [existingSlots, setExistingSlots] = useState<Slot[]>([]);
  const [mergedAvailability, setMergedAvailability] = useState<Availability[]>([])
  const [isAddSlotsDialogOpen, setIsAddSlotsDialogOpen] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<{ [key: string]: TypeUser }>({});
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState<boolean>(false);


  // this is used for fetching the token from the localstorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = localStorage.getItem("token");
      setToken(userToken);

      if (userToken) {
        const providerID = getUserIdFromToken(userToken);
        setProviderID(providerID);
        console.log("availability", availability);

      }
    }
  }, []);

  // this we are used for fetching the provider from the provider collection of mongoDB, who has the same value of userId as the userID coming from the token
  useEffect(() => {
    const getProvider = async () => {
      if (!providerID) return;

      try {
        const response = await fetch(`/api/provider/getProvider?userID=${providerID}`);
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

    if (providerID) { getProvider(); }
  }, [providerID]);

  // console.log("formattedDate", formattedDate)  

  // real-time fetching availability from Firestore for the selected date
  useEffect(() => {

    const fetchAvailability = async () => {
      try {
        const q = query(collection(db, "availabilities"), where("providerID", "==", providerID));

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

    if (providerID) fetchAvailability();
  }, [selectedDate, providerID, availability]);

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
            ? { ...a, slots: [...a.slots, { time: slotTime, status: "ADDED" }], }
            : a
        );

        setAvailability(updatedAvailability);
      } else {
        // If date doesn't exist, create new availability for the selected date
        const newAvailability = [
          ...availability,
          { date: formattedDate, slots: [{ time: slotTime, status: "ADDED" }] },
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
        status: slot.status
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
      if (!providerID) { toast.error("No provider found"); return; }

      const q = query(collection(db, "availabilities"), where("providerID", "==", providerID));
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

  // for changing the color of slot according to status
  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case "ADDED":
        return "bg-blue-300";
      case "PENDING":
        return "bg-yellow-300";
      case "CONFIRM":
        return "bg-green-300";
      case "CANCEL":
        return "bg-red-300";
    }
  };

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

  useEffect(() => {
    if (!providerID) return;

    const fetchAppointmentsAndSyncAvailability = async () => {
      const appointmentsQuery = query(collection(db, "appointments"), where("providerID", "==", providerID));

      const unsubscribe = onSnapshot(appointmentsQuery, async (snapshot) => {
        const fetchedAppointments = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Appointment[];

        const sortedAppointments = fetchedAppointments.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAppointments(sortedAppointments);
        setAppointmentsLoading(false);

        // Now loop through each appointment and check availability
        for (const appointment of sortedAppointments) {
          await updateAvailabilityStatus(appointment);
        }
      });

      return () => unsubscribe();
    };

    fetchAppointmentsAndSyncAvailability();
  }, [providerID]);

  // Function to update availability status
  const updateAvailabilityStatus = async (appointment: Appointment) => {
    const { date, time, providerID, status } = appointment;
    console.log("updateAvailabilityStatus is called")
    try {
      const availabilityQuery = query(collection(db, "availabilities"), where("providerID", "==", providerID));


      const availabilitySnapshot = await getDocs(availabilityQuery); // fetching the whole collection who match the providerID
      // console.log("availabilitySnapshot", availabilitySnapshot) 

      availabilitySnapshot.forEach(async (doc) => {
        const availabilityData = doc.data().availability; // Fetch the availability array from the collection
        // console.log("availabilityData", availabilityData)

        // Find the availability array for the same date
        const availabilityForDate = availabilityData.find((avail: any) => avail.date === date);

        if (availabilityForDate) {
          // console.log("availabilityForDate", availabilityForDate);

          // Find the slot for the same time inside the availability array for that date
          const slotIndex = availabilityForDate.slots.findIndex((slot: any) => slot.time === time);

          if (slotIndex !== -1) {
            // console.log("slotIndex", slotIndex);

            // Update the status in the slots array who have same time
            availabilityForDate.slots[slotIndex].status = status; // Update the status to match appointment status

            // Update the availability document in Firestore
            await updateDoc(doc.ref, { availability: availabilityData, }); // Update the entire availability array

            console.log(`Updated availability status for ${date} at ${time} to ${status}`);
          } else {
            console.log("Slot not found for the specified time.");
          }
        } else {
          console.log("No availability found for the specified date.");
        }
      });
    } catch (error) {
      console.error("Error updating availability status:", error);
    }
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      const uniquePatientIDs = Array.from(new Set(appointments.map((appointment) => appointment.userID))
      );

      const patientDetails = await Promise.all(
        uniquePatientIDs.map(async (userID) => {
          const response = await fetch(`/api/getUserByID?userID=${userID}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user details");
          }
          const data = await response.json();
          return {
            [userID]: { name: data.user.name, email: data.user.email },
          };
        })
      );

      setUsers((prevPatients) => ({
        ...prevPatients,
        ...Object.assign({}, ...patientDetails),
      }));
    };

    if (appointments.length > 0) {
      fetchPatientDetails();
    }
  }, [appointments]);

  const handleAppointmentClick = (appointment: Appointment, action: "CONFIRM" | "CANCEL") => {
    if (appointment.status === action) {
      toast.info(`Selected Appointment is already ${action.toLowerCase()}`);
    } else {
      setSelectedAppointment(appointment);
      setSelectedAction(action);
      setShowStatusConfirmDialog(true);
    }
  };

  const handleAppointmentStatusUpdate = async () => {
    if (!selectedAppointment || !selectedAction) return;
    try {
      const { date, time } = selectedAppointment;
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("providerID", "==", providerID),
        where("date", "==", date),
        where("time", "==", time)
      );

      const snapshot = await getDocs(appointmentsQuery);
      const docs = snapshot.docs;
      const updatePromises = docs.map((doc) => updateDoc(doc.ref, { status: selectedAction }));
      await Promise.all(updatePromises);

      toast.success(`Appoitment status updated ${selectedAction.toLowerCase()} successfully`);
    } catch (error) {
      console.error("somthing gone wrong:", error);
      toast.error("somthing gone wrong");
    }

    setShowStatusConfirmDialog(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentStatusCancel = () => {
    setShowStatusConfirmDialog(false);
    setSelectedAppointment(null);
    setSelectedAction("");
  };

  return (
    <div className="p-2">
      <div className="flex flex-col justify-evenly gap-5 items-start">
        <div className="w-full">
          <h2 className="text-2xl md:text-3xl font-semibold text-ColorOne mb-2">{provider?.name.split(" ")[0]}'s Schedule</h2>
        </div>
        <div className="w-full flex gap-4 items-start justify-center sm:flex-row flex-col">

          <div className="w-full ">
            <CalendarSection
              selectedDate={selectedDate}
              handleDateChange={handleDateChange}
            />
          </div>

          <div className="w-full">
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
              getSlotStatusColor={getSlotStatusColor}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <BookedAppointments
          providerID={providerID}
          loading={appointmentsLoading}
          appointments={appointments}
          users={users}
          handleAppointmentClick={handleAppointmentClick}
          showStatusConfirmDialog={showStatusConfirmDialog}
          handleAppointmentStatusUpdate={handleAppointmentStatusUpdate}
          handleAppointmentStatusCancel={handleAppointmentStatusCancel}
          selectedAppointment={selectedAppointment}
          selectedAction={selectedAction}
          getSlotStatusColor={getSlotStatusColor}
        />
      </div>
    </div>

  );
}