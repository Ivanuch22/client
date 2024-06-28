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
                          <Link href={`/blog`}>
                            <h2 className="d-inline text-white heading_title">{$t[locale].blog.all} | </h2>
                          </Link>
                          {headings.map((heading, index) => {
                            const headingName = heading?.attributes.Name;
                            const isLast = index === headings.length - 1;

                            return (
                              <div key={heading.id} className='d-flex gap-2 align-items-center  '>
                                <Link href={`/blog?heading=${headingName}`}>
                                  <h2 className="d-inline heading_title text-white heading_name">
                                    {headingName.charAt(0).toUpperCase() + headingName.slice(1)}
                                  </h2>
                                </Link>
                                {!isLast && <span className="d-inline heading_title text-white"> | </span>}
                              </div>
                            );
                          })}
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
                      <div className=' col article-col gap-5  d-flex flex-column col  '>
                        {pages.map((page, index) => {
                          const { page_title, admin_date, url, heading, comments, views } = page.attributes;
                          const imageUrl = (page.attributes.image.data) ? page.attributes.image.data.attributes.url : "";

                          return (
                            <section className="row row-line" key={index}>
                              <div className="col-sm-3 col-img mb-3 mb-sm-0 blog_img_block">
                                <div className="col-img-in">
                                  <Link
                                    href={`${sanitizeImageUrl(url)}`}
                                    className="thumb-responsive lazy-load a-not-img lazy-loaded mostpopularImgBlock"
                                    style={{ backgroundImage: `url(${sanitizeImageUrl(NEXT_STRAPI_BASED_URL + imageUrl)})` }}
                                  />
                                </div>
                              </div>
                              <div className="col-sm-9 col-txt d-flex flex-column justify-content-between blog_text_block  " style={{ paddingRight: 0 }}>
                                <h2 className="entry-title text-uppercase">
                                  <Link className="entry-title text-uppercase h4" href={url}>{hyphenateText(page_title)}</Link>
                                </h2>
                                <div className="hidden-sm hidden-xs pb-2">
                                  <div className="entry-header" style={{ clear: "both" }}>
                                    <div className="align-items-center d-flex gap-3">
                                      <span className="category-color" style={{ color: "#933758" }}>
                                        <Link href={`/blog?heading=${heading.data?.attributes.Name}`} className="text-info text-capitalize fw-bold a-not-img">
                                          {heading.data?.attributes.Name}
                                        </Link>
                                      </span>
                                      <span className="date part">
                                        {formatDateTime(admin_date, false)}
                                      </span>
                                      <span className="comments part" >
                                        <Link href={`${url}#comment`} className="align-items-center d-flex">
                                          <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                            width="22px" height="22px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xmlSpace="preserve">
                                            <g>
                                              <path fill="#231F20" d="M60,0H16c-2.211,0-4,1.789-4,4v6H4c-2.211,0-4,1.789-4,4v30c0,2.211,1.789,4,4,4h7c0.553,0,1,0.447,1,1v11
		c0,1.617,0.973,3.078,2.469,3.695C14.965,63.902,15.484,64,16,64c1.039,0,2.062-0.406,2.828-1.172l14.156-14.156
		c0,0,0.516-0.672,1.672-0.672S50,48,50,48c2.211,0,4-1.789,4-4v-8h6c2.211,0,4-1.789,4-4V4C64,1.789,62.211,0,60,0z M52,44
		c0,1.105-0.895,2-2,2c0,0-14.687,0-15.344,0C32.709,46,32,47,32,47S20,59,18,61c-2.141,2.141-4,0.391-4-1c0-1,0-12,0-12
		c0-1.105-0.895-2-2-2H4c-1.105,0-2-0.895-2-2V14c0-1.105,0.895-2,2-2h46c1.105,0,2,0.895,2,2V44z M62,32c0,1.105-0.895,2-2,2h-6V14
		c0-2.211-1.789-4-4-4H14V4c0-1.105,0.895-2,2-2h44c1.105,0,2,0.895,2,2V32z"/>
                                              <path fill="#231F20" d="M13,24h13c0.553,0,1-0.447,1-1s-0.447-1-1-1H13c-0.553,0-1,0.447-1,1S12.447,24,13,24z" />
                                              <path fill="#231F20" d="M41,28H13c-0.553,0-1,0.447-1,1s0.447,1,1,1h28c0.553,0,1-0.447,1-1S41.553,28,41,28z" />
                                              <path fill="#231F20" d="M34,34H13c-0.553,0-1,0.447-1,1s0.447,1,1,1h21c0.553,0,1-0.447,1-1S34.553,34,34,34z" />
                                            </g>
                                          </svg>                                      <span className="disqus-comment-count"  >{comments.data.length}</span>
                                        </Link>
                                      </span>
                                      <div className='view part'>
                                        <div className='w-auto align-items-center d-flex'>
                                          <svg style={{ marginRight: 7 }} height="24" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#c7c7c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#c7c7c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>

                                          {views}</div>

                                      </div>

                                    </div>
                                  </div>
                                </div>
                              </div>
                            </section>
                          );
                        })}

                      </div>
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
  const { page = 1, perPage = 5, heading = '' } = query;
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
    const fieldsToPopulate = ["seo_title",
      "page_title",
      "seo_description",
      "url",
      "keywords",
      "faq",
      "extraLinks",
      "code",
      "rating",
      "article",
      "howto",
      "image",
      "admin_date",
      "heading",
      "is_popular",
      "views",
      "comments",]; // Додайте всі необхідні поля, окрім 'body'

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

