// Файл: pages/api/userIp.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  ip: string | string[] | undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.status(200).json({ ip });
}
