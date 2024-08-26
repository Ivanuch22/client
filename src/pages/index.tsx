// Import necessary modules
//@ts-nocheck
import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import { useRouter } from 'next/router';
import { server } from '@/http';
import { $ } from '@/utils/utils';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { useEffect, useState, useMemo, Suspense } from 'react';
import Cookies from 'js-cookie';
import getConfig from 'next/config';

export default function Home({
  html,
  title,
  description,
  keywords,
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  socialData,
}) {
  const router = useRouter();
  const locale = useMemo(() => (router.locale === 'ua' ? 'uk' : router.locale), [router.locale]);
  const asPath = router.asPath;

  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;

  const [user, setUser] = useState(() => {
    const getUserCookies = Cookies.get('user');
    return getUserCookies ? JSON.parse(getUserCookies) : {};
  });
  console.log("sdflsdfj")
  const generateHrefLangTags = useMemo(() => {
    const locales = ['ru', 'en', 'uk'];
    const hrefLangTags = locales.map((lang) => {
      const href = `${NEXT_FRONT_URL}${lang === 'ru' ? '' : "/"+lang}${asPath}`;
      return <link key={lang} rel="alternate" hrefLang={lang} href={href} />;
    });

    // Додавання x-default, який зазвичай вказує на основну або міжнародну версію сайту
    const defaultHref = `${NEXT_FRONT_URL}${asPath}`;
    hrefLangTags.push(<link key="x-default" rel="alternate" hrefLang="x-default" href={defaultHref} />);

    return hrefLangTags;
  }, [NEXT_FRONT_URL, asPath]);
  

  // useEffect(() => {
  //   if (!user.id) return;

  //   const fetchUser = async () => {
  //     try {
  //       const { data } = await server.get(`/users/${user.id}?populate=*`);
  //       Cookies.set('user', JSON.stringify(data), { expires: 7 });
  //       setUser(data);
  //     } catch (error) {
  //       console.error('Failed to fetch user data:', error);
  //     }
  //   };

  //   fetchUser();
  // }, [user.id]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {generateHrefLangTags}
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
              <Suspense fallback={<div>Loading...</div>}>
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </Suspense>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ locale ,resolvedUrl}) {
  console.log(resolvedUrl, "resolvedUrl")
  try {
    const strapiLocale = locale === 'ua' ? 'uk' : locale;
    const { data } = await server.get(`/code?locale=${$(strapiLocale)}`);

    const {
      index = '',
      index_seo_description: description,
      index_title: title,
      index_keywords: keywords,
    } = data.data.attributes;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes ?? {};

    return {
      props: {
        html: index,
        description,
        title,
        keywords,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData,
      },
    };
  } catch (error) {
    console.error('Failed to fetch server-side props:', error);
    return {
      props: {
        html: null,
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
