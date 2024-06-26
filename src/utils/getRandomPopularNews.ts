import { server } from '@/http';

const fieldsToPopulate = [  "seo_title",
"page_title",
"seo_description",
"url",
"keywords",
"faq",
"extraLinks",
"code",
"rating",
"article",
"howto",
"image",
"admin_date",
"heading",
"is_popular",
"views",
"comments",]; 

const populateParams = fieldsToPopulate.map(field => `populate=${field}`).join('&');

console.log(populateParams,"some params")


export default async function getRandomPopularNews(locale: string) {
  const getPage = await server.get(`/blogs?populate=image&populate=comments&locale=${locale === 'ua' ? 'uk' : locale}&pagination[page]=1&pagination[pageSize]=${50}&filters[is_popular][$eq]=true`);

  function getRandomSample(arr:any[]) {
    const shuffled = arr.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }
  const pages = getPage.data.data;
  const randomPages = getRandomSample(pages)
  return randomPages;
}
