import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Calendar from '../../components/Calendar';
import { isSameDay } from 'date-fns';

interface SpecialDateInfo {
  date: Date;
  festivalName: string | null;
}

export default function CalendarView() {
  const router = useRouter();
  const { deity } = router.query;
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDateInfo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const MAX_NORMAL_DAYS = 3;
  const MAX_SPECIAL_DAYS = 1;

  useEffect(() => {
    // Fetch booked dates from the server for the selected deity
    const fetchBookedDates = async () => {
      if (!deity || Array.isArray(deity)) return;
      try {
        const response = await fetch(`/api/bookings?deity=${deity}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booked dates.');
        }
        const data = await response.json();
        const dates = data.map((item: { date: string }) => new Date(item.date));
        setBookedDates(dates);
      } catch (error) {
        console.error('Error fetching booked dates:', error);
        setErrorMessage('Failed to load booked dates. Please try again later.');
      }
    };

    // Fetch special dates with festival names from the server
    const fetchSpecialDates = async () => {
      try {
        const response = await fetch('/api/special-dates');
        if (!response.ok) {
          throw new Error('Failed to fetch special dates.');
        }
        const data = await response.json();
        const dates = data.map((item: { date: string; festivalName: string | null }) => ({
          date: new Date(item.date),
          festivalName: item.festivalName
        }));
        setSpecialDates(dates);
      } catch (error) {
        console.error('Error fetching special dates:', error);
        setErrorMessage('Failed to load special dates. Please try again later.');
      }
    };

    fetchBookedDates();
    fetchSpecialDates();
  }, [deity]);

  const isSpecialDate = (date: Date): boolean => {
    return specialDates.some((specialDate) => isSameDay(specialDate.date, date));
  };

  const getFestivalName = (date: Date): string | null => {
    const specialDate = specialDates.find((sd) => isSameDay(sd.date, date));
    return specialDate?.festivalName || null;
  };

  // Create dayTexts object for the Calendar component
  const dayTexts = specialDates.reduce((acc: { [key: string]: string }, curr) => {
    if (curr.festivalName) {
      acc[curr.date.toISOString().split('T')[0]] = curr.festivalName;
    }
    return acc;
  }, {});

  const handleSelectDate = (date: Date) => {
    const dateString = date.toDateString();
    const isAlreadySelected = selectedDates.some(
      (selectedDate) => selectedDate.toDateString() === dateString
    );

    if (isAlreadySelected) {
      setSelectedDates((prevDates) =>
        prevDates.filter((d) => d.toDateString() !== dateString)
      );
      setErrorMessage('');
    } else {
      const special = isSpecialDate(date);
      const specialCount = selectedDates.filter((d) => isSpecialDate(d)).length;
      const normalCount = selectedDates.length - specialCount;

      if (special && specialCount >= MAX_SPECIAL_DAYS) {
        setErrorMessage(`You can only select ${MAX_SPECIAL_DAYS} special day.`);
        return;
      }

      if (!special && normalCount >= MAX_NORMAL_DAYS) {
        setErrorMessage(`You can only select ${MAX_NORMAL_DAYS} normal days.`);
        return;
      }

      setSelectedDates((prevDates) => [...prevDates, date]);
      setErrorMessage('');
    }
  };

  const handleRemoveDate = (date: Date) => {
    const dateString = date.toDateString();
    setSelectedDates((prevDates) =>
      prevDates.filter((d) => d.toDateString() !== dateString)
    );
    setErrorMessage('');
  };

  const getPriceForDate = (date: Date): number => {
    return isSpecialDate(date) ? 100 : 50;
  };

  const totalAmount = selectedDates.reduce((total, date) => {
    return total + getPriceForDate(date);
  }, 0);

  const handleProceed = () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one date to proceed.');
      return;
    }

    const dateStrings = selectedDates.map((date) => date.toISOString());
    router.push({
      pathname: '/vastra-seva/details',
      query: { deity, dates: dateStrings },
    });
  };

  return (
    <div className="h-screen p-6 bg-gray-50">
      <div className="h-full max-w-7xl mx-auto border border-orange-500 rounded-lg shadow-lg bg-white p-6 overflow-hidden">
        <div className="text-center mb-4">
          <div className="bg-orange-50 py-3 rounded-lg border border-orange-200 shadow-sm">
            <div className="flex justify-center items-center gap-4">
              <h2 className="text-2xl font-semibold text-orange-600">
                Vastra Seva Calendar
              </h2>
              <div className="h-6 w-px bg-orange-300"></div>
              <div className="bg-orange-100 px-4 py-1 rounded-full shadow-sm">
                <p className="text-orange-800 font-medium">Select Dates for {deity}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-2/3 bg-orange-50 rounded-lg p-2 border border-orange-200 mx-4 my-2 h-full">
            <div className="rounded-lg overflow-hidden p-2 border border-orange-100 h-full">
              <Calendar
                bookedDates={bookedDates}
                selectedDates={selectedDates}
                onSelectDate={handleSelectDate}
                isSpecialDate={isSpecialDate}
                dayTexts={dayTexts}
              />
            </div>
          </div>
          <div className="w-1/3">
            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200 mx-4 my-2 h-[510px] flex flex-col">
              <h2 className="text-xl font-semibold text-orange-800 mb-3">Selected Dates</h2>
              <div className="space-y-2 overflow-y-auto flex-grow">
                {selectedDates.length === 0 ? (
                  <p className="text-gray-500">No dates selected.</p>
                ) : (
                  <ul>
                    {selectedDates.map((date, index) => (
                      <li
                        key={index}
                        className="flex flex-col bg-white p-3 rounded-md border border-orange-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{date.toDateString()}</span>
                            {isSpecialDate(date) && getFestivalName(date) && (
                              <p className="text-sm text-purple-600 font-medium mt-1">
                                {getFestivalName(date)}
                              </p>
                            )}
                            <p className="text-sm text-orange-600 mt-1">
                              {isSpecialDate(date) ? 'Special Day' : 'Normal Day'} - ${getPriceForDate(date)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveDate(date)}
                            className="text-red-500 hover:text-red-700 font-bold text-xl"
                            aria-label={`Remove ${date.toDateString()}`}
                          >
                            &times;
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-orange-200 pt-3 bg-orange-50">
                <div className="text-xl font-semibold text-orange-800">
                  Total Amount: ${totalAmount}
                </div>
                {errorMessage && (
                  <div className="mt-2 text-red-500 text-sm">{errorMessage}</div>
                )}
                <button
                  onClick={handleProceed}
                  className={`mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg text-lg ${
                    selectedDates.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'transition duration-300'
                  }`}
                  disabled={selectedDates.length === 0}
                >
                  Proceed to Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}