import React, { useState } from 'react';
import { Slot } from '@/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

interface ProviderAvailabilitySlotProps {
  selectedDate: Date;
  slotsForSelectedDate: Slot[] | null;
  handleSlotClick: (slot: Slot) => void;
  selectedSlot: Slot | null; // Added prop to highlight selected slot
  handleBookAppointment: () => void;
  Loading: boolean;
}

const ProviderAvailabilitySlot: React.FC<ProviderAvailabilitySlotProps> = ({
  selectedDate,
  slotsForSelectedDate,
  handleSlotClick,
  selectedSlot,
  Loading,
  handleBookAppointment
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const openConfirmDialog = () => setIsConfirmDialogOpen(true);
  const closeConfirmDialog = () => setIsConfirmDialogOpen(false);

  const handleConfirmAppointment = () => {
    handleBookAppointment();
    closeConfirmDialog();
  };

  // Function to convert time string into a comparable format (e.g., "14:00" to 14*60 + 0 = 840)
  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Sort the slots based on the time in ascending order
  const sortedSlots = slotsForSelectedDate
    ? slotsForSelectedDate.sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time))
    : [];

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case "ADDED":
        return "bg-gray-300";
      case "PENDING":
        return "bg-yellow-300";
      case "CONFIRM":
        return "bg-green-300";
      case "CANCEL":
        return "bg-gray-300";
      default:
        return "";
    }
  };

  // console.log("selectedSlot", selectedSlot)

  return (
    <div className="w-full">
      <div className="bg-white w-full p-6 shadow-lg rounded-md border border-gray-200 flex flex-col">
        <h4 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">
          Selected Date:{" "}
          <span className="font-medium text-gray-800">
            {selectedDate ? selectedDate.toDateString() : "No date selected"}
          </span>
        </h4>
        {/* Display Slots for Selected Date */}
        <div className="mt-2">
          <h5 className="text-lg font-medium mb-2">Select your preferred time:</h5>
          {sortedSlots && sortedSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2 cursor-pointer overflow-y-auto">
              {sortedSlots.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => handleSlotClick(slot)}
                  className={`flex items-center gap-1 rounded-md w-fit p-2  ${slot.status === "CONFIRM" ? 'cursor-not-allowed' : 'cursor-pointer'} ${slot === selectedSlot
                    ? 'border-2 border-blue-500 bg-blue-300'
                    : getSlotStatusColor(slot.status)
                    }`}
                >
                  <p>{slot.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No slots available for this date</p>
          )}
        </div>

        {Loading && <>Booking...</>}

        {selectedSlot && selectedSlot.status != "CONFIRM" && (
          <button
            onClick={openConfirmDialog}
            className="mt-4 bg-ColorOne rounded-lg max-w-[200px] py-4 px-2 text-white font-semibold "
          >
            Book Appointment
          </button>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={isConfirmDialogOpen}
          onClose={closeConfirmDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogContent>
            <p>
              Do you want to book an appointment on{' '}
              <strong>{new Date(selectedDate || '').toLocaleDateString()}</strong> at{' '}
              <strong>{selectedSlot ? selectedSlot.time : ''}</strong>?
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDialog} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleConfirmAppointment} variant="contained" color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ProviderAvailabilitySlot;
