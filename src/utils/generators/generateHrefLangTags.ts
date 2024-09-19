import getConfig from 'next/config';

export const generateHrefLangTags = (asPath: string) => {
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;

  const locales = ['ru', 'en', 'uk'];
  const hrefLangTags = locales.map((lang) => {
    const href = `${NEXT_FRONT_URL}${lang === 'ru' ? '' : lang=="uk" ?"/ua": "/" + lang}${asPath}`;
    return {
      key: lang,
      rel: 'alternate',
      hrefLang: lang,
      href,
    };
  });

  // Додавання x-default, який зазвичай вказує на основну або міжнародну версію сайту
  const defaultHref = `${NEXT_FRONT_URL}${asPath}`;
  hrefLangTags.push({
    key: 'x-default',
    rel: 'alternate',
    hrefLang: 'x-default',
    href: defaultHref,
  });

  return hrefLangTags;
};
