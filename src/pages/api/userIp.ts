// Файл: pages/api/userIp.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  ip: string | string[] | undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // Отримуємо IP з заголовків запиту
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Відправляємо IP у відповіді
  res.status(200).json({ ip });
}
