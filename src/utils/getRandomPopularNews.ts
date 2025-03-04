import { server } from '@/http';

const fieldsToPopulate = [
  "seo_title",
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
  "comments",
];

const fieldsQuery = fieldsToPopulate.filter(field => !["image", "comments"].includes(field)).map(field => `fields=${field}`).join('&');
const populateQuery = "populate=image&populate=comments";

export default async function getRandomPopularNews(locale: string, count= 4, collectionType = "blogs", isPopular = true) {
  const getPage = await server.get(
    `/${collectionType}?${fieldsQuery}&${populateQuery}&locale=${locale === 'ua' ? 'uk' : locale}&pagination[page]=1&pagination[pageSize]=50${isPopular ? "&filters[is_popular][$eq]=true" : ""}&sort=admin_date:desc`
  );


  function getRandomSample(arr:any[]) {
    const shuffled = isPopular? arr.sort(() => Math.random() - 0.5):arr
    return shuffled.slice(0,count);
  }
  const pages = getPage.data.data;
  const randomPages = getRandomSample(pages)
  return randomPages;
}
