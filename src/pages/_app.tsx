// @ts-nocheck

import '@/styles/animate.min.css';
import "@/styles/auth.css";
import '@/styles/owl.carousel.min.css';
import '@/styles/dropdown.css';
import '@/styles/global.css';
import '@/styles/toggler.css';
import '@/styles/call.btn.css';
import '@/styles/itc.css';

import $ from 'jquery';
import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';

import localFont from 'next/font/local';
import { AuthProvider } from '@/contexts/AuthContext';

// Define local fonts with optimization
const montserrat = localFont({
  src: [
    {
      path: '../../public/fonts/Montserrat/Montserrat-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat/Montserrat-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat/Montserrat-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat/Montserrat-Bold.ttf',
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
      path: '../../public/fonts/OpenSans/OpenSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/OpenSans/OpenSans-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/OpenSans/OpenSans-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/OpenSans/OpenSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-opensans',
});

export default function App({ Component, pageProps }: AppProps) {
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
        });
      }
    });
  }, []);

  return (
    <AuthProvider>
      <div className={`${montserrat.variable} ${opensans.variable} font-wrapper`}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
