import { server } from '@/http';
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;

export default async function getRandomBanner(locale: string) {
  const strapiLocale = locale === 'ua' ? 'uk' : locale;
  const bannersRes = await server.get(
    `/banners?populate=*&locale=${strapiLocale}&pagination[pageSize]=100`
  );
  const banners = bannersRes.data.data;
  const randomBanner = banners[Math.floor(Math.random() * banners.length)];
  return (
    {
      url: randomBanner?.attributes?.url ?? null,
      image: `${NEXT_STRAPI_BASED_URL}${
        randomBanner?.attributes?.image?.data?.attributes?.url ?? '/notfoundimage'
      }`,
      alt: randomBanner?.attributes?.alt ?? null,
    } ?? null
  );
}
