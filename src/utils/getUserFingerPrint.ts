// @ts-nocheck

import { detect } from 'detect-browser';
import getUserIp from "@/utils/getUserIp"
import getCurrentFormattedTime from '@/utils/getCurrentFormattedTime';
import md5 from 'md5'; 


const getCanvasFingerprintSignature = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Hello, world!', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Hello, world!', 4, 17);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const stringData = Array.from(data).join('');
      return md5(stringData); // Використовуйте md5 для генерації hash
    }
    return '';
  };

export default async function  getUserFingerPrint  ()  {
    const browser = detect();
    const userIp = await getUserIp();
    const os = `${browser.os}`;
    const { detectIncognito } = await import('detect-incognito');
    const incognitoResult = await detectIncognito();
    const userData = {
      time: getCurrentFormattedTime(),
      userIp,
      "Canvas Fingerprinting": {
        Signature: getCanvasFingerprintSignature() // Тут можна додати логіку для генерації підпису Canvas Fingerprinting
      },
      browserName: browser.name,
      browserVersion: browser.version,
      incognito: incognitoResult.isPrivate,
      os,
      osVersion: browser.osVersion,

    };
    return userData;
  };