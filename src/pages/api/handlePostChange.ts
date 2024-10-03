// @ts-nocheck
import getConfig from 'next/config';
import { server } from '@/http/index';
import getReadableLocale from '@/utils/getReadableLocale';
import removeFirstSlash from '@/utils/removeFirstSlash';
import fetchUrls from '@/utils/fetchUrls';
import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const { publicRuntimeConfig } = getConfig();
const { NEXT_FRONT_URL } = publicRuntimeConfig;

const locales = ['en', 'ru', 'uk'];

function formatDateDDMMYY(date: string): string {
  const createdDate = new Date(date);
  const day = createdDate.getDate().toString().padStart(2, '0');
  const month = (createdDate.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.${createdDate.getFullYear().toString().slice(-2)}`;
}

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

async function generateExcelFile(locale, posts, tags, accordions, blogs, news) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Add headers for each section
  worksheet.addRow(['Date', 'URL', 'Status', 'Headlines', 'SEO Title', 'Keywords']); // Add column headers

  const sections = [
    { title: 'Pages', data: posts },
    { title: 'Page Seo', data: tags },
    { title: 'Accordions', data: accordions },
    { title: 'Blogs', data: blogs },
    { title: 'News', data: news }
  ];

  sections.forEach(section => {
    worksheet.addRow([section.title]); // Add section title
    section.data
      .filter(page => page.attributes.locale === locale)
      .forEach(page => {
        worksheet.addRow([
          formatDateDDMMYY(page.attributes.createdAt),
          `${NEXT_FRONT_URL}/${getReadableLocale(locale)}${removeFirstSlash(page.attributes.url, page.attributes.locale)}`,
          'x',
          getHeadlines(page.attributes.body)?.join(', ') || '', // Join headlines into a single string
          page.attributes.seo_title || '', // Ensure no quotes or brackets
          page.attributes.keywords || ''
        ]);
      });
    worksheet.addRow([]); // Add a blank row between sections
  });

  const filePath = path.join(
    process.cwd(),
    `/allPages/allPages${locale !== 'uk' ? locale.toUpperCase() : 'UA'}.xlsx`
  );

  // Write Excel to a file
  await workbook.xlsx.writeFile(filePath);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
  const blogs = await fetchUrls('blogs', [
    'url',
    'locale',
    'seo_title',
    'keywords',
    'body',
    'createdAt',
  ]);
  const news = await fetchUrls('newss', [
    'url',
    'locale',
    'seo_title',
    'keywords',
    'body',
    'createdAt',
  ]);

  for (const locale of locales) {
    try {
      await generateExcelFile(locale, posts, tags, accordions, blogs, news);
      console.log(`File for ${locale} created successfully`);
    } catch (error) {
      console.error(`Error creating file for ${locale}:`, error);
    }
  }

  res.status(200).json({ message: 'Success! Files generated!' });
}
