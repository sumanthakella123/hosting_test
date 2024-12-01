// pages/api/bookings.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { deity } = req.query;

    if (!deity || typeof deity !== 'string') {
      res.status(400).json({ message: 'Deity parameter is required and must be a string.' });
      return;
    }

    try {
      // Fetch bookings for the specified deity
      const bookings = await prisma.vastraSevaBooking.findMany({
        where: {
          deity,
        },
        select: {
          date: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
