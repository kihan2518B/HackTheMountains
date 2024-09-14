import React from 'react';
import { Slot } from '@/types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface SlotContainerProps {
  selectedDate: Date;
  slotsForSelectedDate: Slot[] | undefined;
  handleRemoveSlot: (slotTime: string) => void;
  saveAvailabilityToFirestore: () => void;
  handleDialogOpen: () => void;
  handleDialogClose: () => void;
  addSlot: () => void;
  slotTime: string;
  setSlotTime: (time: string) => void;
  isAddSlotsDialogOpen: boolean;
  localTimeColour: Set<string>;
  getSlotStatusColor: (status: string) => string; // Corrected type
}

const SlotContainer: React.FC<SlotContainerProps> = ({
  selectedDate,
  slotsForSelectedDate,
  handleRemoveSlot,
  handleDialogOpen,
  handleDialogClose,
  addSlot,
  slotTime,
  setSlotTime,
  isAddSlotsDialogOpen,
  localTimeColour,
  saveAvailabilityToFirestore,
  getSlotStatusColor,
}) => {

  // Function to convert time string into comparable format (e.g., "14:00" to 840 minutes)
  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Sort the slots based on the time in ascending order
  const sortedSlots = slotsForSelectedDate
    ? slotsForSelectedDate.sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time))
    : [];

  return (
    <div className="w-full">
      <div className="bg-white w-full p-6 shadow-lg rounded-md border border-gray-200 flex flex-col">
        <h4 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">
          Selected Date:{" "}
          <span className="font-medium text-gray-600">
            {selectedDate ? selectedDate.toDateString() : "No date selected"}
          </span>
        </h4>

        {/* Display Slots for Selected Date */}
        <div className="mt-2">
          <h5 className="text-lg md:text-xl font-medium mb-2">Availability:</h5>
          {sortedSlots && sortedSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2 overflow-y-auto">
              {sortedSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1 rounded-md w-24 md:w-28 justify-center p-2 ${localTimeColour.has(slot.time) ? 'bg-slate-300' : getSlotStatusColor(slot.status)}`}
                >
                  <p className="text-xl text-ColorTwo md:text-xl">{slot.time}</p>
                  {slot.status === "ADDED" && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSlot(slot.time)} // Remove slot on click
                      aria-label={`Remove slot at ${slot.time}`}
                    >
                      <DeleteIcon fontSize="small" className="text-red-500" />
                    </IconButton>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No slots added for this date</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleDialogOpen}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            Add Slots
          </button>

          <button
            onClick={saveAvailabilityToFirestore}
            className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
          >
            Save Availability
          </button>
        </div>

        {/* Add Slot Dialog */}
        {isAddSlotsDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md shadow-lg w-11/12 max-w-md">
              <h4 className="text-xl font-semibold mb-4">Add Slot for {selectedDate.toDateString()}</h4>
              <input
                type="time"
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
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
    </div>
  );
};

export default SlotContainer;
