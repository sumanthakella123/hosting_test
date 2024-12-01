import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/prisma';
import bcrypt from 'bcryptjs';
import { setTokenCookie } from '../../../utils/auth';

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      // Find the manager by username
      const manager = await prisma.manager.findUnique({
        where: { username },
      });

      if (!manager) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare the password
      const isValid = await bcrypt.compare(password, manager.password);

      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set the token cookie (you can use JWT or a simple token)
      // For simplicity, we'll use the manager's ID as the token
      setTokenCookie(res, String(manager.id));

      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
