// Import necessary modules
// @ts-nocheck
import dynamic from 'next/dynamic';
import Head from 'next/head';
import $t from '@/locale/global';
import DefaultLayout from '@/components/layouts/default';
import { useRouter } from 'next/router';
import { server } from '@/http';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { useEffect, useState, useMemo } from 'react';
import Cookies from 'js-cookie';
import getConfig from 'next/config';
import { generateHrefLangTags } from '@/utils/generators/generateHrefLangTags';
import getRandomPopularNews from '@/utils/getRandomPopularNews';
import { getIndexPage } from '@/utils/queries';
import { Query } from './[slug]';
const MostPopularRow = dynamic(
  () => import('@/components/organisms/MostPopularRow'),
  {
    ssr: true,
    loading: () => <p>Loading...</p>, // Можна додати спінер або індикатор завантаження
  }
);
export default function Home({
  html,
  index_bottom,
  title,
  description,
  keywords,
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  mostPopular,
  socialData,
  mostPopularNews,
}: any) {
  const router = useRouter();
  const asPath = router.asPath;
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;
  const [user, setUser] = useState(() => {
    const getUserCookies = Cookies.get('user');
    return getUserCookies ? JSON.parse(getUserCookies) : {};
  });
  const hrefLangTags = useMemo(() => generateHrefLangTags(asPath), [asPath]);

  useEffect(() => {
    if (!user.id) return;
    const fetchUser = async () => {
      try {
        const { data } = await server.get(`/users/${user.id}?populate=*`);
        Cookies.set('user', JSON.stringify(data), { expires: 7 });
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUser();
  }, [user.id]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {hrefLangTags.map(tag => {
          console.log(tag?.href.endsWith('/'));
          return (
            <link
              key={tag?.key}
              rel={tag?.rel}
              hrefLang={tag?.hrefLang}
              href={
                tag?.href.endsWith('/') ? tag?.href.slice(0, -1) : tag?.href
              }
            />
          );
        })}
      </Head>

      <div className="container-xxl bg-white p-0">
        <div className="container-xxl position-relative p-0">
          <DefaultLayoutContext.Provider
            value={{
              footerMenus,
              footerGeneral,
              allPages,
              menu,
              socialData,
            }}
          >
            <DefaultLayout>
              <div dangerouslySetInnerHTML={{ __html: html }} />

              {/* Starting news and most populars */}
              {mostPopularNews.length > 0 && (
                <MostPopularRow
                  title={$t[locale].news.mostpopular}
                  data={mostPopularNews}
                />
              )}
              <MostPopularRow
                title={$t[locale].blog.mostpopular}
                data={mostPopular}
              />

              <div dangerouslySetInnerHTML={{ __html: index_bottom }}></div>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
    </>
  );
}
export async function getStaticProps({ locale }: Query) {
  try {
    const strapiLocale = locale === 'ua' ? 'uk' : locale;

    const [
      dataResponse,
      socialResponse,
      mostPopularResponse,
      mostPopularNewsResponse,
    ] = await Promise.all([
      server.get(getIndexPage(strapiLocale)),
      server.get('/social'),
      getRandomPopularNews(strapiLocale, 4),
      getRandomPopularNews(strapiLocale, 4, 'newss', false),
    ]);

    const {
      index = '',
      index_bottom = '',
      index_seo_description: description,
      index_title: title,
      index_keywords: keywords,
    } = dataResponse.data.data.attributes;
    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    let mostPopular =
      mostPopularResponse.length > 0
        ? mostPopularResponse
        : await getRandomPopularNews('ru', 4);
    let mostPopularNews =
      mostPopularNewsResponse.length > 0
        ? mostPopularNewsResponse
        : await getRandomPopularNews('ru', 4, 'newss', false);
    const socialData = socialResponse.data.data.attributes ?? {};

    return {
      props: {
        html: index,
        index_bottom,
        description,
        title,
        keywords,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData,
        mostPopular,
        mostPopularNews,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Failed to fetch server-side props:', error);
    return {
      props: {
        html: null,
        index_bottom: '',
        mostPopularNews: [],
        mostPopular: [],
        description: '',
        title: '',
        keywords: '',
        menu: [],
        allPages: [],
        footerMenus: {
          about: { title: '', items: [] },
          services: { title: '', items: [] },
          contacts: {},
        },
        footerGeneral: {},
        socialData: {},
      },
    };
  }
}
