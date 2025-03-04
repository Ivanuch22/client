// @ts-nocheck

import { server } from '@/http/index';
import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import { Crumb } from '@/components/molecules/Breacrumbs';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import { useState, useEffect, useMemo } from 'react';
import parse from 'html-react-parser';

import genRatingData from '@/utils/generators/genRatingData';
import genFaqData from '@/utils/generators/genFaqData';
import genArticleData from '@/utils/generators/genArticleData';

import getHowToData from '@/utils/generators/getHowToData';
import { getMenu, getPageSeo } from '@/utils/queries';
import { $ } from '@/utils/utils';
import genListItemData from '@/utils/generators/genListItemData';
import getConfig from 'next/config';
import Sidebar from '@/components/organisms/Sidebar';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import { errorText, message404 } from '../switch';
import getRandomBanner from '@/utils/getRandomBanner';
import isPageWithLocaleExists from '@/utils/isPageWithLocaleExists';
import Link from 'next/link';
import { generateHrefLangTags } from '@/utils/generators/generateHrefLangTags';
import getRandomPopularNews from '@/utils/getRandomPopularNews';
import MostPopular from '@/components/organisms/MostPopular';
const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;
export interface PageAttibutes {
  seo_title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  page_title: string;
  seo_description: string;
  body: string;
  url: string;
  crumbs: Crumb[];
  slug: string;
  faq: any[];
  rating: {
    id: number;
    text: string;
    mark: number;
  };
}
export interface PageMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
export interface PageData {
  id: number;
  attributes: PageAttibutes;
}

export interface Page {
  data: PageData[];
  meta: PageMeta;
}
export interface MenuItem {
  id: number;
  attributes: {
    order: number;
    title: string;
    url: string;
    target: string;
    createdAt: string;
    updatedAt: string;
    children: {
      data: [];
    };
  };
}
export interface Query {
  query: {
    slug: string | null;
  };
}

const Page = ({
  seo_title,
  seo_description,
  page_title,
  body,
  keywords,
  url,
  faq,
  rating,
  code,
  article,
  howto,
  randomBanner,
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  socialData,
  mostPopular,
  mostPopularNews,
  activePageLocales,

}: PageAttibutes) => {
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  // Эта функция рекурсивно пробегаем по объекту навигации который мы возвращаем из функции getServerSideProps
  // и генерирует одномерный мессив объектов который будет в последующем преобразован в компонент breadcrumbs
  const findAncestors = (obj: any[], url: string) => {
    const ancestors = [] as Crumb[];
    for (const item of obj) {
      if (item.attributes.url === url) {
        ancestors.push({
          id: item.id,
          title: item.attributes.title,
          title_en: item.attributes.title_en,
          title_uk: item.attributes.title_uk,
          url: item.attributes.url,
          children: item.attributes.children.data,
        });
        return ancestors;
      }

      if (item.attributes.children.data.length > 0) {
        const childAncestors = findAncestors(
          item.attributes.children.data,
          url
        );
        if (childAncestors.length > 0) {
          ancestors.push({
            id: item.id,
            title: item.attributes.title,
            title_en: item.attributes.title_en,
            title_uk: item.attributes.title_uk,
            url: item.attributes.url,
            children: item.attributes.children.data,
          });
          ancestors.push(...childAncestors);
          return ancestors;
        }
      }
    }
    return ancestors;
  };

  const shortenedTitle = useMemo<string>(() => {
    return page_title.length > 75
      ? `${page_title.slice(0, 75)}...`
      : page_title;
  }, [page_title]);

  const chunksHead = code?.reduce((acc, item) => {
    if (item.position === 'head') {
      acc += item.script;
    }

    return acc;
  }, ``);

  const chunksBodyTop = code?.reduce((acc, item) => {
    if (item.position === 'body-top') {
      acc += item.script;
    }

    return acc;
  }, ``);

  const chunksBodyFooter = code?.reduce((acc, item) => {
    if (item.position === 'body-footer') {
      acc += item.script;
    }

    return acc;
  }, ``);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorCode, setErrorCode] = useState<number | null>(null);


  const asPath = router.asPath
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;
  const hrefLangTags = generateHrefLangTags(asPath, activePageLocales);
  return (
    <>
      {/* 
        head - это компонент который предоставляет нам next.js сюда вы можете прописывать разные мета теги,
        title и тд, если вы хотите добавить стили или скрипты к странице - это лучше делать в файле _document
       */}
      <Head>
        <title>{seo_title}</title>
        <meta name="description" content={seo_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keyword" content={keywords} />
        {hrefLangTags.map((tag) => (
          <link key={tag.key} rel={tag.rel} hrefLang={tag.hrefLang} href={tag.href.endsWith('/') ? tag.href.slice(0, -1) : tag.href} />
        ))}
        {faq && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: faq }}
          />
        )}
        {rating && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: rating }}
          />
        )}
        {article && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: article }}
          />
        )}
        {howto && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: howto }}
          />
        )}
        <>{parse(chunksHead)}</>

      </Head>
      <>{parse(chunksBodyTop)}</>
      <div className="container-xxl bg-white p-0">
        <div className="container-xxl position-relative p-0">
          <DefaultLayoutContext.Provider
            value={{
              footerMenus,
              footerGeneral,
              allPages,
              menu,
              errorMessage,
              setErrorMessage,
              errorCode,
              setErrorCode,
              socialData,
            }}
          >
            <DefaultLayout>
              {/* В компонент hero передаем заголовок страницы и данные которые там будут преобразованы в breadcrumb */}
              <div className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  <div className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5" style={{ marginLeft: 0 }}>
                    <div className="row g-5 pt-1">
                      <div
                        className="col-12 text-center text-md-start"
                        style={{ marginTop: '40px', marginBottom: '50px' }}
                      >
                        <h1 className="display-5 text-white animated slideInLeft">
                          {shortenedTitle}
                        </h1>
                        <nav aria-label="breadcrumb">
                          <ol itemScope itemType="http://schema.org/BreadcrumbList" className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft">
                            <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item">
                              <Link itemProp="item" className="text-white" href="/">
                                <span itemProp="name">
                                  {$t[locale].menu.main}
                                </span>
                                <meta itemProp="position" content="1" />
                              </Link>
                            </li>
                            <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item">
                              <Link itemProp="item" className="text-white" href="/services">
                                <span itemProp="name">
                                  {$t[locale].menu.services}
                                </span>
                                <meta itemProp="position" content="2" />
                              </Link>
                            </li>
                            <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item">
                              <Link itemProp="item" className="text-white" href={"/service" + url}>
                                <span itemProp="name">
                                  {seo_title ? shortenedTitle : '404'}
                                </span>
                                <meta itemProp="position" content="3" />
                              </Link>
                            </li>
                          </ol>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="container-xxl">
                <div className="row">
                  <div className="col article-col pe-md-2">
                    {/* 
              В этом блоке будут помещены и отрендерены все данные из body. Body - это поле в страпи в коллекции Page.
              там вы можете вписывать как обычный текст так и html код
             */}
                    <div
                      className="cont-body"
                      style={{ maxWidth: '90%', margin: '0 auto' }}
                    >
                      {/* Displaying error message (currently only used only for 404 message only) */}
                      {errorMessage && (
                        <div className="error-message">
                          <h3>
                            {errorCode != null
                              ? `${errorText[
                              Object.keys(message404).find(
                                key => message404[key] === errorMessage
                              )
                              ]
                              } ${errorCode}`
                              : errorMessage}
                          </h3>
                          {errorCode != null && (
                            <p className="error-descr">{errorMessage}</p>
                          )}
                        </div>
                      )}
                      {/* Displaying rich text */}
                      <div dangerouslySetInnerHTML={{ __html: body }}></div>
                    </div>
                  </div>
                  <aside className=' col-md-auto col-sm-12 d-flex flex-wrap flex-column align-items-center align-items-sm-start justify-content-sm-start justify-content-md-start flex-md-column col-md-auto  mx-360'>

                    <Sidebar randomBanner={randomBanner}>
                      <MostPopular title={$t[locale].news.mostpopular} data={mostPopularNews} />
                      <MostPopular title={$t[locale].blog.mostpopular} data={mostPopular} />
                    </Sidebar>
                  </aside>
                </div>
              </div>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
      <>{parse(chunksBodyFooter)}</>
    </>
  );
};

export async function getServerSideProps({
  query,
  locale,
  res,
  resolvedUrl,
}: Query) {
  const randomBanner = await getRandomBanner(locale);

  const slug = `/${query?.slug}` || '';
  const strapiLocale = locale === 'ua' ? 'uk' : locale;

  const [pageRes, pagesWithSameUrl, strapiMenu, headerFooterMenusResponce, mostPopular, mostPopularNews, socialRes] = await Promise.all([
    server.get(getPageSeo(slug, $(locale))),
    server.get(getPageSeo(slug, "all")),
    server.get(getMenu('main')),
    getHeaderFooterMenus(strapiLocale),
    getRandomPopularNews(strapiLocale),
    getRandomPopularNews(strapiLocale, 4, "newss",false),
    server.get('/social')
  ]);
  const activePageLocales = pagesWithSameUrl.data.data.map(element => element.attributes.locale);


  const { menu, allPages, footerMenus, footerGeneral } = headerFooterMenusResponce;

  const crumbs = strapiMenu.data.data[0].attributes.items.data;

  if (!isPageWithLocaleExists(resolvedUrl, locale, allPages)) {
    res.statusCode = 404;
  }
  const socialData = socialRes.data.data.attributes;

  if (pageRes.data?.data[0]?.attributes) {
    const {
      seo_title,
      seo_description,
      page_title,
      url,
      body,
      keywords,
      faq,
      rating,
      code,
      article,
      publishedAt,
      howto,
    }: PageAttibutes = pageRes.data?.data[0]?.attributes;

    return {
      props: {
        activePageLocales,
        mostPopular,
        mostPopularNews,
        seo_title,
        seo_description,
        page_title,
        url,
        body,
        crumbs,
        slug,
        keywords,
        code,
        rating: genRatingData(rating.data),
        faq: genFaqData(faq.data),
        article: genArticleData(article, publishedAt, locale, slug),
        howto: getHowToData(howto),
        randomBanner,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
    };
  }

  return {
    props: {
      activePageLocales,
      mostPopularNews: [],
      mostPopular,
      seo_title: '',
      seo_description: '',
      page_title: '',
      url: '',
      body: '',
      crumbs: '',
      slug: '',
      keywords: '',
      rating: null,
      article: null,
      faq: [],
      code: [],
      howto: null,
      randomBanner,
      menu: menu ?? [],
      allPages: allPages ?? [],
      footerMenus: footerMenus ?? {
        about: { title: '', items: [] },
        services: { title: '', items: [] },
        contacts: {},
      },
      footerGeneral: footerGeneral ?? {},
      socialData: socialData ?? null,
    },
  };
}

export default Page;
