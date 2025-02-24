// @ts-nocheck
import { useState } from 'react';
import { server } from '@/http/index';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DefaultLayout from '@/components/layouts/default';
import Sidebar from '@/components/organisms/Sidebar';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import Hero from '@/components/organisms/hero';
import { Crumb } from '@/components/molecules/Breacrumbs';
import genRatingData from '@/utils/generators/genRatingData';
import genFaqData from '@/utils/generators/genFaqData';
import genArticleData from '@/utils/generators/genArticleData';
import getHowToData from '@/utils/generators/getHowToData';
import { getMenu, getPage } from '@/utils/queries';
import { $ } from '@/utils/utils';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { errorText, message404 } from './switch';
import getRandomBanner from '@/utils/getRandomBanner';
import isPageWithLocaleExists from '@/utils/isPageWithLocaleExists';
import $t from '@/locale/global';
import parse from 'html-react-parser';
import getConfig from 'next/config';
import Link from 'next/link';
import { generateHrefLangTags } from '@/utils/generators/generateHrefLangTags';
import MostPopular from '@/components/organisms/MostPopular';
import getRandomPopularNews from '@/utils/getRandomPopularNews';
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
    q: string | null;
  };
  locale: string;
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
  listPagesData,
  mostPopularNews,
  mostPopular,
  activePageLocales,
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
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;

  const asPath = router.asPath;
  const hrefLangTags = generateHrefLangTags(asPath, activePageLocales);
  return (
    <>
      <Head>
        <title>{seo_title}</title>
        <meta name="description" content={seo_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keyword" content={keywords} />
        {hrefLangTags.map(tag => {
          console.log(tag.href.endsWith('/'));
          return (
            <link
              key={tag.key}
              rel={tag.rel}
              hrefLang={tag.hrefLang}
              href={tag.href.endsWith('/') ? tag.href.slice(0, -1) : tag.href}
            />
          );
        })}
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
                              ? `${
                                  errorText[
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
                      {listPagesData.length > 0 &&
                        listPagesData.map((page, index) => {
                          const title =
                            locale === 'ru'
                              ? page.title
                              : page[`title_${locale}`];
                          if (title === 'nopage' || page.target === '_blank')
                            return null;
                          {
                            title;
                          }
                          return (
                            <div
                              style={{
                                marginLeft: page.childrenStatus ? '30px' : '0',
                              }}
                              key={index}
                            >
                              <h4 class="mb-1">
                                <Link href={page.url}>{title}</Link>
                              </h4>
                              <Link
                                class="font-13 text-success mb-3"
                                href={page.url}
                              >{`${NEXT_FRONT_URL}${page.url}`}</Link>
                              <hr class="hr"></hr>
                            </div>
                          );
                        })}
                      {listPagesData.length <= 0 && (
                        <div dangerouslySetInnerHTML={{ __html: body }}></div>
                      )}
                    </div>
                  </div>
                  <Sidebar randomBanner={randomBanner}>
                    <MostPopular
                      title={$t[locale].news.mostpopular}
                      data={mostPopularNews}
                    />
                    <MostPopular
                      title={$t[locale].blog.mostpopular}
                      data={mostPopular}
                    />
                  </Sidebar>
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
  const pagesWithSameUrl = await server.get(getPage(slug, 'all'));

  const activePageLocales = pagesWithSameUrl.data.data.map(
    element => element.attributes.locale
  );

  const strapiLocale = locale === 'ua' ? 'uk' : locale;

  const { menu, allPages, footerMenus, footerGeneral } =
    await getHeaderFooterMenus(strapiLocale);

  function collectChildren(data, array) {
    let results = [];
    function traverse(children, bool) {
      if (children && children.data) {
        for (let child of children.data) {
          const { title, url, title_en, title_uk, target } = child.attributes;
          array.push({
            title,
            url,
            title_en,
            title_uk,
            target,
            childrenStatus: bool,
          });
          traverse(child.attributes.children, true);
        }
      }
    }
    traverse(data?.attributes.children, false);
    return results;
  }
  function findChildrenByUrl(obj, targetUrl) {
    let result = [];

    function search(item) {
      if (typeof item === 'object' && item !== null) {
        for (let key in item) {
          if (item[key] === targetUrl && item.children) {
            item.children.data.map(el => result.push(el.attributes));
            return;
          }
          if (typeof item[key] === 'object') {
            search(item[key]);
          }
        }
      }
    }

    search(obj);
    return result;
  }

  const getMenuUrlArray = menu.map(element => element.attributes.url);
  const getMenuUrlArray2 = findChildrenByUrl(menu, resolvedUrl);
  const getPageListUrl = getMenuUrlArray.filter(url => url === resolvedUrl)[0];
  const listPagesData = [];

  if (getPageListUrl)
    collectChildren(
      menu.filter(element => element.attributes.url === getPageListUrl)[0],
      listPagesData
    );

  const strapiMenu = await server.get(getMenu('main'));

  const crumbs = strapiMenu.data.data[0].attributes.items.data;

  if (!isPageWithLocaleExists(resolvedUrl, locale, allPages)) {
    res.statusCode = 404;
  }

  const socialRes = await server.get('/social');
  const socialData = socialRes.data.data.attributes;

  let mostPopular = await getRandomPopularNews(strapiLocale);
  let mostPopularNews = await getRandomPopularNews(
    strapiLocale,
    5,
    'newss',
    false
  );

  if (mostPopular.length === 0) {
    mostPopular = await getRandomPopularNews('ru');
  }

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
        listPagesData:
          listPagesData.length > 0 ? listPagesData : getMenuUrlArray2,
        mostPopular,
        mostPopularNews,
      },
    };
  }

  return {
    props: {
      activePageLocales,
      mostPopularNews,
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
      socialData: socialData ?? {},
      listPagesData,
    },
  };
}

export default Page;
