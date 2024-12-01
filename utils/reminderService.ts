// utils/reminderService.ts
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import prisma from './prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVastraSevaReminder(booking: any) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Upcoming Vastra Seva Reminder</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        
        <p>This is a reminder about your upcoming Vastra Seva service:</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
          <p><strong>Deity:</strong> ${booking.deity}</p>
          <p><strong>Date:</strong> ${format(new Date(booking.date), 'EEEE, MMMM do, yyyy')}</p>
          ${booking.specialDay ? '<p><strong>Special Day Service</strong></p>' : ''}
        </div>

        <p>Please ensure you have made the necessary arrangements for the service.</p>
        
        <p>If you have any questions, please contact us at ${process.env.ADMIN_EMAIL}</p>
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        Thank you for your devotion.
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    subject: `Reminder: Upcoming Vastra Seva Service - ${format(new Date(booking.date), 'MMM do, yyyy')}`,
    html: emailContent,
  });
}

export async function sendSevaReminder(booking: any) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Upcoming Seva Service Reminder</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        
        <p>This is a reminder about your upcoming Seva service:</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
          <p><strong>Seva Type:</strong> ${booking.sevaType}</p>
          <p><strong>Date:</strong> ${format(new Date(booking.serviceDate), 'EEEE, MMMM do, yyyy')}</p>
          ${booking.timeWindow ? `<p><strong>Time:</strong> ${booking.timeWindow}</p>` : ''}
          <p><strong>Location:</strong> ${booking.location}</p>
          ${booking.venueAddress ? `<p><strong>Venue Address:</strong> ${booking.venueAddress}</p>` : ''}
        </div>

        <p>Please ensure you have made the necessary arrangements for the service.</p>
        
        <p>If you have any questions, please contact us at ${process.env.ADMIN_EMAIL}</p>
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        Thank you for your devotion.
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    subject: `Reminder: Upcoming Seva Service - ${format(new Date(booking.serviceDate), 'MMM do, yyyy')}`,
    html: emailContent,
  });
}

// Function to check and send reminders
export async function processReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  try {
    // Get Vastra Seva bookings for tomorrow
    const vastraSevaBookings = await prisma.vastraSevaBooking.findMany({
      where: {
        date: {
          gte: startOfDay(tomorrow),
          lt: endOfDay(tomorrow)
        },
        status: 'confirmed'
      }
    });

    // Get Seva bookings for tomorrow
    const sevaBookings = await prisma.sevaBooking.findMany({
      where: {
        serviceDate: {
          gte: startOfDay(tomorrow),
          lt: endOfDay(tomorrow)
        },
        status: 'confirmed'
      }
    });

    // Send reminders for Vastra Seva bookings
    for (const booking of vastraSevaBookings) {
      try {
        await sendVastraSevaReminder(booking);
        console.log(`Sent reminder for Vastra Seva booking ${booking.id}`);
      } catch (error) {
        console.error(`Failed to send reminder for Vastra Seva booking ${booking.id}:`, error);
      }
    }

    // Send reminders for Seva bookings
    for (const booking of sevaBookings) {
      try {
        await sendSevaReminder(booking);
        console.log(`Sent reminder for Seva booking ${booking.id}`);
      } catch (error) {
        console.error(`Failed to send reminder for Seva booking ${booking.id}:`, error);
      }
    }

    return {
      vastraSevaReminders: vastraSevaBookings.length,
      sevaReminders: sevaBookings.length
    };
  } catch (error) {
    console.error('Error processing reminders:', error);
    throw error;
  }
}