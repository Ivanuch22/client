// @ts-nocheck
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import getConfig from 'next/config';
import { server } from '@/http/index';

import getReadableLocale from '@/utils/getReadableLocale';
import removeFirstSlash from '@/utils/removeFirstSlash';

const { publicRuntimeConfig } = getConfig();
const { NEXT_FRONT_URL } = publicRuntimeConfig;

import fs from 'fs';
import path from 'path';
import qs from 'qs';

const spacer = ';';
const locales = ['en', 'ru', 'uk'];

import type { NextApiRequest, NextApiResponse } from 'next';
import fetchUrls from '@/utils/fetchUrls';

type Data = {
  message: string;
};

function getHeadlines(html) {
  if (html != null) {
    html = html.replace(/&nbsp;/g, ' ');
    const regex = /<h[1-6]>(.*?)<\/h[1-6]>/g;
    const headlines = html.match(regex);
    const cleanedHeadlines = headlines?.map(headline => {
      const regex = /<[^>]*>/g;
      return headline.replace(regex, '');
    });
    return cleanedHeadlines ?? null;
  }
  return null;
}

function formatDateDDMMYY(date: string): string {
  const createdDate = new Date(date);
  const day = createdDate.getDate().toString().padStart(2, '0');
  const month = (createdDate.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.${createdDate.getFullYear().toString().slice(-2)}`;
}

function generateTxt(locale: 'en' | 'uk' | 'ru', posts, tags, accordions) {
  return `${posts
    .map(page => {
      return page.attributes.locale == locale
        ? `${formatDateDDMMYY(
            page.attributes.createdAt
          )}${spacer}${NEXT_FRONT_URL}/${getReadableLocale(
            locale
          )}${removeFirstSlash(
            page.attributes.url,
            page.attributes.locale
          )}${spacer}x${spacer}${getHeadlines(page.attributes.body)}${spacer}${
            page.attributes.seo_title
          }${spacer}${page.attributes.keywords}
`
        : '';
    })
    .join('')}
\n\n
${accordions
  .map(page => {
    return page.attributes.locale == locale
      ? `${formatDateDDMMYY(
          page.attributes.createdAt
        )}${spacer}${NEXT_FRONT_URL}/${getReadableLocale(
          locale
        )}${removeFirstSlash(
          page.attributes.url,
          page.attributes.locale
        )}${spacer}x${spacer}${getHeadlines(page.attributes.body)}${spacer}${
          page.attributes.seo_title
        }${spacer}${page.attributes.keywords}
`
      : '';
  })
  .join('')}
\n\n
${tags
  .map(page => {
    return page.attributes.locale == locale
      ? `${formatDateDDMMYY(
          page.attributes.createdAt
        )}${spacer}${NEXT_FRONT_URL}/${getReadableLocale(locale)}${
          page.attributes.locale == 'ru' ? '' : '/'
        }service${page.attributes.url}${spacer}x${spacer}${getHeadlines(
          page.attributes.body
        )}${spacer}${page.attributes.seo_title}${spacer}${
          page.attributes.keywords
        }
`
      : '';
  })
  .join('')}`;
}

// fetch all pages and generate allPages csv analytics files
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }

  const posts = await fetchUrls('pages', [
    'url',
    'locale',
    'seo_title',
    'keywords',
    'body',
    'createdAt',
  ]);

  const tags = await fetchUrls('page-seos', [
    'url',
    'locale',
    'seo_title',
    'keywords',
    'body',
    'createdAt',
  ]);

  const accordions = await fetchUrls('accordions', [
    'url',
    'locale',
    'seo_title',
    'keywords',
    'body',
    'createdAt',
  ]);

  const data = {
    uk: [],
    ru: [],
    en: [],
  };

  for (let i = 0; i < locales.length; i++) {
    data[locales[i]] = generateTxt(locales[i], posts, tags, accordions);

    const filePath = path.join(
      process.cwd(),
      `/allPages/allPages${
        locales[i] != 'uk' ? locales[i].toUpperCase() : 'UA'
      }.csv`
    );

    try {
      // Write the CSV data to the file
      fs.writeFileSync(filePath, '\uFEFF' + data[locales[i]], {
        encoding: 'utf-8',
      });

      // res.status(200).json({ success: true, message: 'File saved successfully' });
    } catch (error) {
      console.error('Error saving file:', error);
      // res.status(500).json({ success: false, message: 'Error saving file' });
    }
  }

  const auth = req.headers.authorization;
  res.status(200).json({ message: 'Success! Posts are copied!' });
}
