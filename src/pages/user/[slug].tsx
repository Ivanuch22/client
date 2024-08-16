//@ts-nocheck

import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import { useEffect, useState } from 'react';
import { server } from '@/http';
import Script from 'next/script';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { useAuth } from '@/contexts/AuthContext';
import { Tab, Tabs, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/organisms/ModalConfirm'
import MailModal from '@/components/organisms/ModalMail';
import ImgEditor from '@/components/organisms/ImgEditor';
import getConfig from 'next/config';
import NotConfirmedModal from '@/components/organisms/NotConfirmedModal';

export default function User({
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  socialData,
  dataUser,
}) {
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_STRAPI_BASED_URL, NEXT_STRAPI_IMG_DEFAULT } = publicRuntimeConfig;

  const noImgUrl = `${NEXT_STRAPI_BASED_URL}/uploads/nophoto_c7c9abf542.png`;

  const [login, setLogin] = useState(false);
  const [user, setUser] = useState({});

  const [avatarUrl, setAvatarUrl] = useState(noImgUrl);
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const { isLogin, logout, updateUser } = useAuth();
  const [defaultBirthday, setDefaultBirthday] = useState('2000-01-01')

  const asPath = router.asPath
  const { NEXT_FRONT_URL } = publicRuntimeConfig;
  const generateHrefLangTags = () => {
    const locales = ['ru', 'en', 'ua'];
    const hrefLangTags = locales.map((lang) => {
      const href = `${NEXT_FRONT_URL}${lang === 'ru' ? '' : "/"+lang}${asPath}`;
      return <link key={lang} rel="alternate" hrefLang={lang} href={href} />;
    });

    // Додавання x-default, який зазвичай вказує на основну або міжнародну версію сайту
    const defaultHref = `${NEXT_FRONT_URL}${asPath}`;
    hrefLangTags.push(<link key="x-default" rel="alternate" hrefLang="x-default" href={defaultHref} />);

    return hrefLangTags;
  };

  useEffect(() => {
    setLogin(isLogin);
  }, [isLogin]);

  useEffect(() => {
    setDefaultBirthday(dataUser[0].birthday)
    if (dataUser[0].user_image?.url) {
      setAvatarUrl(NEXT_STRAPI_BASED_URL +dataUser[0].user_image?.url);
    } else {
      setAvatarUrl(noImgUrl)
    }
  }, [])


  const getPath = useRouter()



  return (
    <>
      <Head>
        <title>Profile</title>
        <meta name="description" content="Profile" />
        <meta name="keywords" content="Profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {generateHrefLangTags()}
      </Head>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
        defer
      ></Script>
      <div className="container-xxl bg-white p-0">
        <main className="container-xxl position-relative p-0">
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
              <div className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  <div className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5">
                    <div className="row g-5 pt-1">
                      <div
                        className="col-12 text-center text-md-start"
                        style={{ marginTop: '40px', marginBottom: '50px' }}
                      >
                        <h1 className="display-4 text-white animated slideInLeft">
                          {dataUser[0]?.real_user_name}
                        </h1>
                        <nav aria-label="breadcrumb">
                          <ol itemScope itemType="http://schema.org/BreadcrumbList" className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft">
                            <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item">
                              <Link itemProp="item" className="text-white" href="/">
                                <span style={{ color: "white" }} itemProp="name">
                                  {$t[locale].menu.main}
                                </span>
                                <meta itemProp="position" content="1" />
                              </Link>
                            </li>
                            <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item">
                              <Link itemProp="item" className="text-white" href={getPath.asPath}>
                                <span style={{ color: "white" }} itemProp="name">
                                {dataUser[0]?.real_user_name}
                                </span>
                                <meta itemProp="position" content="2" />

                              </Link>
                            </li>
                          </ol>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="container"
                style={login ? { display: 'block' } : { display: 'none' }}
              >
                <Tabs>
                  <TabPanel>
                    <div className="card mb-4">
                      <div
                        style={{ justifyContent: 'space-between' }}
                        className="card-body position-relative  d-block d-md-flex align-items-center"
                      >
                        <div className="d-flex align-items-center mb-3">
                          <div className="flex-shrink-0">
                            <img
                              src={avatarUrl}
                              width="80"
                              className="rounded"
                              alt="Avatar"
                            />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h5>{dataUser[0]?.real_user_name}</h5>
                          </div>

                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </Tabs>
              </div>

              <div
                className="container"
                style={login ? { display: 'none' } : { display: 'block' }}
              >
                <Link className="btn btn-primary" href="/login">
                  {$t[locale].auth.header_button_name}
                </Link>
              </div>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </main>
      </div>
    </>
  );
}
export async function getServerSideProps({ query, locale }: Query) {
  const { q } = query;
  
  try {
    const userData = await server.get(`/users`, { params: { filters: { username: { $eq: query.slug } }, populate: '*' }})

    const dataUser = userData.data;

    const strapiLocale = locale === 'ua' ? 'uk' : locale;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes;

    return {
      props: {
        menu,
        dataUser,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        notFound: true,
        pages: [],
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
