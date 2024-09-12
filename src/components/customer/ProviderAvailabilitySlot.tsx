import React, { useState } from 'react';
import { Slot } from '@/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

interface ProviderAvailabilitySlotProps {
  selectedDate: Date;
  slotsForSelectedDate: Slot[] | null;
  handleSlotClick: (slot: Slot) => void;
  selectedSlot: Slot | null; // Added prop to highlight selected slot
  handleBookAppointment: () => void;
}

const ProviderAvailabilitySlot: React.FC<ProviderAvailabilitySlotProps> = ({
  selectedDate,
  slotsForSelectedDate,
  handleSlotClick,
  selectedSlot,
  handleBookAppointment
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const openConfirmDialog = () => setIsConfirmDialogOpen(true);
  const closeConfirmDialog = () => setIsConfirmDialogOpen(false);

  const handleConfirmAppointment = () => {
    handleBookAppointment();
    closeConfirmDialog();
  };

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
                onClick={() => handleSlotClick(slot)}
                className={`flex items-center gap-1 rounded-md w-fit p-2 cursor-pointer ${slot === selectedSlot
                    ? 'border-2 border-red-500 bg-yellow-300'
                    : slot.isBooked
                      ? 'bg-green-300'
                      : 'bg-yellow-300'
                  }`}
              >
                <p>{slot.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No slots Available for this date</p>
        )}
      </div>

      {selectedSlot && !selectedSlot.isBooked && (
        <Button
          onClick={openConfirmDialog}
          variant="contained"
          color="primary"
          className="mt-4"
        >
          Book Appointment
        </Button>
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
  );
};

export default ProviderAvailabilitySlot;
