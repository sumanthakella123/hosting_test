// components/Calendar.tsx

import React from 'react';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isBefore,
  startOfDay,
} from 'date-fns';

interface CalendarProps {
  bookedDates: Date[];
  selectedDates: Date[];
  onSelectDate: (date: Date) => void;
  isSpecialDate: (date: Date) => boolean;
  dayTexts?: { [key: string]: string };
}

const Calendar: React.FC<CalendarProps> = ({
  bookedDates = [],
  selectedDates = [],
  onSelectDate,
  isSpecialDate,
  dayTexts = {},
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="text-2xl font-semibold text-gray-700 hover:text-gray-900"
        >
          &#8592;
        </button>
        <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={nextMonth}
          className="text-2xl font-semibold text-gray-700 hover:text-gray-900"
        >
          &#8594;
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'E'; // Short day format, e.g., 'Mon'

    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-gray-700">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dateFormat = 'd';
    const rows = [];

    let days = [];
    let day = startDate;

    const today = startOfDay(new Date());

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;

        const formattedDate = format(day, dateFormat);

        // Determine if the day is in the past
        const isPast = isBefore(day, today);

        // Check if the day is booked
        const isBooked = bookedDates.some((bookedDate) =>
          isSameDay(bookedDate, day)
        );

        // Check if the day is selected
        const isSelected = selectedDates.some((selectedDate) =>
          isSameDay(selectedDate, day)
        );

        // Check if the day is special
        const special = isSpecialDate(day);

        // Check if the day is in the current month
        const inCurrentMonth = isSameMonth(day, monthStart);

        // Get any custom text for the day
        const dayText = dayTexts[day.toDateString()];

        // Determine class names based on the state of the day
        let cellClass = 'p-4 text-center border-2 border-gray-200';

        if (!inCurrentMonth) {
          cellClass += ' text-gray-400';
        }

        if (isPast) {
          cellClass += ' bg-gray-200 cursor-not-allowed';
        } else if (isBooked) {
          cellClass += ' bg-red-300 cursor-not-allowed';
        } else if (isSelected) {
          // All selected dates, regardless of special or normal, are blue
          cellClass += ' bg-blue-400 text-white';
        } else {
          // Available dates: green for normal, orange for special
          cellClass += special
            ? ' bg-orange-300 hover:bg-orange-400 cursor-pointer'
            : ' bg-green-300 hover:bg-green-400 cursor-pointer';
        }

        days.push(
          <div
            className={cellClass}
            key={day.toISOString()} // Use ISO string as key for uniqueness
            onClick={() => {
              if (!isPast && !isBooked && inCurrentMonth) {
                onSelectDate(cloneDay);
              }
            }}
          >
            <div className="text-lg">{formattedDate}</div>
            {dayText && <div className="text-sm">{dayText}</div>}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const renderLegend = () => {
    return (
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-orange-300 mr-2 border border-gray-200"></div>
          <span>Special Date</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-300 mr-2 border border-gray-200"></div>
          <span>Available Date</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-300 mr-2 border border-gray-200"></div>
          <span>Booked Date</span>
        </div>
      </div>
    );
  };
  

  return (
    <div className="w-full lg:max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8 border-2 border-gray-300">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderLegend()}
    </div>
  );
};

export default Calendar;
