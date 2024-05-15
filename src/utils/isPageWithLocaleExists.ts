export default function isPageWithLocaleExists(
  url: string,
  locale: string,
  allPages: any[]
) {
  const strapiLocale = locale === 'ua' ? 'uk' : locale;
  const pageIndex: number = allPages.findIndex(
    page =>
      (page.attributes.url === url ||
        `/service${page.attributes.url}` === url) &&
      page.attributes.locale === strapiLocale
  );
  return pageIndex !== -1;
}
