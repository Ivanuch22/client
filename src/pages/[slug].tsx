// @ts-nocheck
import { server } from '@/http/index';
import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import Hero from '@/components/organisms/hero';
import { Crumb } from '@/components/molecules/Breacrumbs';
import { useRouter } from 'next/router';

import genRatingData from '@/utils/generators/genRatingData';
import genFaqData from '@/utils/generators/genFaqData';
import genArticleData from '@/utils/generators/genArticleData';

import getHowToData from '@/utils/generators/getHowToData';
import { getMenu, getPage } from '@/utils/queries';
import { $ } from '@/utils/utils';
import genListItemData from '@/utils/generators/genListItemData';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/organisms/Sidebar';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { errorText, message404 } from './switch';
import getRandomBanner from '@/utils/getRandomBanner';
import isPageWithLocaleExists from '@/utils/isPageWithLocaleExists';

import parse from 'html-react-parser';
import getConfig from 'next/config';
import Link from 'next/link';
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
  slug,
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
  listPagesData
}: PageAttibutes) => {
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
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
  const generateHrefLangTags = () => {
    const locales = ['ru', 'en', 'ua'];
    const hrefLangTags = locales.map((lang) => {
      const href = `${NEXT_FRONT_URL}${lang === 'ru' ? '' : "/" + lang}${asPath}`;
      return <link key={lang} rel="alternate" hrefLang={lang} href={href} />;
    });

    // Додавання x-default, який зазвичай вказує на основну або міжнародну версію сайту
    const defaultHref = `${NEXT_FRONT_URL}${asPath}`;
    hrefLangTags.push(<link key="x-default" rel="alternate" hrefLang="x-default" href={defaultHref} />);

    return hrefLangTags;
  };
  return (
    <>
      <Head>
        <title>{seo_title}</title>
        <meta name="description" content={seo_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keyword" content={keywords} />
        {generateHrefLangTags()}
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
        <div className="container-xxl positi  on-relative p-0">
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
              <Hero
                title={page_title}
                crumbs={
                  seo_title
                    ? findAncestors(crumbs, `${slug}`)
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
                      {listPagesData.length>0 && (
                        listPagesData.map(page => (
                          <>
                            <h1>{page.title}</h1>
                            <Link href={page.url}>{page.url}</Link>
                          </>

                        ))
                      )}
                      {listPagesData.length<=0&& (
                      <div dangerouslySetInnerHTML={{ __html: body }}></div>
                      )}
                    </div>
                  </div>
                  <Sidebar randomBanner={randomBanner}></Sidebar>
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

  const pageRes = await server.get(getPage(slug, $(locale)));


  const strapiLocale = locale === 'ua' ? 'uk' : locale;

  const { menu, allPages, footerMenus, footerGeneral } =
    await getHeaderFooterMenus(strapiLocale);


  function collectChildren(data, array) {
    let results = [];
    function traverse(children) {
      if (children && children.data) {
        for (let child of children.data) {
          const { title, url } = child.attributes;
          array.push({ title, url });
          traverse(child.attributes.children);
        }
      }
    }
    traverse(data.attributes.children);
    return results;
  }

  const getMenuUrlArray = menu.map((element) => element.attributes.url)
  const getPageListUrl = getMenuUrlArray.filter((url) => url === resolvedUrl)[0]
  const listPagesData = []

  if (getPageListUrl) collectChildren(menu.filter(element => element.attributes.url === getPageListUrl)[0], listPagesData)

  const strapiMenu = await server.get(getMenu('main'));

  const crumbs = strapiMenu.data.data[0].attributes.items.data;

  if (!isPageWithLocaleExists(resolvedUrl, locale, allPages)) {
    res.statusCode = 404;
  }

  const socialRes = await server.get('/social');
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
    const regex = /src="https:\/\/t-h-logistics\.com:17818\/uploads\//g;
    const replacedImagesSrcBody = body.replace(
      regex,
      'src="https://t-h-logistics.com/uploads/'
    );

    return {
      props: {
        seo_title,
        seo_description,
        page_title,
        url,
        body: replacedImagesSrcBody,
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
        listPagesData
      },
    };
  }

  return {
    props: {
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
      socialData: socialData ?? {},
      listPagesData
    },
  };
}

export default Page;
