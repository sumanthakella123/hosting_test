import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { getAuthToken } from '../utils/auth';
import prisma from '../utils/prisma';

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = getAuthToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the token (in this case, the manager's ID)
    const managerId = parseInt(token, 10);

    const manager = await prisma.manager.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach the manager to the request object
    (req as any).manager = manager;

    return handler(req, res);
  };
}
