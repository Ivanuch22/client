// @ts-nocheck

import { detect } from 'detect-browser';
import getUserIp from "@/utils/getUserIp";
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
    return md5(stringData);
  }
  return '';
};

const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let os = 'Unknown';
  let osVersion = 'Unknown';

  if (/chrome|crios|crmo/i.test(userAgent)) {
    browserName = 'Chrome';
    const match = userAgent.match(/(?:chrome|crios|crmo)\/([0-9\.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/safari/i.test(userAgent)) {
    browserName = 'Safari';
    const match = userAgent.match(/version\/([0-9\.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/firefox|iceweasel|fxios/i.test(userAgent)) {
    browserName = 'Firefox';
    const match = userAgent.match(/(?:firefox|iceweasel|fxios)\/([0-9\.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/msie|trident/i.test(userAgent)) {
    browserName = 'Internet Explorer';
    const match = userAgent.match(/(?:msie |rv:)([0-9\.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/edge|edgios|edga/i.test(userAgent)) {
    browserName = 'Edge';
    const match = userAgent.match(/(?:edge|edgios|edga)\/([0-9\.]+)/i);
    if (match) browserVersion = match[1];
  }

  if (/android/i.test(userAgent)) {
    os = 'Android';
    const match = userAgent.match(/android\s([0-9\.]+)/i);
    if (match) osVersion = match[1];
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
    const match = userAgent.match(/OS\s([0-9\_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/windows/i.test(userAgent)) {
    os = 'Windows';
    const match = userAgent.match(/Windows NT ([0-9\.]+)/i);
    if (match) osVersion = match[1];
  } else if (/macintosh/i.test(userAgent)) {
    os = 'Mac';
    const match = userAgent.match(/Mac OS X ([0-9_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  }

  return { browserName, browserVersion, os, osVersion };
};

const detectIncognitoMode = async () => {
  const browser = detect();
  let isPrivate = false;

  if (browser && browser.name === 'safari') {
    const openDB = window.openDatabase;
    try {
      isPrivate = !openDB;
    } catch (e) {
      isPrivate = true;
    }
  } else {
    const { detectIncognito } = await import('detect-incognito');
    const incognitoResult = await detectIncognito();
    isPrivate = incognitoResult.isPrivate;
  }

  return isPrivate;
};

export default async function getUserFingerPrint() {
  // const browserInfo = getBrowserInfo();
  const userIp = await getUserIp();
  // const incognito = await detectIncognitoMode();
  const userData = {
    time: getCurrentFormattedTime(),
    userIp,
    "Canvas Fingerprinting": {
      Signature: getCanvasFingerprintSignature()
    }
    // browserName: browserInfo.browserName,
    // browserVersion: browserInfo.browserVersion,
    // incognito: incognito,
    // os: browserInfo.os,
    // osVersion: browserInfo.osVersion,
  };
  console.log(userData)
  return userData;
};
