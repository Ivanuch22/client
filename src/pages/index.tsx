// Import necessary modules
//@ts-nocheck
import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { server } from '@/http';
import { $ } from '@/utils/utils';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import parse from 'html-react-parser';


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
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const [user, setUser] = useState({});

  useEffect(() => {
    const getUserCookies = Cookies.get('user');
    if (!getUserCookies) return;
    const userCookies = JSON.parse(getUserCookies);
    let userFromBd = userCookies;

    async function getUser() {
      const strapiRes = await server.get(`/users/${userCookies.id}?populate=*`);
      Cookies.set('user', JSON.stringify(strapiRes.data), { expires: 7 });
      setUser(strapiRes.data);
    }

    getUser();
    setUser(userFromBd);
  }, []);
  const jsxContent = parse(html);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
        defer
      ></Script>
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
              {/* <div dangerouslySetInnerHTML={{ __html: html }} /> */}
              <div>{jsxContent}</div>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
    </>
  );
}
// Import necessary modules

export async function getServerSideProps({ query, locale }) {
  try {
    const strapiLocale = locale === 'ua' ? 'uk' : locale;
    const res = await server.get(`/code?locale=${$(strapiLocale)}`);

    const {
      index = '',
      index_seo_description,
      index_title,
      index_keywords,
    } = res.data.data.attributes;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes;

    // Transform img tags in HTML to Next.js Image components
    const transformedHtml = index.replace(/<img ([^>]*)src="([^"]+)"([^>]*)>/g, (match, beforeSrc, src, afterSrc) => {
      const altMatch = match.match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : '';
      const classMatch = match.match(/class="([^"]*)"/);
      const className = classMatch ? classMatch[1] : '';
      const styleMatch = match.match(/style="([^"]*)"/);
      const style = styleMatch ? styleMatch[1] : '';

      return `<Image src="${src}" alt="${alt||"sdlfj"}" width="500" height="500" class="${className}" style="${style}" />`;
    });


    return {
      props: {
        html : transformedHtml,
        description: index_seo_description,
        title: index_title,
        keywords: index_keywords,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
    };
  } catch (error) {
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
