// @ts-nocheck
import getConfig from 'next/config';
import { server } from '../http/index';

const { publicRuntimeConfig } = getConfig();
const { NEXT_FRONT_URL } = publicRuntimeConfig;

import getReadableLocale from '@/utils/getReadableLocale';
import removeFirstSlash from '@/utils/removeFirstSlash';

import qs from 'qs';

function generateSiteMap(posts, tags, accordions, blogs,news) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
        <loc>${NEXT_FRONT_URL}/en</loc>
        <priority>1.0</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}</loc>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/ua</loc>
       <priority>1.0</priority>
     </url>
     ${posts
      .map(page => {
        return `
       <url>
           <loc>${NEXT_FRONT_URL}/${getReadableLocale(
          page.attributes.locale
        )}${removeFirstSlash(page.attributes.url, page.attributes.locale)}</loc>
           <priority>0.8</priority>
       </url>
     `;
      })
      .join('')}


     <url>
        <loc>${NEXT_FRONT_URL}/en/services</loc>
        <priority>1.0</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/services</loc>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/ua/services</loc>
       <priority>1.0</priority>
     </url>
     ${tags
      .map(page => {
        return `
      <url>
          <loc>${NEXT_FRONT_URL}/${getReadableLocale(page.attributes.locale)}${page.attributes.locale == 'ru' ? '' : '/'
          }service${page.attributes.url}</loc>
          <priority>0.8</priority>
      </url>
    `;
      })
      .join('')}
     <url>
       <loc>${NEXT_FRONT_URL}/en/contacts</loc>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/contacts</loc>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/ua/contacts</loc>
       <priority>0.8</priority>
     </url>
     ${accordions
      .map(page => {
        return `
      <url>
          <loc>${NEXT_FRONT_URL}/${getReadableLocale(
          page.attributes.locale
        )}${removeFirstSlash(page.attributes.url, page.attributes.locale)}</loc>
          <priority>0.8</priority>
      </url>
    `;
      })
      .join('')}
     <url>
        <loc>${NEXT_FRONT_URL}/ua/blog</loc>
        <priority>0.8</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/blog</loc>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/en/blog</loc>
       <priority>0.8</priority>
     </url>
     ${blogs
      .map(page => {
        return `
        <url>
            <loc>${NEXT_FRONT_URL}/${getReadableLocale(
          page.attributes.locale
        )}${removeFirstSlash(page.attributes.url, page.attributes.locale)}</loc>
            <priority>0.8</priority>
        </url>
      `;
      })
      .join('')}
     <url>
        <loc>${NEXT_FRONT_URL}/ua/news</loc>
        <priority>0.8</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/news</loc>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${NEXT_FRONT_URL}/en/news</loc>
       <priority>0.8</priority>
     </url>
      ${news
        .map(page => {
          return `
          <url>
              <loc>${NEXT_FRONT_URL}/${getReadableLocale(
            page.attributes.locale
          )}${removeFirstSlash(page.attributes.url, page.attributes.locale)}</loc>
              <priority>0.8</priority>
          </url>
        `;
        })
        .join('')}
      
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  async function fetchUrls(apiRoute: 'pages' | 'page-seos' | 'accordions' | "blogs"|"newss") {
    let array = [];
    let isFetching: boolean = true;
    let currentPage: number = 1;
    while (isFetching) {
      if (currentPage > 10) {
        isFetching = false;
      }

      const request = await server.get(
        `/${apiRoute}?${qs.stringify(
          {
            locale: 'all',
            fields: ['url', 'locale'],
            pagination: {
              page: currentPage,
              pageSize: 100,
            },
          },
          {
            encodeValuesOnly: true,
          }
        )}`
      );
      const requestData = await request.data;
      array.push(...requestData.data);
      if (
        requestData.meta.pagination.page ==
        requestData.meta.pagination.pageCount
      ) {
        isFetching = false;
      }
      currentPage++;
    }
    return array;
  }

  try {
    const posts = await fetchUrls('pages');
    const tags = await fetchUrls('page-seos');
    const accordions = await fetchUrls('accordions');
    const blogs = await fetchUrls('blogs');
    const news = await fetchUrls('newss');

    const sitemap = generateSiteMap(posts, tags, accordions, blogs,news);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.log(error);
    return {
      props: {},
    };
  }
}

export default function SiteMap() {
  // Це залишається порожнім, оскільки функція getServerSideProps виконує основну роботу
  return null;
}
