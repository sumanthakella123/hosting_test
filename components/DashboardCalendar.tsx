import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

type BookingData = {
  date: string;
  bookings: {
    vastraSeva: number;
    seva: number;
    aiBooking: number;
  };
};

type DashboardCalendarProps = {
  initialBookings: BookingData[];
};

const DashboardCalendar = ({ initialBookings }: DashboardCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<BookingData[]>(initialBookings);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Function to fetch bookings for a specific month
  const fetchMonthBookings = async (date: Date) => {
    const start = startOfMonth(date).toISOString();
    const end = endOfMonth(date).toISOString();
    
    try {
      const response = await fetch(`/api/manager/calendar-bookings?start=${start}&end=${end}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch new data when month changes
  useEffect(() => {
    if (isSameMonth(currentDate, new Date())) {
      // Use initial data for current month
      setBookings(initialBookings);
    } else {
      // Fetch data for other months
      fetchMonthBookings(currentDate);
    }
  }, [currentDate]);

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.find(booking => booking.date === dateStr)?.bookings || {
      vastraSeva: 0,
      seva: 0,
      aiBooking: 0,
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gray-800 p-4 rounded-t-lg">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2 text-xl font-bold">
            <CalendarIcon className="h-6 w-6" />
            Temple Bookings Calendar
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              ←
            </button>
            <h2 className="text-xl font-bold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center font-semibold p-2 text-gray-600"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayBookings = getBookingsForDate(day);
            const hasBookings = Object.values(dayBookings).some(count => count > 0);
            
            return (
              <div
                key={day.toString()}
                className={`
                  min-h-24 p-2 border rounded-lg transition-all
                  ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                  ${isToday(day) ? 'border-blue-500 border-2' : 'border-gray-200'}
                  ${hasBookings ? 'hover:shadow-lg' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`
                      text-sm font-medium
                      ${isToday(day) ? 'bg-blue-500 text-white rounded-full p-1' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  {hasBookings && (
                    <div className="mt-1 space-y-1">
                      {dayBookings.vastraSeva > 0 && (
                        <div className="text-xs p-1 rounded-md bg-gray-700 text-white">
                          Vastra Seva: {dayBookings.vastraSeva}
                        </div>
                      )}
                      {dayBookings.seva > 0 && (
                        <div className="text-xs p-1 rounded-md bg-gray-800 text-white">
                          Seva: {dayBookings.seva}
                        </div>
                      )}
                      {dayBookings.aiBooking > 0 && (
                        <div className="text-xs p-1 rounded-md bg-gray-900 text-white">
                          AI Booking: {dayBookings.aiBooking}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
