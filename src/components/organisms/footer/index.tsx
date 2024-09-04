// @ts-nocheck

import { getFooterGenerall, getContacts, server } from '@/http';
import { Contacts } from '@/pages/contacts';
import { useEffect, useState } from 'react';
import { initialContacts } from '@/pages/contacts';
import { useRouter } from 'next/router';
import Link from 'next/link';
import $t from '@/locale/global';
import useDefaultLayoutContext from '@/hooks/useDefaultLayoutContext';

export interface GenerallData {
  twitter_url: string;
  facebook_url: string;
  youtube_url: string;
  linkedin_url: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  copyright: string;
}

export interface NavItemAttributes {
  order: number;
  title: string;
  url: string;
  target: string;
  createdAt: string;
  updatedAt: string;
  children?: string[];
}

export interface NavItem {
  id: number;
  attributes: NavItemAttributes;
}




const Footer = () => {
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;

  const { footerMenus, footerGeneral } = useDefaultLayoutContext();
  function replaceGAVWithAt(str) {
    const regex = /\[[^\]]*\]/g;
    return str.replace(regex, '@');
  }
  return (
    <footer
      className="container-fluid bg-primary text-white footer mt-5 pt-5 wow fadeIn"
      data-wow-delay="0.1s"
    >
      <div className="container py-5 px-lg-5">
        <div className="row gy-5 gx-4 pt-5">
          <nav className="col-lg-5 col-md-12">
            <div className="row gy-5 g-4">
              <div className='col-md-6'>
                <h5 className="fw-bold text-white mb-4">
                  {$t[locale].footer.about.title}
                </h5>
                <ul style={{ listStyleType: "none", marginTop: 0, paddingTop: 0, paddingLeft: 0 }}>
                  {footerMenus?.about?.items?.map(item => {
                    return (
                      <li key={item.id}>
                        <Link
                          key={item.id}
                          className="btn btn-link"
                          href={item.attributes.url}
                        >
                          {locale === 'ru'
                            ? item.attributes.title
                            : item.attributes[`title_${locale}`]}
                        </Link>
                      </li>

                    );
                  })}
                </ul>
              </div>
              <div className='col-md-6'>
                <h5 className="fw-bold text-white mb-4">
                  {$t[locale].footer.services.title}
                </h5>
                <ul style={{ listStyleType: "none", marginTop: 0, paddingTop: 0, paddingLeft: 0 }}>
                  {footerMenus?.services?.items?.map(item => {
                    return (
                      <li key={item.id}>
                        <Link
                          key={item.id}
                          className="btn btn-link"
                          href={item.attributes.url}
                        >
                          {locale === 'ru'
                            ? item.attributes.title
                            : item.attributes[`title_${locale}`]}
                        </Link>
                      </li>

                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>
          <div className="col-md-6 pt-2 col-lg-3">
            <h5 className="fw-bold text-white mb-4">
              {$t[locale].footer.get_in_touch.title}
            </h5>
            <p className="mb-2">
              <i className="fa fa-map-marker-alt me-3" />
              {footerMenus.contacts?.location}
            </p>
            <p className="mb-2">
              <i className="fa fa-phone-alt me-3" />
              <a
                href={`tel:${footerMenus.contacts?.phone_number}`}
                style={{ color: '#fff' }}
              >
                {footerMenus.contacts?.phone_number}
              </a>
            </p>
            <p className="mb-2">
              <i className="fa fa-envelope me-3" />
              <a
                href={`mailto:${replaceGAVWithAt(footerMenus?.contacts?.email)}`}
                style={{ color: '#fff' }}
              >
                {footerMenus.contacts?.email}
              </a>
            </p>
            <div className="d-flex pt-2">
              <a
                className="btn btn-outline-light btn-social"
                aria-label="twitter_url"
                href={footerGeneral.twitter_url}
                target="_blank"
                rel="nofollow"
              >
                <i className="fab fa-twitter" />
              </a>
              <a
                className="btn btn-outline-light btn-social"
                aria-label="facebook_url"
                href={footerGeneral.facebook_url}
                target="_blank"
                rel="nofollow"
              >
                <i className="fab fa-facebook-f" />
              </a>
              <a
                className="btn btn-outline-light btn-social"
                aria-label="youtube_url"
                href={footerGeneral.youtube_url}
                target="_blank"
                rel="nofollow"
              >
                <i className="fab fa-youtube" />
              </a>
              <a
                className="btn btn-outline-light btn-social"
                aria-label="linkedin_url"
                href={footerGeneral.linkedin_url}
                target="_blank"
                rel="nofollow"
              >
                <i className="fab fa-linkedin-in" />
              </a>
            </div>
          </div>


        </div>
      </div>
      <div className="container px-lg-5">
        <div className="copyright">
          <div className="row  gy-1">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <span
                dangerouslySetInnerHTML={{ __html: footerGeneral.copyright }}
              ></span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-menu">
                <Link href={footerGeneral.footer_url_1 || ''}>
                  {footerGeneral.footer_text_1}
                </Link>
                <Link href={footerGeneral.footer_url_2 || ''}>
                  {footerGeneral.footer_text_2}
                </Link>
                <Link href={footerGeneral.footer_url_3 || ''}>
                  {footerGeneral.footer_text_3}
                </Link>
                <Link href={footerGeneral.footer_url_4 || ''}>
                  {footerGeneral.footer_text_4}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
