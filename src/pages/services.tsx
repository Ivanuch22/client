//@ts-nocheck

import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import { useEffect, useState } from 'react';
import { server } from '@/http';
import Script from 'next/script';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import Link from 'next/link';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';

export interface Contacts {
  location: string;
  phone_number: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
export interface StrapiContacts {
  data: {
    id: number;
    attributes: Contacts;
  };
  meta: {};
}

export const initialContacts: Contacts = {
  location: '',
  phone_number: '',
  email: '',
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
};

export default function Home({
  tags,
  pagination,
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  socialData,
}) {
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const getPath = useRouter()
  console.log(getPath,"sdl;fj")
  const { query } = router;
  const { perPage } = query;

  const [paginationPage, setPaginationPage] = useState(pagination.page);

  const goToPage = n =>
    router.push(`/services?page=${n}&perPage=${perPage ? perPage : ''}`);

  return (
    <>
      <Head>
        <title>{$t[locale].services.seo_title}</title>
        <meta
          name="description"
          content={$t[locale].services.seo_description}
        />
        <meta name="keywords" content={$t[locale].services.seo_keywords} />
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
              <div className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  <div className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5">
                    <div className="row g-5 pt-1">
                      <div
                        className="col-12 text-center text-md-start"
                        style={{ marginTop: '40px', marginBottom: '50px' }}
                      >
                        <h1 className="display-4 text-white animated slideInLeft">
                          {$t[locale].menu.services}
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
                                  {$t[locale].menu.services}
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
                className="container-xxl py-5 service-items"
                style={{ maxWidth: '90%', margin: '0 auto' }}
              >
                <div>
                  {tags.map(tag => {
                    return (
                      <Link
                        href={`/service${tag.attributes.url}`}
                        className="mx-1 badge bg-primary service-item"
                        key={tag.id}
                      >
                        {tag.attributes.page_title}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="d-flex justify-content-center">
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
              </div>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps({ query, locale }: Query) {
  const { page = 1, perPage = 100 } = query;

  try {
    const res = await server.get(
      `/page-seos?locale=${locale === 'ua' ? 'uk' : locale
      }&pagination[page]=${page}&pagination[pageSize]=${perPage}`
    );

    const tags = res.data.data;
    const pagination = res.data.meta.pagination;

    const strapiLocale = locale === 'ua' ? 'uk' : locale;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes;

    if (page > pagination.pageCount) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        tags,
        pagination,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
    };
  } catch (error) {
    return {
      notFound: true,
      allPages: [],
      footerMenus: {
        about: { title: '', items: [] },
        services: { title: '', items: [] },
        contacts: {},
      },
      footerGeneral: {},
      socialData: socialData ?? null,
    };
  }
}
