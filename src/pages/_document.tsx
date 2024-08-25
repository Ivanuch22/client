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

        <meta name="google-site-verification" content="9lr6DIPqtr69JsGgRDzM6cqqxqA0oIMSSY41ScS2sAs" />
        <Script src="/scripts/jquery.min.js" strategy="beforeInteractive" />
        {/* <Script src="/scripts/bootstrap.bundle.min.js" strategy="afterInteractive" /> */}
        {/* <Script src="/scripts/easing.min.js" strategy="worker"></Script> */}
        <Script src="/scripts/wow.min.js" strategy="worker"></Script>
        {/* <Script src="/scripts/waypoints.min.js" strategy="worker"></Script> */}
        <Script src="/scripts/counterup.min.js" strategy="worker"></Script>
        <Script src="/scripts/owl.carousel.min.js" strategy="worker"></Script>
        <Script src="/scripts/main.js" strategy="worker"></Script>
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




