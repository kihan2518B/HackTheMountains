import React from 'react';
import { Slot } from '@/types';

interface ProviderAvailabilitySlotProps {
  selectedDate: Date;
  slotsForSelectedDate: Slot[] | null;
  handleSlotClick: (slot: Slot) => void
}

const ProviderAvailabilitySlot: React.FC<ProviderAvailabilitySlotProps> = ({
  selectedDate,
  slotsForSelectedDate,
  handleSlotClick
}) => {


  return (
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
        {slotsForSelectedDate && slotsForSelectedDate.length > 0 ? (
          <div className="flex flex-wrap gap-2 cursor-pointer">
            {slotsForSelectedDate.map((slot, index) => (
              <div
                key={index}
                className={`flex items-center gap-1 rounded-md w-fit p-2 ${(slot.isBooked ? 'bg-green-300' : 'bg-yellow-300')}`}
              >
                <li onClick={handleSlotClick(slot)} className="">{slot.time}</li>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No slots Available for this date</p>
        )}
      </div>

    </div>
  );
};

export default ProviderAvailabilitySlot;
