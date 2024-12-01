// utils/cancellationMailer.ts
import nodemailer from 'nodemailer';

// Define the SevaBooking type based on your schema
interface SevaBooking {
  id: number;
  sevaType: string;
  poojaDetails: string | null;
  date: Date;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gotram: string | null;
  requests: string | null;
  location: string;
  priestPreference: string;
  muhuratRequired: boolean;
  namesAndNakshatras: string | null;
  serviceDate: Date;
  timeWindow: string | null;
  venueAddress: string | null;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendCancellationEmail = async (booking: SevaBooking) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Seva Booking Cancellation</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #444;">Booking Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Seva Type:</strong></td>
            <td>${booking.sevaType}</td>
          </tr>
          ${booking.poojaDetails ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Pooja Details:</strong></td>
            <td>${booking.poojaDetails}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Service Date:</strong></td>
            <td>${formatDate(booking.serviceDate)}</td>
          </tr>
          ${booking.timeWindow ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Preferred Time:</strong></td>
            <td>${booking.timeWindow}</td>
          </tr>
          ` : ''}
        </table>

        <h3 style="color: #444; margin-top: 20px;">Personal Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Name:</strong></td>
            <td>${booking.firstName} ${booking.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td>${booking.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Phone:</strong></td>
            <td>${booking.phone}</td>
          </tr>
          ${booking.gotram ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Gotram:</strong></td>
            <td>${booking.gotram}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Location:</strong></td>
            <td>${booking.location}</td>
          </tr>
          ${booking.venueAddress ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Venue Address:</strong></td>
            <td>${booking.venueAddress}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Priest Preference:</strong></td>
            <td>${booking.priestPreference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Muhurat Required:</strong></td>
            <td>${booking.muhuratRequired ? 'Yes' : 'No'}</td>
          </tr>
        </table>

        ${booking.requests ? `
        <h3 style="color: #444; margin-top: 20px;">Additional Requests:</h3>
        <p style="margin: 0;">${booking.requests}</p>
        ` : ''}
      </div>
      
      <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; margin: 0;">
          Your seva booking has been cancelled. If you believe this cancellation was made in error or if you have any questions,
          please contact us immediately at ${process.env.ADMIN_EMAIL}
        </p>
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        Thank you for your understanding. We hope to serve you again in the future.
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Seva Booking Cancellation - ${booking.sevaType}`,
    html: emailContent,
    text: `
Seva Booking Cancellation

Booking Details:
Seva Type: ${booking.sevaType}
${booking.poojaDetails ? `Pooja Details: ${booking.poojaDetails}\n` : ''}
Service Date: ${formatDate(booking.serviceDate)}
${booking.timeWindow ? `Preferred Time: ${booking.timeWindow}\n` : ''}

Personal Information:
Name: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Phone: ${booking.phone}
${booking.gotram ? `Gotram: ${booking.gotram}\n` : ''}
Location: ${booking.location}
${booking.venueAddress ? `Venue Address: ${booking.venueAddress}\n` : ''}
Priest Preference: ${booking.priestPreference}
Muhurat Required: ${booking.muhuratRequired ? 'Yes' : 'No'}

${booking.requests ? `Additional Requests:\n${booking.requests}\n\n` : ''}

Your seva booking has been cancelled. If you believe this cancellation was made in error or if you have any questions,
please contact us immediately at ${process.env.ADMIN_EMAIL}

Thank you for your understanding. We hope to serve you again in the future.
    `,
  });
};