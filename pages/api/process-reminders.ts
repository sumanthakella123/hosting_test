// pages/api/process-reminders.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { processReminders } from '../../utils/reminderService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const result = await processReminders();
      res.status(200).json({
        message: 'Reminders processed successfully',
        ...result
      });
    } catch (error: any) {
      console.error('Error processing reminders:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process reminders' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}