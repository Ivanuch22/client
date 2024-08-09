
export default function generateHreflangTags(hostname:string, asPath:string) {
    // Визначення URL для кожної локації
    const urls = {
      ua: `${hostname}/ua${asPath}`,
      ru: `${hostname}${asPath}`,
      en: `${hostname}/en${asPath}`,
    };
  
    // Створення рядка з hreflang тегами
    const hreflangTags = `
      <link rel="alternate" hreflang="x-default" href="${urls.ru}" />
      <link rel="alternate" hreflang="ru" href="${urls.ru}" />
      <link rel="alternate" hreflang="ua" href="${urls.ua}" />
      <link rel="alternate" hreflang="en" href="${urls.en}" />
    `;
  
    return hreflangTags;
  }