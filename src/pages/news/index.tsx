//@ts-nocheck

import Link from 'next/link';
import Head from 'next/head';
import { server } from '@/http';
import Script from 'next/script';
import $t from '@/locale/global';
import { useState, useEffect, useMemo } from 'react';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import formatDateTime from '@/utils/formateDateTime';
import Sidebar from '@/components/organisms/Sidebar';
import getRandomBanner from '@/utils/getRandomBanner';
import DefaultLayout from '@/components/layouts/default';
import MostPopular from '@/components/organisms/MostPopular';
import getRandomPopularNews from '@/utils/getRandomPopularNews';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import removeBodyField from '@/utils/removeBodyFromArray';
import Image from 'next/image';
import { generateHrefLangTags } from '@/utils/generators/generateHrefLangTags';

const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;

export default function Home({
  pages,
  headings,
  pagination,
  randomBanner,
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  mostPopular,
  socialData,
  mostPopularNews
}) {
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const { query } = router;
  const { perPage } = query;
  const [paginationPage, setPaginationPage] = useState(pagination.page);


  const activeHeading = useMemo(() => headings.find((element) => element?.attributes?.Name === query?.heading && locale == element?.attributes?.locale), [query]);

  function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
      // Function to update the window width
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      // Add event listener to window resize
      window.addEventListener('resize', handleResize);

      // Call the handleResize function to set the initial width
      handleResize();

      // Remove event listener on cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    return windowWidth;
  }
  const windowWidth = useWindowWidth();

  function sanitizeImageUrl(url) {
    return url.replace(/[^a-zA-Z0-9-_.~:/?#[\]@!$&'()*+,;=%]/g, '');
  }

  const goToPage = n => {
    router.push(`/news?page=${n}`);
  }
  function hyphenateText(text) {
    if (windowWidth > 1124) {
      return text.replace(/(\w{1})/g, '$1\u00AD');

    }
    return text
  }

  const asPath = router.asPath
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;
  const hrefLangTags = generateHrefLangTags(asPath);

  return (
    <>
      <Head>
        <title>{activeHeading?.attributes?.blog_title ? activeHeading?.attributes?.blog_title : $t[locale].news.title}</title>
        {hrefLangTags.map((tag) => (
          <link key={tag.key} rel={tag.rel} hrefLang={tag.hrefLang} href={tag.href} />
        ))}
        <meta
          name="description"
          content={activeHeading?.attributes?.blog_descriptions ? activeHeading?.attributes?.blog_descriptions : $t[locale].news.description}
        />
        <meta name="keywords" content={$t[locale].news.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
              <main className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  <div className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5" style={{ marginLeft: 0 }}>
                    <div className="row g-5 pt-1">
                      <div
                        className="col-12 text-center text-md-start"
                        style={{ marginTop: '40px', marginBottom: '50px' }}
                      >
                        <h1 className="text-white animated d-flex align-items-center flex-wrap slideInLeft">
                          <nav >
                            <ul itemScope itemType="http://schema.org/BreadcrumbList" className="text-white animated d-flex align-items-center flex-wrap slideInLeft" style={{ paddingLeft: 0, listStyleType: "none", display: "flex" }} >
                              <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className='d-flex gap-2 align-items-center '>
                                <Link href={`/news`} itemProp="item" className="d-inline text-white heading_title" >
                                  <span itemProp="name">
                                    {$t[locale].news.all}
                                  </span>
                                  <meta itemProp="position" content="1" />
                                </Link>
                                <span className="d-inline heading_title text-white"> | </span>
                              </li>
                              {headings.map((heading, index) => {
                                const headingName = heading?.attributes.Name;
                                const isLast = index === headings.length - 1;
                                return (
                                  <li key={heading.id} className='d-flex gap-2 align-items-center ' itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem">
                                    <Link href={`/news?heading=${headingName}`} itemProp="item">
                                      <h2 className="d-inline heading_title text-white heading_name" itemProp="name">
                                        {headingName.charAt(0).toUpperCase() + headingName.slice(1)}
                                      </h2>
                                      <meta itemProp="position" content={index + 2} />
                                    </Link>
                                    {!isLast && <span className="d-inline heading_title text-white"> | </span>}
                                  </li>
                                );
                              })}
                            </ul>
                          </nav>
                        </h1>
                        <nav aria-label="breadcrumb">
                          <ol itemScope itemType="http://schema.org/BreadcrumbList" className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft">
                            <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item">
                              <Link itemProp="item" className="text-white" href="/">
                                <meta itemProp="position" content="1" />
                                <span itemProp="name">
                                  {$t[locale].menu.main}
                                </span>
                              </Link>
                            </li>
                            <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item">
                              <Link itemProp="item" className="text-white" href="/news">
                                <meta itemProp="position" content="2" />
                                <span itemProp="name">
                                  {$t[locale].news.titleName}
                                </span>
                              </Link>
                            </li>
                          </ol>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              <div className="container-xxl">
                <div className="row">
                  <div className="col article-col pe-md-2">
                    <main
                      className="cont-body"
                      style={{ maxWidth: '90%', margin: '0 auto' }}
                    >
                      <section itemScope itemType="http://schema.org/Blog" className=' col article-col gap-5  d-flex flex-column col  '>
                        {pages.map((page, index) => {
                          const { page_title, admin_date, url, heading, comments, views, article, seo_title } = page.attributes;
                          const imageUrl = page?.attributes?.image?.data ? page?.attributes?.image?.data?.attributes?.url : undefined;
                          return (
                            <article itemProp="blogPosts" itemScope itemType="http://schema.org/BlogPosting" className="row row-line" key={index}>
                              <meta itemProp="headline" content={seo_title} />
                              <meta itemProp="datePublished" content={admin_date} />
                              <meta itemProp="interactionCount" content={`UserComments:${comments.data.length}`} />
                              {imageUrl &&
                                <div className="col-sm-3 col-img mb-3 mb-sm-0 blog_img_block">
                                  <div className="col-img-in">
                                    <Link
                                      href={`${sanitizeImageUrl(url)}`}
                                      className="thumb-responsive lazy-load a-not-img lazy-loaded mostpopularImgBlock"
                                    >
                                      <Image loading={index === 0 ? "eager" : "lazy"} itemProp="image" src={`${sanitizeImageUrl(NEXT_STRAPI_BASED_URL + imageUrl)}`} width={260} height={100} alt='img' />
                                    </Link>
                                  </div>
                                </div>
                              }
                              <div className="col-sm-9 col-txt d-flex flex-column justify-content-between blog_text_block  " style={{ paddingRight: 0, width: "100%" }}>
                                <h2 className="entry-title text-uppercase">
                                  <Link itemProp="mainEntityOfPage" className="entry-title text-uppercase h4" href={url}>{hyphenateText(page_title)}</Link>
                                </h2>
                                <div className="hidden-sm hidden-xs pb-2">
                                  <div className="entry-header" style={{ clear: "both" }}>
                                    <div className="align-items-center d-flex gap-3">
                                      <span className="category-color" style={{ color: "#933758" }}>
                                        <Link itemProp="articleSection" href={`/news?heading=${heading.data?.attributes.Name}`} className="text-info text-capitalize fw-bold a-not-img">
                                          {heading.data?.attributes.Name}
                                        </Link>
                                      </span>
                                      <span className="date part">
                                        {formatDateTime(admin_date, false)}
                                      </span>
                                      <span className="comments part" >
                                        <Link itemProp="discussionUrl" href={`${url}#comment`} className="align-items-center d-flex">
                                          <div style={{ height: "24px", width: "20px" }}>

                                            <picture>
                                              <Image src={"/img/commentSvgIcon.svg"} width="24" height="24" alt="comment icon"></Image>
                                            </picture>
                                          </div>
                                          <span className="disqus-comment-count"  >{comments.data.length}</span>
                                        </Link>
                                      </span>
                                      <div className='view part' itemProp="interactionStatistic" itemScope itemType="http://schema.org/InteractionCounter">
                                        <meta itemProp="interactionType" content="http://schema.org/ViewAction" />
                                        <div className='w-auto align-items-center d-flex'>
                                          <div style={{ height: "24px", width: "20px", marginRight: 7 }}>
                                            <picture >
                                              <Image src={"/img/viewSvgIcon.svg"} height="24" width="20" alt='views'></Image>
                                            </picture>
                                          </div>

                                          <meta itemProp="userInteractionCount" content={views} />
                                          {views}</div>

                                      </div>

                                    </div>
                                  </div>
                                </div>
                              </div>
                              {article && (
                                <div
                                  className='notShowOnPage'
                                >
                                  <span itemProp="author" itemScope itemType="https://schema.org/Person">
                                    <link itemProp="url" href={`${NEXT_FRONT_URL}/user/${article?.author?.data?.attributes?.username}`} />
                                    <span itemProp="name" href={`${NEXT_FRONT_URL}/user/${article?.author?.data?.attributes?.username}`} >
                                      {article?.author.data.attributes.real_user_name}
                                    </span>
                                  </span>
                                  {article?.images?.data.map((image) => {
                                    return (
                                      <Image loading="lazy" width={10} height={10} itemProp="image" src={`${sanitizeImageUrl(image?.attributes?.url || NEXT_USER_DEFAULT_URL)}`} alt={image?.attributes?.alternativeText || "img"} key={image.id} />
                                    )
                                  })}
                                </div>

                              )}
                            </article>
                          );
                        })}
                      </section>
                    </main>
                  </div>
                  <Sidebar randomBanner={randomBanner}>
                    <MostPopular title={$t[locale].blog.mostpopular} data={mostPopular} />
                    <MostPopular title={$t[locale].news.mostpopular} data={mostPopularNews}/>
                  </Sidebar>
                </div>
              </div>
              <article className="d-flex mt-5 justify-content-center">
                {pagination.pageCount > 1 && (
                  <PaginationControl
                    page={paginationPage}
                    between={4}
                    total={pagination.total}
                    limit={pagination.pageSize}
                    changePage={page => {
                      setPaginationPage(page);
                      goToPage(page);
                    }}
                    ellipsis={1}
                  />
                )}
              </article>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps({ query, locale }) {
  const { page = 1, perPage = 15, heading = '' } = query;
  const Locale = locale === 'ua' ? 'uk' : locale;
  const filter = heading ? `&filters[heading][Name]=${heading}` : '';
  // Паралельне виконання запитів
  const [randomBanner, mostPopular,mostPopularNews, socialRes, headingsRes, getPagesRes, headerFooterData] = await Promise.all([
    getRandomBanner(locale),
    getRandomPopularNews(locale, 4, "blogs"),
    getRandomPopularNews(locale, 4, "newss"),
    server.get('/social'),
    server.get(`/headings-news?locale=${Locale}`).catch(() => ({ data: { data: [] } })), // Обробка помилок
    server.get(`/newss?locale=${Locale}&pagination[page]=${page}&pagination[pageSize]=${perPage}${filter}&sort[0]=admin_date:desc&populate[article][populate][author]=*&populate[article][populate][images]=*&populate[comments]=user_name,CustomHistory&populate=image&populate[faq]=*&populate[rating]=*&populate[heading]=*&populate[code]=*&populate[howto]=*`),
    getHeaderFooterMenus(Locale),
  ]);
  console.log(`/newss?locale=${Locale}&pagination[page]=${page}&pagination[pageSize]=${perPage}${filter}&sort[0]=admin_date:desc&populate[article][populate][author]=*&populate[article][populate][images]=*&populate[comments]=user_name,CustomHistory&populate=image&populate[faq]=*&populate[rating]=*&populate[heading]=*&populate[code]=*&populate[howto]=*`, "sdfsdf")

  const headings = headingsRes?.data?.data || [];
  const pages = getPagesRes?.data?.data || [];
  const pagination = getPagesRes?.data?.meta?.pagination || {};

  const { menu, allPages, footerMenus, footerGeneral } = headerFooterData || {};
  const socialData = socialRes?.data?.data?.attributes || null;

  return {
    props: {
      mostPopularNews,
      randomBanner,
      pages: removeBodyField(pages),
      headings,
      mostPopular: removeBodyField(mostPopular),
      pagination,
      menu: menu || [],
      allPages: allPages || [],
      footerMenus: footerMenus || { about: {}, services: {}, contacts: {} },
      footerGeneral: footerGeneral || {},
      socialData,
    },
  };
}
