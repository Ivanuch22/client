import { server } from '@/http';
import fetchUrls from './fetchUrls';

export default async function getHeaderFooterMenus(strapiLocale: string) {
  const menuRes = await server.get(
    '/menus?nested&filters[slug][$eq]=main&populate=*'
  );
  const menu = menuRes.data.data[0]?.attributes?.items.data;

  const allPages = [
    ...(await fetchUrls('pages', ['url', 'locale'])),
    ...(await fetchUrls('page-seos', ['url', 'locale'])),
    ...(await fetchUrls('accordions', ['url', 'locale'])),
    ...(await fetchUrls('blogs', ['url', 'locale'])),
  ];

  const servicesRes = await server.get(
    '/menus?nested&filters[slug][$eq]=footerServices&populate=*'
  );
  const aboutRes = await server.get(
    '/menus?nested&filters[slug][$eq]=footerAbout&populate=*'
  );
  const contactsRes = await server.get(`/contact?locale=${strapiLocale}`);

  const footerMenus = {
    services: {
      title: servicesRes?.data?.data[0]?.attributes?.title,
      items: servicesRes?.data?.data[0]?.attributes?.items?.data,
    },
    about: {
      title: aboutRes?.data?.data[0]?.attributes?.title,
      items: aboutRes?.data?.data[0]?.attributes?.items?.data,
    },
    contacts: contactsRes?.data?.data?.attributes,
  };

  const footerGeneralRes = await server.get(
    `/footer-generall?locale=${strapiLocale}`
  );

  return {
    menu,
    allPages,
    footerMenus,
    footerGeneral: footerGeneralRes?.data?.data?.attributes ?? {},
  };
}
