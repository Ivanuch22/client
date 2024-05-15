// @ts-nocheck

// Это вспомогательный файл от next.js Сюда вы можете импортировать
// стили как это сделано ниже

import '@/styles/animate.min.css';
import "@/styles/auth.css"
// import '@/styles/bootstrap.min.css';
import '@/styles/owl.carousel.min.css';
import '@/styles/dropdown.css';
import '@/styles/global.css';
import '@/styles/toggler.css';
import '@/styles/call.btn.css';
import '@/styles/itc.css';


// @ts-ignore Типизации для данно библиотеки не существует
import $ from 'jquery';
import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';

import localFont from 'next/font/local'
import { AuthProvider } from '@/contexts/AuthContext';
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
  variable: '--font-montserrat'
})

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
  variable: '--font-opensans'
})

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

        // it didn't hide dropdown menu after hover so I had to comment it
        // const $dropdown = $('.dropdown');
        // const $dropdownToggle = $('.dropdown-toggle');
        // const $dropdownMenu = $('.dropdown-menu');
        // const showClass = 'show';

        // $(window).on('load resize', function () {
        //   if (this.matchMedia('(min-width: 992px)').matches) {
        //     $dropdown.hover(
        //       function () {
        //         const $this = $(this);
        //         $this.addClass(showClass);
        //         $this.find($dropdownToggle).attr('aria-expanded', 'true');
        //         $this.find($dropdownMenu).addClass(showClass);
        //       },
        //       function () {
        //         const $this = $(this);
        //         $this.removeClass(showClass);
        //         $this.find($dropdownToggle).attr('aria-expanded', 'false');
        //         $this.find($dropdownMenu).removeClass(showClass);
        //       }
        //     );
        //   } else {
        //     $dropdown.off('mouseenter mouseleave');
        //   }
        // });

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
    // providing fonts to use it in css by variables
      <AuthProvider>
    <div className={`${montserrat.variable} ${opensans.variable} font-wrapper`}>
      <Component {...pageProps} />
    </div>
</AuthProvider>
  );
}
