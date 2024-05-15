import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
// Это так же вспомогательный файл от next js сюда вы можете импортировтаь скрипты
// как этто сделано ниже

export default function Document({ locale }: { locale: string }) {

  return (
    <Html>
      <Head>
        <link
          href="/styles/all.min.css"
          rel="stylesheet"
        />
        <link
          href="/styles/bootstrap-icons.css"
          rel="stylesheet"
        />
         <link
          href="/styles/bootstrap.min.css"
          rel="stylesheet"
        />
        <Script src="/scripts/jquery.min.js"></Script>
        <Script src="/scripts/bootstrap.bundle.min.js"></Script>
        <Script src="/scripts/owl.carousel.min.js"></Script>
        <Script src="/scripts/easing.min.js"></Script>
        <Script src="/scripts/wow.min.js"></Script>
        <Script src="/scripts/waypoints.min.js"></Script>
        <Script src="/scripts/counterup.min.js"></Script>
        <Script src="/scripts/main.js"></Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export function getInitialProps({ locale }: { locale: string }) {
  const _locale = locale === 'ua' ? 'uk' : locale;

  return {
    locale: _locale,
  };
}
