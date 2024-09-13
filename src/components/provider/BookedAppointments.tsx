import React from "react";
import {
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import { Appointment, TypeUser } from "@/types";
import classNames from 'classnames';
import { blue } from "@mui/material/colors";

interface BookedAppointmentsProps {
  providerID: string;
  appointments: Appointment[];
  loading: boolean;
  showStatusConfirmDialog: boolean;
  users: { [key: string]: TypeUser };
  handleAppointmentClick: (appointment: Appointment, action: string) => void;
  selectedAppointment: Appointment;
  selectedAction: string;
  handleAppointmentStatusUpdate: () => void;
  handleAppointmentStatusCancel: () => void;
  getSlotStatusColor: (status: string) => void;
}

const BookedAppointments: React.FC<BookedAppointmentsProps> = ({
  providerID,
  appointments,
  loading,
  users,
  handleAppointmentClick,
  showStatusConfirmDialog,
  selectedAppointment,
  handleAppointmentStatusUpdate,
  handleAppointmentStatusCancel,
  selectedAction,
  getSlotStatusColor,
}) => {

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
  };

  return (
    <>
      <div className="appointments-container flex flex-col">
        <h2 className="text-xl font-bold mb-4">Appointments</h2>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <CircularProgress />
          </div>
        ) : (
          <div className="appointments flex gap-3 flex-wrap">
            {appointments.length > 0 ? (
              appointments.map((appointment) => {
                const user = users[appointment.userID];
                const isToday = getTodayDate() === appointment.date;
                return (
                  <div
                    key={appointment.id}
                    className={`appointment-card p-3 w-fit shadow-md rounded-lg ${isToday ? "border-blue-300" : "border-gray-300"} border-2 mb-4 bg-white`}
                  >
                    {/* Appointment Details */}
                    <div className="flex flex-col gap-2 mb-4">
                      <p className="text-lg font-semibold">
                        Appointment Details
                      </p>
                      <p>Date: {appointment.date}</p>
                      <p>Time: {appointment.time}</p>
                      <div className="flex items-center"><p>Status:</p><p className={`pt-0.5 px-2 mx-1 rounded-sm ${getSlotStatusColor(appointment.status)}`}>{appointment.status}</p></div>
                      {user ? (
                        <>
                          <p>Client Name: {user.name}</p>
                          <p>Client Email: {user.email}</p>
                        </>
                      ) : (
                        <p>Loading client details...</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-4">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
                        onClick={() =>
                          handleAppointmentClick(appointment, "CONFIRM")
                        }
                      >
                        CONFIRM
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
                        onClick={() =>
                          handleAppointmentClick(appointment, "CANCEL")
                        } // Add this handler if needed
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No appointments found.</p>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={showStatusConfirmDialog}
        onClose={handleAppointmentStatusCancel}
      >
        <DialogContent>
          {selectedAppointment && (
            <div>
              <p>
                Are you sure you want to update the appointment status to{" "}
                {selectedAction?.toLowerCase()}?
              </p>
              <p>Date: {selectedAppointment.date}</p>
              <p>Time: {selectedAppointment.time}</p>
              <p>Client Name: {users[selectedAppointment.userID]?.name}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleAppointmentStatusUpdate}
                >
                  yes
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleAppointmentStatusCancel}
                >
                  no
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookedAppointments;
