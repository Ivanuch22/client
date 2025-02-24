import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document({ locale }: { locale: string }) {
  return (
    <Html>
      <Head>
        {/* Підключення всіх стилів через preload */}
        <link
          rel="stylesheet"
          href="/styles/all.min.css"
          // media="all"
        />

        <link
          rel="stylesheet"
          href="/styles/bootstrap-icons.css"
          // media="all"
        />

        <link
          rel="stylesheet"
          href="/styles/bootstrap.min.css"
          // media="all"
        />

        {/* <meta name="google-site-verification" content="9lr6DIPqtr69JsGgRDzM6cqqxqA0oIMSSY41ScS2sAs" /> */}
        <Script src="/scripts/jquery.min.js" />
        <Script src="/scripts/wow.min.js"></Script>
        <Script src="/scripts/counterup.min.js"></Script>
        <Script src="/scripts/owl.carousel.min.js"></Script>
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
