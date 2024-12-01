import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, bookingDetails } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Temple Booking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vastra Seva Booking Confirmation',
    text: `Your booking details: ${JSON.stringify(bookingDetails, null, 2)}`,
    html: `<p>Your booking details:</p><pre>${JSON.stringify(bookingDetails, null, 2)}</pre>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending email' });
  }
}
