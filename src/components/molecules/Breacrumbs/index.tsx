// @ts-nocheck

import React from 'react';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import Link from 'next/link';

export interface BreadcrumbsProps {
  crumbs: Crumb[];
  pageTitle: string;
}

export interface Crumb {
  id: number;
  title: String;
  url: string;
}

const Breadcrumbs = ({ crumbs, pageTitle }: BreadcrumbsProps) => {
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;

  return (
    <nav aria-label="breadcrumb">
      <ol itemScope itemType="http://schema.org/BreadcrumbList" className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft">
        <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item" style={{ color: 'white' }}>
          <Link itemProp="item" href="/">
            <span style={{ color: "white" }} itemProp="name">
              {$t[locale].menu.main}
            </span>
            <meta itemProp="position" content="1" />
          </Link>

        </li>
        {crumbs.length ? (
          crumbs.map((crumb, postion) => {
            console.log(crumb)
            return (
              <li itemProp="itemListElement" key={crumb.id} itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item" style={{ color: 'white' }}>
                <Link itemProp="item" href={crumb.url}>
                  <span style={{ color: "white" }} itemProp="name">
                    {locale === 'ru' ? crumb.title : crumb[`title_${locale}`]}
                  </span>
                  <meta itemProp="position" content={postion + 2} />
                </Link>
              </li>
            );
          })
        ) : (
          <li itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem" className="breadcrumb-item" style={{ color: 'white' }}>
            <Link itemProp="item" href={router.asPath}>
              <span style={{ color: "white" }} itemProp="name">
                {pageTitle}
              </span>
              <meta itemProp="position" content="1" />
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
