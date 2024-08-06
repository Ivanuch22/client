//@ts-nocheck

import Link from 'next/link';
import Head from 'next/head';
import { server } from '@/http';
import Script from 'next/script';
import $t from '@/locale/global';
import { useState, useEffect } from 'react';
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

const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_BASED_URL, NEXT_FRONT_URL } = publicRuntimeConfig;

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
}) {
  const router = useRouter();

  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const { query } = router;
  const { perPage } = query;
  const [paginationPage, setPaginationPage] = useState(pagination.page);

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
    router.push(`/blog?page=${n}`);
  }
  function hyphenateText(text) {
    if (windowWidth > 1124) {
      return text.replace(/(\w{1})/g, '$1\u00AD');

    }
    return text
  }

  return (
    <>
      <Head>
        <title>{$t[locale].blog.title}</title>
        <meta
          name="description"
          content={$t[locale].blog.description}
        />
        <meta name="keywords" content={$t[locale].blog.keywords} />
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
              <main className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  <div className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5">
                    <div className="row g-5 pt-1">
                      <div
                        className="col-12 text-center text-md-start"
                        style={{ marginTop: '40px', marginBottom: '50px' }}
                      >
                        <h1 className="text-white animated d-flex align-items-center flex-wrap slideInLeft">
                          <nav style={{display: "flex"}} itemScope itemType="http://schema.org/BreadcrumbList">
                            <Link href={`/blog`} itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem">
                              <h2 className="d-inline text-white heading_title" itemProp="name">{$t[locale].blog.all}</h2>
                              <meta itemProp="position" content="1" />
                              <span className="d-inline heading_title text-white"> | </span>
                            </Link>
                            {headings.map((heading, index) => {
                              const headingName = heading?.attributes.Name;
                              const isLast = index === headings.length - 1;
                              return (
                                <div key={heading.id} className='d-flex gap-2 align-items-center ' itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem">
                                  <Link href={`/blog?heading=${headingName}`} itemProp="item">
                                    <h2 className="d-inline heading_title text-white heading_name" itemProp="name">
                                      {headingName.charAt(0).toUpperCase() + headingName.slice(1)}
                                    </h2>
                                    <meta itemProp="position" content={index + 2} />
                                  </Link>
                                  {!isLast && <span className="d-inline heading_title text-white"> | </span>}
                                </div>
                              );
                            })}
                          </nav>
                        </h1>
                        <nav aria-label="breadcrumb">
                          <ol className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft">
                            <li className="breadcrumb-item">
                              <a className="text-white" href="#">
                                {$t[locale].menu.main}
                              </a>
                            </li>
                            <li className="breadcrumb-item">
                              <a className="text-white" href="/blog">
                                {$t[locale].blog.titleName}
                              </a>
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

                          const { page_title, admin_date, url, heading, comments, views, article } = page.attributes;
                          console.log(article, "article")
                          const imageUrl = (page.attributes.image.data) ? page.attributes.image.data.attributes.url : "";
                          console.log(comments)
                          return (
                            <article itemProp="blogPosts" itemScope itemType="http://schema.org/BlogPosting" className="row row-line" key={index}>
                              <meta itemProp="headline" content={page_title} />
                              <meta itemProp="datePublished" content={admin_date} />
                              <meta itemProp="interactionCount" content={`UserComments:${comments.data.length}`} />
                              <div className="col-sm-3 col-img mb-3 mb-sm-0 blog_img_block">
                                <div className="col-img-in">
                                  <Link
                                    href={`${sanitizeImageUrl(url)}`}
                                    className="thumb-responsive lazy-load a-not-img lazy-loaded mostpopularImgBlock"
                                  // style={{ backgroundImage: `url(${sanitizeImageUrl(NEXT_STRAPI_BASED_URL + imageUrl)})` }}
                                  >
                                    <Image itemProp="image" src={`${sanitizeImageUrl(NEXT_STRAPI_BASED_URL + imageUrl)}`} width={260} height={100} alt='img' />
                                  </Link>
                                </div>
                              </div>
                              <div className="col-sm-9 col-txt d-flex flex-column justify-content-between blog_text_block  " style={{ paddingRight: 0 }}>
                                <h2 className="entry-title text-uppercase">
                                  <Link itemProp="mainEntityOfPage" className="entry-title text-uppercase h4" href={url}>{hyphenateText(page_title)}</Link>
                                </h2>
                                <div className="hidden-sm hidden-xs pb-2">
                                  <div className="entry-header" style={{ clear: "both" }}>
                                    <div className="align-items-center d-flex gap-3">
                                      <span className="category-color" style={{ color: "#933758" }}>
                                        <Link itemProp="articleSection" href={`/blog?heading=${heading.data?.attributes.Name}`} className="text-info text-capitalize fw-bold a-not-img">
                                          {heading.data?.attributes.Name}
                                        </Link>
                                      </span>
                                      <span className="date part">
                                        {formatDateTime(admin_date, false)}
                                      </span>
                                      <span className="comments part" >
                                        <Link itemProp="discussionUrl" href={`${url}#comment`} className="align-items-center d-flex">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16.8951 4H7.10486C5.95297 4 5.36572 4.1134 4.7545 4.44028C4.19025 4.74205 3.74205 5.19025 3.44028 5.7545C3.1134 6.36572 3 6.95297 3 8.10486V13.8951C3 15.047 3.1134 15.6343 3.44028 16.2455C3.74205 16.8097 4.19025 17.258 4.7545 17.5597L4.8954 17.6314C5.4124 17.8807 5.94467 17.9827 6.84879 17.9979L7.1 18V20.2149C7.1 20.6467 7.2693 21.0614 7.57155 21.3698L7.68817 21.478C8.33091 22.0196 9.29233 21.9937 9.90488 21.3933L13.366 18H16.8951C18.047 18 18.6343 17.8866 19.2455 17.5597C19.8097 17.258 20.258 16.8097 20.5597 16.2455C20.8866 15.6343 21 15.047 21 13.8951V8.10486C21 6.95297 20.8866 6.36572 20.5597 5.7545C20.258 5.19025 19.8097 4.74205 19.2455 4.44028C18.6343 4.1134 18.047 4 16.8951 4ZM6.91166 5.80107L16.8951 5.8C17.7753 5.8 18.0818 5.85919 18.3966 6.02755C18.6472 6.16155 18.8384 6.35282 18.9725 6.60338C19.1408 6.91818 19.2 7.2247 19.2 8.10486V13.8951L19.1956 14.2628C19.1792 14.8698 19.1149 15.1303 18.9725 15.3966C18.8384 15.6472 18.6472 15.8384 18.3966 15.9725C18.0818 16.1408 17.7753 16.2 16.8951 16.2H13L12.8832 16.2076C12.6907 16.2328 12.5103 16.3198 12.3701 16.4572L8.9 19.857V17.1C8.9 16.6029 8.49706 16.2 8 16.2H7.10486L6.73724 16.1956C6.13019 16.1792 5.86975 16.1149 5.60338 15.9725C5.35282 15.8384 5.16155 15.6472 5.02755 15.3966C4.85919 15.0818 4.8 14.7753 4.8 13.8951V8.10486L4.80439 7.73724C4.8208 7.13019 4.88509 6.86975 5.02755 6.60338C5.16155 6.35282 5.35282 6.16155 5.60338 6.02755C5.89396 5.87214 6.1775 5.80975 6.91166 5.80107Z" fill="#D3DCE2" />
                                          </svg>                                     <span className="disqus-comment-count"  >{comments.data.length}</span>
                                        </Link>
                                      </span>
                                      <div className='view part' itemProp="interactionStatistic" itemScope itemType="http://schema.org/InteractionCounter">
                                        <meta itemProp="interactionType" content="http://schema.org/ViewAction" />
                                        <div className='w-auto align-items-center d-flex'>
                                          <svg style={{ marginRight: 7 }} height="24" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#c7c7c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#c7c7c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
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
                                    <link itemProp="url" href={NEXT_FRONT_URL + url} />
                                    <span itemProp="name" href={NEXT_FRONT_URL + url} >
                                      {article?.author}
                                    </span>
                                  </span>
                                  <Image width={10} height={10} itemProp="image" src={`${sanitizeImageUrl(article?.images?.data[0]?.attributes.url)}`} alt="" />
                                  <div itemProp="headline">{article?.title}</div>
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
                  </Sidebar>
                </div>
              </div>
              <article className="d-flex mt-5 justify-content-center">
                {2 && (
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
  let pages, pagination, headings;

  const Locale = locale === 'ua' ? 'uk' : locale;
  const filter = heading ? `&filters[heading][Name]=${heading}` : '';


  const randomBanner = await getRandomBanner(locale);
  const mostPopular = await getRandomPopularNews(locale);

  try {
    const getHeadings = await server.get(`/headings?locale=${Locale}`);
    headings = getHeadings.data.data
  } catch (e) {
    console.error("Error fetching headings data", e);
    headings = [];
  }



  try {
    const fieldsToPopulate = [
      "seo_title",
      "page_title",
      "seo_description",
      "url",
      "keywords",
      "faq",
      "extraLinks",
      "code",
      "rating",
      "article.images", // Змінено тут для включення поля images у article
      "howto",
      "image",
      "admin_date",
      "heading",
      "is_popular",
      "views",
      "comments",
    ];// Додайте всі необхідні поля, окрім 'body'

    const populateParams = fieldsToPopulate.map(field => `populate=${field}`).join('&');

    const getPages = await server.get(`/blogs?${populateParams}&locale=${Locale}&pagination[page]=${page}&pagination[pageSize]=${perPage}${filter}&sort[0]=admin_date:desc`);
    pages = getPages.data.data;
    pagination = getPages.data.meta.pagination;
  } catch (e) {
    console.error("Error fetching data", e);
  }


  try {
    const { menu, allPages, footerMenus, footerGeneral } = await getHeaderFooterMenus(Locale);
    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes;

    return {
      props: {
        randomBanner,
        pages: removeBodyField(pages),
        headings,
        mostPopular: removeBodyField(mostPopular),
        pagination,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
    };
  } catch (error) {
    console.error("Error fetching header/footer data", error);

    return {
      props: {
        randomBanner,
        pages,
        pagination,
        menu: [],
        allPages: [],
        footerMenus: { about: {}, services: {}, contacts: {} },
        footerGeneral: {},
        socialData: null,
      },
    };
  }
}

