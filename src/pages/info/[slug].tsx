// @ts-nocheck
import { server } from '@/http/index';
import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import Hero from '@/components/organisms/hero';
import { Crumb } from '@/components/molecules/Breacrumbs';
import { useRouter } from 'next/router';
import $t from '@/locale/global';

import genRatingData from '@/utils/generators/genRatingData';
import genFaqData from '@/utils/generators/genFaqData';
import genArticleData from '@/utils/generators/genArticleData';

import getHowToData from '@/utils/generators/getHowToData';
import {
  getAccordion,
  getMenu,
} from '@/utils/queries';
import { $ } from '@/utils/utils';
import { useState } from 'react';
import getConfig from 'next/config';
import AccordionMenu from '@/components/molecules/Accordion';
import Sidebar from '@/components/organisms/Sidebar';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import { errorText, message404 } from '../switch';
import getRandomBanner from '@/utils/getRandomBanner';
import isPageWithLocaleExists from '@/utils/isPageWithLocaleExists';
import parse from 'html-react-parser';
import { generateHrefLangTags } from '@/utils/generators/generateHrefLangTags';
import getRandomPopularNews from '@/utils/getRandomPopularNews';
import dynamic from 'next/dynamic';

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
  crumbs,
  keywords,
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
  accordion,
  socialData,
  mostPopular,
  mostPopularNews,
  activePageLocales,
}: PageAttibutes) => {

  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const findAncestorsForInfoPage = (obj: any[], url: string) => {
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
        const childAncestors = findAncestorsForInfoPage(
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
  const ancestors = findAncestorsForInfoPage(crumbs, `${router.asPath}`);
  const newArray = ancestors.length > 2 ? [
    ancestors[0],
    ancestors[1],
    ancestors[ancestors.length - 1]
  ] : [
    ancestors[0],
    ancestors[1],
  ];


  const chunksHead = code.reduce((acc, item) => {
    if (item.position === 'head') {
      acc += item.script;
    }

    return acc;
  }, ``);

  const chunksBodyTop = code.reduce((acc, item) => {
    if (item.position === 'body-top') {
      acc += item.script;
    }

    return acc;
  }, ``);

  const chunksBodyFooter = code.reduce((acc, item) => {
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
  const hrefLangTags = generateHrefLangTags(asPath,activePageLocales);

  const MostPopular = dynamic(() => import('@/components/organisms/MostPopular'), {
    ssr: true,
    loading: () => <p>Loading...</p>, // Можна додати спінер або індикатор завантаження
  });



  return (
    <>
      <Head>
        {hrefLangTags.map((tag) => (
          <link key={tag.key} rel={tag.rel} hrefLang={tag.hrefLang} href={tag.href.endsWith('/') ? tag.href.slice(0, -1) : tag.href} />
        ))}
        <title>{seo_title}</title>
        <meta name="description" content={seo_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keyword" content={keywords} />
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
              socialData
            }}
          >
            <DefaultLayout>
              <Hero
                title={page_title}
                crumbs={
                  seo_title
                    ? newArray
                    : [
                      {
                        title: '404',
                        title_uk: '404',
                        title_en: '404',
                        url: '',
                        id: 404,
                      },
                    ]
                }
              />
              <div className="container-xxl">
                <div className="row">
                  <div className="col article-col pe-md-2">
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
                      <div className="sidebar-section">
                        <ul className="menu">
                          {/* code related to accordions */}
                          <AccordionMenu
                            accordion={accordion}
                            locale={locale}
                          ></AccordionMenu>
                        </ul>
                      </div>
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

export async function getServerSideProps({ query, locale, res, resolvedUrl }: Query) {
  const slug = `/${query?.slug}` || '';
  const strapiLocale = locale === 'ua' ? 'uk' : locale;
  const [pageRes, strapiMenu, socialRes, mostPopular, mostPopularNews, getHeaderFooterMenusResponce, pagesWithSameUrl,randomBanner] = await Promise.all([
    server.get(getAccordion(`/info${slug}`, $(locale))),
    server.get(getMenu('main')),
    server.get('/social'),
    getRandomPopularNews(strapiLocale, 4),
    getRandomPopularNews(strapiLocale, 4, "newss"),
    getHeaderFooterMenus(strapiLocale),
    server.get(getAccordion(`/info${slug}`, "all")),
    getRandomBanner(locale),

  ]);
  const activePageLocales = pagesWithSameUrl.data.data.map(element=> element.attributes.locale);
  
  const { menu, allPages, footerMenus, footerGeneral } =
    getHeaderFooterMenusResponce;

  const crumbs = strapiMenu.data.data[0].attributes.items.data;

  if (!isPageWithLocaleExists(resolvedUrl, locale, allPages)) {
    res.statusCode = 404
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

    // replace port in images

    function getCurrentUrlItem(
      crumbs: Crumb[],
      parent: Crumb | null,
      grandParent: Crumb | null,
      ancestors: Crumb[]
    ) {
      // create parent array and if the item with matched doesn't have children,
      // return parent's array
      for (const item of crumbs) {
        // Check if the current item has a 'url' property matching the specified URL
        if (item.attributes.url === url) {
          // return item.attributes.children.data; // Return the item if found
          return {
            item,
            parent,
            grandParent,
            ancestors,
          };
        }

        // If the current item has children, recursively search within the children
        if (item.attributes.children.data.length > 0) {
          const validatedAncestors = item.attributes.url.includes('/info')
            ? [...ancestors, item]
            : ancestors;
          const foundInChildren = getCurrentUrlItem(
            item.attributes.children.data,
            item,
            parent,
            validatedAncestors
          );
          if (foundInChildren) {
            return foundInChildren; // Return the found item from children
          }
        }
      }
    }

    const accordion = getCurrentUrlItem(crumbs, null, null, []);

    return {
      props: {
        activePageLocales,
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
        accordion,
        socialData: socialData ?? null,
        mostPopular,
        mostPopularNews,
      },
    };
  }
  return {
    props: {
      activePageLocales,
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
      accordion: null,
      socialData: socialData ?? null,
      mostPopular: [],
      mostPopularNews: [],
    },
  };
}

export default Page;
