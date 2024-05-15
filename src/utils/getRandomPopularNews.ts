import { server } from '@/http';


export default async function getRandomPopularNews(locale: string) {
  const getPage = await server.get(
    `/blogs?populate=*&locale=${locale === 'ua' ? 'uk' : locale
    }&pagination[page]=1&pagination[pageSize]=${50}&filters[is_popular][$eq]=true`
  );
  function getRandomSample(arr:any[]) {
    const shuffled = arr.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }
  const pages = getPage.data.data;
  const randomPages = getRandomSample(pages)
  return randomPages;
}
