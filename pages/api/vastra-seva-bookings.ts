// pages/api/vastra-seva-bookings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { isSameDay, isBefore, startOfDay } from 'date-fns';
import { sendVastraSevaConfirmation } from '../../utils/vastra-mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      deity,
      dates,
      firstName,
      lastName,
      email,
      phone,
      gotram,
      requests,
    } = req.body;

    // Validate required fields
    if (!deity || !Array.isArray(dates) || dates.length === 0 || !firstName || !lastName || !email || !phone) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }

    // Check if any date is in the past
    const today = startOfDay(new Date());
    const invalidDates = dates.filter((dateStr: string) => isBefore(new Date(dateStr), today));

    if (invalidDates.length > 0) {
      res.status(400).json({ message: 'Cannot book dates in the past.' });
      return;
    }

    try {
      // Fetch special dates from the database
      const specialDates = await prisma.specialDate.findMany({
        select: { date: true },
      });

      const specialDatesArray = specialDates.map((sd) => sd.date);

      // Calculate total amount and track bookings
      let totalAmount = 0;
      const bookings = [];

      // Iterate over each date and create a booking
      const bookingPromises = dates.map(async (dateStr: string) => {
        const bookingDate = new Date(dateStr);
        const isSpecial = specialDatesArray.some((sdDate) => isSameDay(sdDate, bookingDate));
        const amount = isSpecial ? 100 : 50;
        totalAmount += amount;

        // Check if the date is already booked
        const existingBooking = await prisma.vastraSevaBooking.findFirst({
          where: {
            deity,
            date: bookingDate,
          },
        });

        if (existingBooking) {
          throw new Error(`Date ${bookingDate.toDateString()} is already booked.`);
        }

        // Create the booking
        const booking = await prisma.vastraSevaBooking.create({
          data: {
            deity,
            date: bookingDate,
            specialDay: isSpecial,
            amount,
            firstName,
            lastName,
            email,
            phone,
            gotram: gotram || '',
            requests: requests || '',
          },
        });
        
        bookings.push(booking);
        return booking;
      });

      // Execute all booking creations
      await Promise.all(bookingPromises);

      // Send confirmation email
      await sendVastraSevaConfirmation({
        deity,
        dates,
        firstName,
        lastName,
        email,
        phone,
        gotram,
        requests,
        specialDates: specialDatesArray,
        totalAmount,
      });

      res.status(200).json({ 
        message: 'Booking successful. A confirmation email has been sent to your email address.',
        totalAmount,
        bookings 
      });
    } catch (error: any) {
      console.error('Error creating bookings:', error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}