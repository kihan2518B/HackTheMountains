import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Appointment, TypeUser } from '@/types';
import { CircularProgress, Button, Dialog, DialogContent } from '@mui/material';
import { toast } from 'react-toastify';

interface BookedAppointmentsProps {
  providerID: string;
  appointments: Appointment[];
  loading: boolean;
  users: { [key: string]: TypeUser };
  handleAppointmentClick: (appointment: Appointment, action: string) => void;
  selectedAppointment: Appointment;
  selectedAction: string;
  showStatusConfirmDialog: boolean;
  handleAppointmentStatusUpdate: () => void;
  handleAppointmentStatusCancel: () => void;
  getSlotStatusColor: (status: string) => string;
}

const BookedAppointments: React.FC<BookedAppointmentsProps> = ({
  providerID,
  appointments,
  loading,
  users,
  handleAppointmentClick,
  selectedAppointment,
  selectedAction,
  showStatusConfirmDialog,
  handleAppointmentStatusUpdate,
  handleAppointmentStatusCancel,
  getSlotStatusColor,
}) => {
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const today = getTodayDate();
  const upcomingAppointments = appointments.filter((appointment) => appointment.date > today);
  const todayAppointments = appointments.filter((appointment) => appointment.date === today);
  const pastAppointments = appointments.filter((appointment) => appointment.date < today);

  // Function to check if "Service Completed" button should be shown.
  const shouldShowServiceCompletedButton = (appointment: Appointment) => {
    const appointmentTime = new Date(`${appointment.date}T${appointment.time}`);
    const currentTime = new Date();
    const timeDiffMinutes = (currentTime.getTime() - appointmentTime.getTime()) / (1000 * 60);
    return timeDiffMinutes >= 1;
  };


  const handleServiceCompleted = async (appointment: Appointment) => {
    try {
      // Make the API call to update the balance in the provider's collection.
       const respose = await fetch('/api/provider/updateBalance', {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerID, increment: 50, appointmentID: appointment.id })        
      });

      // After updating, mark the service as completed in the state.
      const result = await respose.json();
      
      if(respose.ok){
        toast.success(result.message);
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const renderAppointments = (appointmentList: Appointment[]) => (
    <>
      {appointmentList.length > 0 ? (
        appointmentList.map((appointment) => {
          const user = users[appointment.userID];
          const isToday = appointment.date === today;
          const isPast = appointment.date < today;

          return (
            <div
              key={appointment.id}
              className={`appointment-card max-w-[400px] p-4 shadow-md rounded-lg ${isToday ? 'border-[#00A8E8]' : 'border-[#36454F]'
                } border-2 bg-white`}
            >
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold text-ColorTwo">Appointment</p>
                <p>Date: <span className=''>{appointment.date}</span></p>
                <p>Time: <span className=''>{appointment.time}</span></p>
                <div className="flex items-center">
                  <p>Status: </p>
                  <span
                    className={`pt-0.5 px-2 mx-1 rounded-sm ${getSlotStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
                {user ? (
                  <>
                    <p>Client: {user.name}</p>
                  </>
                ) : (
                  <p>Loading client details...</p>
                )}
              </div>

              {!isPast && (
                <div className="flex justify-between mt-4 gap-2">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleAppointmentClick(appointment, 'CONFIRM')}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-[#FF5733] hover:bg-[#D94323] text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleAppointmentClick(appointment, 'CANCEL')}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Display "Service Completed" button only if 10 minutes have passed */}
              {appointment.status === 'CONFIRM' && shouldShowServiceCompletedButton(appointment) && !appointment.isServiceCompleted && (
                <div className="mt-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleServiceCompleted(appointment)}
                  >
                    Service Completed
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p>No appointments available.</p>
      )}
    </>
  );

  return (
    <div className="appointments-container flex flex-col lg:flex-wrap p-4">
      <h2 className="text-2xl font-bold mb-4 text-ColorTwo">Appointments</h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <CircularProgress />
        </div>
      ) : (
        <Tab.Group>
          <Tab.List className="flex p-1 space-x-1 bg-BGOne rounded-xl overflow-auto">
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 font-medium text-ColorThree ${selected ? 'bg-white shadow' : 'text-ColorThree hover:bg-white/80 '
                } rounded-lg focus:outline-none`
              }
            >
              Today
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 font-medium text-ColorThree ${selected ? 'bg-white shadow' : 'text-ColorThree hover:bg-white/80 '
                } rounded-lg focus:outline-none`
              }
            >
              Upcoming
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 font-medium text-ColorThree ${selected ? 'bg-white shadow' : 'text-ColorThree hover:bg-white/80 '
                } rounded-lg focus:outline-none`
              }
            >
              Past
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4 flex overflow-auto">
            <Tab.Panel className="flex flex-wrap gap-4">
              {renderAppointments(todayAppointments)}
            </Tab.Panel>
            <Tab.Panel className="flex flex-wrap gap-4">
              {renderAppointments(upcomingAppointments)}
            </Tab.Panel>
            <Tab.Panel className="flex flex-wrap gap-4">
              {renderAppointments(pastAppointments)}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}

      {/* Confirm Dialog Component */}
      <ConfirmDialog
        open={showStatusConfirmDialog}
        selectedAppointment={selectedAppointment}
        selectedAction={selectedAction}
        users={users}
        handleAppointmentStatusUpdate={handleAppointmentStatusUpdate}
        handleAppointmentStatusCancel={handleAppointmentStatusCancel}
      />
    </div>
  );
};

export default BookedAppointments;

interface ConfirmDialogProps {
  open: boolean;
  selectedAppointment: Appointment;
  selectedAction: string;
  users: { [key: string]: TypeUser };
  handleAppointmentStatusUpdate: () => void;
  handleAppointmentStatusCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  selectedAppointment,
  selectedAction,
  users,
  handleAppointmentStatusUpdate,
  handleAppointmentStatusCancel,
}) => {
  return (
    <Dialog open={open} onClose={handleAppointmentStatusCancel} fullWidth maxWidth="sm">
      <DialogContent>
        {selectedAppointment && (
          <div className="p-4">
            <p className="mb-4">
              Are you sure you want to update the appointment status to{" "}
              <span className="font-semibold text-[#005E82]">{selectedAction?.toLowerCase()}</span>?
            </p>
            <p className="mb-2">Date: {selectedAppointment.date}</p>
            <p className="mb-2">Time: {selectedAppointment.time}</p>
            <p className="mb-4">Client Name: {users[selectedAppointment.userID]?.name}</p>
            <div className="flex justify-end space-x-4">
              <Button variant="contained" color="success" onClick={handleAppointmentStatusUpdate}>
                Yes
              </Button>
              <Button variant="contained" color="error" onClick={handleAppointmentStatusCancel}>
                No
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
