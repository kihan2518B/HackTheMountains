import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CalendarSectionProps {
  selectedDate: Date;
  handleDateChange: (date: Date | null) => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ selectedDate, handleDateChange }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-md w-full flex flex-col justify-center items-center border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Calendar</h3>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange} // Update selected date on click
        inline
        className="mb-4"
      />
    </div>
  );
};

export default CalendarSection;
