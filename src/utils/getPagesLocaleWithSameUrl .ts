import { server } from '@/http/index';

export default async (url: string, colectionType = "blogs") => {
  try {
    const getPages = await server.get(`/${colectionType}?filters[url]=${url}`);
    return getPages.data;
  } catch (error) {
    console.error("Error fetching pages by URL:", error);
  }
};