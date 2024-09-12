import { server } from '@/http/index';

export default  async (blogUrl:string, colectionType = "blogs") => {
    try {
      const locales = ["uk", "ru", "en"];
      const pagesByLocale = await Promise.all(
        locales.map(async (locale) => {
          const response = await server.get(`/${colectionType}?filters[url]=${blogUrl}&locale=${locale}`);
          return response.data.data;
        })
      );
      const pages = pagesByLocale.flat();
      return pages.map(page => page.id);
    } catch (error) {
      console.error("Error fetching pages by URL:", error);
    }
  };