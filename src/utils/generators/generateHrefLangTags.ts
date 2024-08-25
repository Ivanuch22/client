import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
const { NEXT_FRONT_URL } = publicRuntimeConfig;

const serverGenerateHrefLangTags = (asPath:string) => {
  const locales = ['ru', 'en', 'ua'];
  let hrefLangTags = locales.reduce((lang) => {
    const href = `${NEXT_FRONT_URL}${lang === 'ru' ? '' : "/" + lang}${asPath}`;
    return `<link key=${lang} rel="alternate" hrefLang=${lang} href=${href}> `;
  },"");
  // Додавання x-default, який зазвичай вказує на основну або міжнародну версію сайту
  const defaultHref = `${NEXT_FRONT_URL}${asPath}`;
  hrefLangTags +=(`<link key="x-default" rel="alternate" hrefLang="x-default" href=${defaultHref} >`);

  return hrefLangTags;
}

export default serverGenerateHrefLangTags