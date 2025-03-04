// @ts-nocheck
import '@/styles/animate.min.css';

import '@/styles/auth.css';
import '@/styles/owl.carousel.min.css';
import '@/styles/dropdown.css';
import '@/styles/global.css';
import '@/styles/toggler.css';
import '@/styles/call.btn.css';
import '@/styles/itc.css';

import $ from 'jquery';
import React, { useEffect, useMemo } from 'react';
import type { AppProps } from 'next/app';

import localFont from 'next/font/local';
import { AuthProvider } from '@/contexts/AuthContext';
import Head from 'next/head';
import { getCode } from '@/utils/queries';
import { server } from '@/http';
import parse from 'html-react-parser';
import { generateCodeChunks } from '@/utils/generators/generateCodeChunks';
// Define local fonts with optimization
const montserrat = localFont({
  src: [
    {
      path: '../../public/fonts/Montserrat/Montserrat-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat/Montserrat-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat/Montserrat-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat/Montserrat-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-montserrat',
});

const opensans = localFont({
  src: [
    {
      path: '../../public/fonts/OpenSans/OpenSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/OpenSans/OpenSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/OpenSans/OpenSans-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/OpenSans/OpenSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-opensans',
});

export default function App({ Component, pageProps, code }: AppProps) {
  useEffect(() => {
    Promise.all([import('wowjs')]).then(([WOW]) => {
      window.jQuery = $;
      const wow = new WOW.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: false,
        live: true,
      });
      wow.init();

      if (window) {
        window.jQuery = $;
        $(window).scroll(function () {
          if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
          } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
          }
        });

        $(window).scroll(function () {
          if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
          } else {
            $('.back-to-top').fadeOut('slow');
          }
        });

        Promise.all([
          import('@/scripts/waypoints.min.js'),
          import('@/scripts/owl.carousel.min.js'),
          import('@/scripts/easing.min.js'),
        ]).then(([waypoints, owlCarousel, easing]) => {
          if (
            typeof window !== 'undefined' &&
            typeof $.fn.owlCarousel === 'function'
          ) {
            $('.testimonial-carousel').owlCarousel({
              autoplay: true,
              smartSpeed: 1000,
              margin: 25,
              dots: true,
              loop: true,
              center: true,
              responsive: {
                0: {
                  items: 1,
                },
                576: {
                  items: 1,
                },
                768: {
                  items: 2,
                },
                992: {
                  items: 3,
                },
              },
            });
          }
        });
      }
    });
  }, []);
  const { chunksHead, chunksBodyTop, chunksBodyFooter } = useMemo(
    () => generateCodeChunks(code),
    [code]
  );

  return (
    <>
      <Head>
        <title>{'sldkjf'}</title>
        <>{parse(chunksHead)}</>
      </Head>
      <>{parse(chunksBodyTop)}</>

      <AuthProvider>
        <div
          className={`${montserrat.variable} ${opensans.variable} font-wrapper`}
        >
          <Component {...pageProps} />
        </div>
      </AuthProvider>
      <>{parse(chunksBodyFooter)}</>
    </>
  );
}

App.getInitialProps = async ({ ctx }: { ctx: any }) => {
  const { locale } = ctx;
  const strapiLocale = locale === 'ua' ? 'uk' : locale;

  const getCodeRes = await server.get(getCode(strapiLocale));
  const code = getCodeRes?.data?.data?.attributes?.code || [];
  return { code };
};
