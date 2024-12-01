import { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '../../../utils/auth';

export default function logout(req: NextApiRequest, res: NextApiResponse) {
  removeTokenCookie(res);
  res.status(200).json({ message: 'Logout successful' });
}
