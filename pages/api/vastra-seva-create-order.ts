// pages/api/vastra-seva-create-order.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { isSameDay, isBefore, startOfDay } from 'date-fns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    if (
      !deity ||
      !Array.isArray(dates) ||
      dates.length === 0 ||
      !firstName ||
      !lastName ||
      !email ||
      !phone
    ) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }

    // Check if any date is in the past
    const today = startOfDay(new Date());
    const invalidDates = dates.filter((dateStr: string) =>
      isBefore(new Date(dateStr), today)
    );

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

      // Calculate total amount and prepare bookings data
      let totalAmount = 0;
      const bookingsData = [];

      for (const dateStr of dates) {
        const bookingDate = new Date(dateStr);
        const isSpecial = specialDatesArray.some((sdDate) =>
          isSameDay(sdDate, bookingDate)
        );
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
          throw new Error(
            `Date ${bookingDate.toDateString()} is already booked.`
          );
        }

        bookingsData.push({
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
          status: 'pending',
        });
      }

      // Create the order and associated bookings
      const order = await prisma.vastraSevaOrder.create({
        data: {
          totalAmount,
          status: 'pending',
          bookings: {
            create: bookingsData,
          },
        },
        include: {
          bookings: true,
        },
      });

      res.status(200).json({
        message: 'Order created successfully.',
        orderId: order.id,
        totalAmount: order.totalAmount,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res
        .status(500)
        .json({ message: error.message || 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res
      .status(405)
      .json({ message: `Method ${req.method} not allowed.` });
  }
}
