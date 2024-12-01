// pages/manager/dashboard/vastra-seva/manager-calendar.tsx

import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import DashboardLayout from '../../../../components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import { Calendar as CalendarIcon, Plus, Trash2, X, CheckCircle, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import styled from 'styled-components';
import 'react-calendar/dist/Calendar.css';
import 'react-toastify/dist/ReactToastify.css';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

const StyledCalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: white;
    border: none;
    font-family: Arial, sans-serif;
    line-height: 1.125em;
  }

  .react-calendar__navigation {
    margin-bottom: 1rem;
    height: 44px;
  }

  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 16px;
    color: #1a56db;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #e6e6e6;
    border-radius: 8px;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.85em;
    color: #4b5563;
    padding-bottom: 0.5rem;
  }

  .react-calendar__month-view__days__day {
    padding: 0.75rem 0;
    border-radius: 8px;
  }

  .react-calendar__tile {
    max-width: 100%;
    padding: 0.75rem 0.5rem;
    background: none;
    text-align: center;
    line-height: 16px;
    font-size: 0.875rem;
    border-radius: 8px;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #e5edff;
    color: #1a56db;
  }

  .react-calendar__tile--now {
    background: #f3f4f6;
    font-weight: bold;
  }

  .react-calendar__tile--active {
    background: #3b82f6 !important;
    color: white !important;
    font-weight: bold;
  }

  .special-date {
    background-color: #93c5fd;
    color: #1e40af;
    font-weight: 500;
  }

  .selected-date {
    background: #2563eb !important;
    color: white !important;
    font-weight: bold;
    transform: scale(0.95);
    transition: all 0.2s ease;
  }

  .special-date.selected-date {
    background: #1d4ed8 !important;
    box-shadow: 0 0 0 2px #93c5fd;
  }

  .react-calendar__month-view__days__day--weekend {
    color: #dc2626;
  }
`;

interface SpecialDate {
  id: number;
  date: string;
  festivalName: string | null;
  price: number;
}

interface SelectedDate {
  date: Date;
  festivalName: string;
  price: number;
}

const EnhancedCalendar = ({
  selectedDates,
  specialDates,
  onDateSelection,
  className,
}: {
  selectedDates: SelectedDate[];
  specialDates: SpecialDate[];
  onDateSelection: (date: Date) => void;
  className?: string;
}) => {
  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const isSpecialDate = specialDates?.some(
      (specialDate) => specialDate.date.split('T')[0] === dateStr
    );
    const isSelectedDate = selectedDates?.some(
      (selectedDate) => selectedDate.date.toISOString().split('T')[0] === dateStr
    );

    let classes = [];
    if (isSpecialDate) classes.push('special-date');
    if (isSelectedDate) classes.push('selected-date');
    return classes.join(' ');
  };

  return (
    <StyledCalendarWrapper className={className}>
      <Calendar
        onClickDay={onDateSelection}
        tileClassName={tileClassName}
        className="shadow-lg"
        minDetail="month"
        locale="en-US"
        calendarType="gregory"
      />
    </StyledCalendarWrapper>
  );
};

export default function ManagerCalendar() {
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteDates, setSelectedDeleteDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddDates, setSelectedAddDates] = useState<SelectedDate[]>([]);

  useEffect(() => {
    fetchSpecialDates();
  }, []);

  const fetchSpecialDates = async () => {
    try {
      const response = await axios.get('/api/special-dates');
      setSpecialDates(response.data);
    } catch (err) {
      console.error('Error fetching special dates:', err);
      toast.error('Failed to load special dates.');
    }
  };

  const openAddModal = () => {
    setSelectedAddDates([]);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedAddDates([]);
  };

  const openDeleteModal = () => {
    setSelectedDeleteDates([]);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDeleteDates([]);
  };

  const handleDeleteDateSelection = (dateStr: string) => {
    setSelectedDeleteDates(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleDeleteSpecialDates = async () => {
    if (selectedDeleteDates.length === 0) {
      toast.error('Please select at least one date to delete.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.delete('/api/special-dates', {
        data: { dates: selectedDeleteDates }
      });

      toast.success(response.data.message);
      fetchSpecialDates();
      closeDeleteModal();
    } catch (err: any) {
      console.error('Error deleting special dates:', err);
      toast.error(err.response?.data?.message || 'Failed to delete special dates.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialDates = async () => {
    if (selectedAddDates.length === 0) {
      toast.error('Please select at least one date.');
      return;
    }
  
    setLoading(true);
    try {
      // Map the dates and ensure price is included
      const dates = selectedAddDates.map(({ date, festivalName, price }) => {
        // Log the price to debug
        console.log('Date price before sending:', price);
        
        return {
          date: date.toISOString().split('T')[0],
          festivalName: festivalName.trim() || null,
          price: Number(price) || 100.00  // Ensure price is a number
        };
      });
  
      console.log('Dates being sent:', dates); // Debug log
  
      const response = await axios.post('/api/special-dates', { dates });
      
      toast.success(response.data.message);
      await fetchSpecialDates();
      setIsFestivalModalOpen(false);
      setSelectedAddDates([]);
    } catch (err: any) {
      console.error('Error adding special dates:', err);
      toast.error(err.response?.data?.message || 'Failed to add special dates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manager Calendar</h1>
              <p className="mt-2 text-gray-600">Manage special dates, festivals, and pricing</p>
            </div>
            <div className="hidden md:block">
              <CalendarIcon className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>
  
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Special Dates</span>
          </button>
          
          <button
            onClick={openDeleteModal}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Special Dates</span>
          </button>
        </div>
  
        {/* Current Special Dates Display */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Special Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialDates.map((date) => (
              <div 
                key={date.id} 
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(date.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    {date.festivalName && (
                      <p className="text-blue-600 mt-1">{date.festivalName}</p>
                    )}
                  </div>
                  <div className="text-green-600 font-semibold">
                    ${date.price?.toFixed(2) || '100.00'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        <ToastContainer />
  
        {/* Add Special Dates Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onRequestClose={closeAddModal}
          className="max-w-xl mx-auto mt-20 bg-white rounded-xl shadow-2xl"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Add Special Dates</h2>
                <p className="mt-2 text-gray-600">
                  Select dates to mark as special ({selectedAddDates.length} selected)
                </p>
              </div>
              <button 
                onClick={closeAddModal} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <EnhancedCalendar
                selectedDates={selectedAddDates}
                specialDates={specialDates}
                onDateSelection={(date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const exists = selectedAddDates.find(
                    d => d.date.toISOString().split('T')[0] === dateStr
                  );
                  
                  if (exists) {
                    setSelectedAddDates(prev => 
                      prev.filter(d => d.date.toISOString().split('T')[0] !== dateStr)
                    );
                  } else {
                    setSelectedAddDates(prev => [...prev, { 
                      date, 
                      festivalName: '',
                      price: 100.00 // Default price
                    }]);
                  }
                }}
              />
            </div>
  
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-blue-200"></div>
                <span className="text-sm text-gray-600">Special Date</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm text-gray-600">Selected Date</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gray-100"></div>
                <span className="text-sm text-gray-600">Today</span>
              </div>
            </div>
  
            <div className="flex justify-between">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedAddDates.length > 0) {
                    setIsAddModalOpen(false);
                    setIsFestivalModalOpen(true);
                  } else {
                    toast.error('Please select at least one date.');
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Next: Add Details</span>
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Modal>
  
        {/* Festival Details Modal */}
        <Modal
          isOpen={isFestivalModalOpen}
          onRequestClose={() => {
            setIsFestivalModalOpen(false);
            setIsAddModalOpen(true);
          }}
          className="max-w-xl mx-auto mt-20 bg-white rounded-xl shadow-2xl"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Enter Date Details</h2>
                <p className="mt-2 text-gray-600">Add festival names and set prices</p>
              </div>
              <button 
                onClick={() => {
                  setIsFestivalModalOpen(false);
                  setIsAddModalOpen(true);
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
  
            <div className="max-h-96 overflow-y-auto space-y-4 mb-6 pr-2">
              {selectedAddDates.map((dateObj, index) => (
                <div 
                  key={dateObj.date.toISOString()} 
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-gray-700">
                      {dateObj.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedAddDates(prev => 
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Festival Name
                      </label>
                      <input
                        type="text"
                        value={dateObj.festivalName}
                        onChange={(e) => {
                          setSelectedAddDates(prev => prev.map((d, i) => 
                            i === index ? { ...d, festivalName: e.target.value } : d
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter festival name (optional)"
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Date Price
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-500 text-lg mr-2">$</span>
                        <input
                          type="number"
                          value={dateObj.price || 100}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 100;
                            setSelectedAddDates(prev => prev.map((d, i) => 
                              i === index ? { ...d, price: value } : d
                            ));
                          }}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter price"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsFestivalModalOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleAddSpecialDates}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Save Special Dates</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
          
        {/* Delete Special Dates Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          className="max-w-xl mx-auto mt-20 bg-white rounded-xl shadow-2xl"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Delete Special Dates</h2>
                <p className="mt-2 text-gray-600">Select dates to remove</p>
              </div>
              <button onClick={closeDeleteModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
  
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200">
                {specialDates.map((specialDate) => (
                  <li key={specialDate.id} className="py-3 first:pt-0 last:pb-0">
                    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedDeleteDates.includes(specialDate.date)}
                          onChange={() => handleDeleteDateSelection(specialDate.date)}
                          className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                        />
                        <div>
                          <span className="text-gray-700 font-medium">
                            {new Date(specialDate.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {specialDate.festivalName && (
                            <span className="ml-2 text-blue-600">
                              ({specialDate.festivalName})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">
                        ${specialDate.price?.toFixed(2) || '100.00'}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
  
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSpecialDates}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Selected</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  </DashboardLayout>
);

}