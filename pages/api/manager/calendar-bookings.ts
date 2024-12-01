// pages/api/manager/calendar-bookings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const [vastraSevaBookings, sevaBookings, aiBookings] = await Promise.all([
      prisma.vastraSevaBooking.groupBy({
        by: ['date'],
        _count: {
          id: true,
        },
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.sevaBooking.groupBy({
        by: ['date'],
        _count: {
          id: true,
        },
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.aI_Booking.groupBy({
        by: ['createdAt'],
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    // Create a map to store all bookings by date
    const bookingsByDate = new Map();

    // Helper function to initialize booking counts for a date
    const getInitialBookingCounts = () => ({
      vastraSeva: 0,
      seva: 0,
      aiBooking: 0,
    });

    // Process all bookings
    vastraSevaBookings.forEach((booking) => {
      const dateStr = booking.date.toISOString().split('T')[0];
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, getInitialBookingCounts());
      }
      bookingsByDate.get(dateStr).vastraSeva = booking._count.id;
    });

    sevaBookings.forEach((booking) => {
      const dateStr = booking.date.toISOString().split('T')[0];
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, getInitialBookingCounts());
      }
      bookingsByDate.get(dateStr).seva = booking._count.id;
    });

    aiBookings.forEach((booking) => {
      const dateStr = booking.createdAt.toISOString().split('T')[0];
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, getInitialBookingCounts());
      }
      bookingsByDate.get(dateStr).aiBooking = booking._count.id;
    });

    // Convert map to array for response
    const formattedBookings = Array.from(bookingsByDate.entries()).map(([date, bookings]) => ({
      date,
      bookings,
    }));

    return res.status(200).json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}