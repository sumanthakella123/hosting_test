// utils/vastra-mailer.ts
import nodemailer from 'nodemailer';
import { VastraSevaBookingDetails } from '../types/booking';
import { format } from 'date-fns';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVastraSevaConfirmation = async (bookingDetails: VastraSevaBookingDetails) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'EEEE, MMMM do, yyyy');
  };

  const generateDatesList = () => {
    return bookingDetails.dates.map(date => {
      const isSpecial = bookingDetails.specialDates.some(
        specialDate => format(specialDate, 'yyyy-MM-dd') === format(new Date(date), 'yyyy-MM-dd')
      );
      const amount = isSpecial ? '₹100' : '₹50';
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatDate(date)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${isSpecial ? 'Yes' : 'No'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${amount}</td>
        </tr>
      `;
    }).join('');
  };

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Vastra Seva Booking Confirmation</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #444;">Booking Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Deity:</strong></td>
            <td>${bookingDetails.deity}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
            <td>₹${bookingDetails.totalAmount}</td>
          </tr>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Booked Dates:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Special Day</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${generateDatesList()}
          </tbody>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Personal Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Name:</strong></td>
            <td>${bookingDetails.firstName} ${bookingDetails.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td>${bookingDetails.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Phone:</strong></td>
            <td>${bookingDetails.phone}</td>
          </tr>
          ${bookingDetails.gotram ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Gotram:</strong></td>
            <td>${bookingDetails.gotram}</td>
          </tr>
          ` : ''}
        </table>

        ${bookingDetails.requests ? `
        <h3 style="color: #444; margin-top: 20px;">Additional Requests:</h3>
        <p style="margin: 0;">${bookingDetails.requests}</p>
        ` : ''}
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        If you have any questions about your booking, please contact us at ${process.env.ADMIN_EMAIL}
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: bookingDetails.email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Vastra Seva Booking Confirmation - ${bookingDetails.deity}`,
    html: emailContent,
  });
};