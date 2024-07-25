// @ts-nocheck

import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import SearchModal from '@/components/organisms/search-modal';
import axios from 'axios';
import { server } from '@/http';
import { $ } from '@/utils/utils';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

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
  const [user,setUser] = useState({})
  useEffect(() => {
    const getUserCookies = Cookies.get('user');
    if (!getUserCookies) return
    const userCookies = JSON.parse(getUserCookies)
    let userFromBd = userCookies;
    async function getUser() {
      const strapiRes = await server.get(`/users/${userCookies.id}?populate=*`)
      Cookies.set('user', JSON.stringify(strapiRes.data), { expires: 7 });
      setUser(strapiRes.data)

    }
    getUser()
    setUser(userFromBd);
  }, []);
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
              <>{require('html-react-parser')(html)}</>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
    </>
  );
}

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

    return {
      props: {
        html: index,
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
        html: ``,
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
        socialData: {}
      },
    };
  }
}
