import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { dates } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: 'Valid dates array is required.' });
    }

    try {
      const results = await Promise.all(
        dates.map(async ({ date, festivalName, price }) => {
          try {
            const newDate = new Date(date);
            if (isNaN(newDate.getTime())) {
              return { success: false, date, error: 'Invalid date format' };
            }

            const validPrice = price || 100.00;
            
            const created = await prisma.specialDate.create({
              data: {
                date: newDate,
                festivalName: festivalName?.trim() || null,
                price: validPrice,
              },
            });
            return { success: true, date, created };
          } catch (error: any) {
            if (error.code === 'P2002') {
              return { success: false, date, error: 'Date already exists' };
            }
            return { success: false, date, error: 'Internal server error' };
          }
        })
      );

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return res.status(200).json({
        message: `Successfully added ${successful.length} dates${failed.length > 0 ? `, ${failed.length} dates failed` : ''}`,
        successful,
        failed
      });
    } catch (error) {
      console.error('Error adding special dates:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } 
  
  else if (req.method === 'GET') {
    try {
      const specialDates = await prisma.specialDate.findMany({
        select: {
          id: true,
          date: true,
          festivalName: true,
          price: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      res.status(200).json(specialDates);
    } catch (error) {
      console.error('Error fetching special dates:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } 
  
  else if (req.method === 'DELETE') {
    const { dates } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: 'Valid dates array is required for deletion.' });
    }

    try {
      await prisma.specialDate.deleteMany({
        where: {
          date: {
            in: dates.map(d => new Date(d))
          }
        }
      });

      return res.status(200).json({ 
        message: `Successfully deleted ${dates.length} special date(s).`
      });
    } catch (error) {
      console.error('Error deleting special dates:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}