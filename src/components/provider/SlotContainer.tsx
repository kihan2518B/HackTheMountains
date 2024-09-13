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
  getSlotStatusColor: (status: string) => void
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
    

  return (
    <div className="bg-white w-52 p-4 shadow-lg rounded-md border border-gray-200 flex-1">
      <h4 className="text-2xl font-semibold mb-2 text-gray-800">Selected Date:{" "}
        <span className="font-medium text-gray-600">
          {selectedDate ? selectedDate.toDateString() : "No date selected"}
        </span>
      </h4>

      {/* Display Slots for Selected Date */}
      <div className="mt-4">
        <h5 className="text-lg font-medium mb-2">Slots:</h5>
        {slotsForSelectedDate && slotsForSelectedDate.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {slotsForSelectedDate.map((slot, index) => (
              <div
                key={index}
                className={`flex items-center gap-1 rounded-md w-24 justify-evenly p-2 ${localTimeColour.has(slot.time) ? 'bg-slate-300' : getSlotStatusColor(slot.status)}`}
              >
                <p className="">{slot.time}</p>
                {(slot.status) === "ADDED"  &&
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSlot(slot.time)} // Remove slot on click
                  >
                    <DeleteIcon fontSize="small" className="text-red-500" />
                  </IconButton>
                }
              </div>
            ))}
          </div>
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

      <button
        onClick={saveAvailabilityToFirestore}
        className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
      >
        Save Availability
      </button>

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
};

export default SlotContainer;
