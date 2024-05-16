// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useDefaultLayoutContext from '@/hooks/useDefaultLayoutContext';
import { start } from 'repl';

export type TogglePosition = 'left' | 'center' | 'right';

export const errorText = {
  ua: 'Помилка',
  ru: 'Ошибка',
  en: 'Error',
};

export const messageNoTranslation = {
  ua: 'На сайті відсутня українська версія цієї сторінки',
  en: 'There is no English version of this page on the site',
};

export const message404 = {
  ua: 'Вибачте, сторінку, що ви шукаєте, не знайдено',
  ru: 'Извините, запрашиваемая вами страница не найдена',
  en: 'Sorry, the page you are looking for, was not found',
};

const Switch = () => {
  const router = useRouter();
  const [position, setPosition] = useState<TogglePosition>('left');

  const { allPages, setErrorMessage, setErrorCode } = useDefaultLayoutContext();

  function handlePosition(locale: string | undefined) {
    if (locale === 'ua') {
      setPosition('left');
    } else if (locale === 'ru') {
      setPosition('center');
      if (isPageWithLocaleExists(router.asPath, 'ru')) {
        if (setErrorMessage && setErrorCode) {
          setErrorMessage('');
          setErrorCode(null);
        }
      } else {
        triggerErrorMessage('ru');
      }
    } else if (locale === 'en') {
      setPosition('right');
    }
  }

  useEffect(() => {
    handlePosition(router.locale);
    if (isPageWithLocaleExists(router.asPath, router.locale)) {
      if (setErrorMessage && setErrorCode) {
        setErrorMessage('');
        setErrorCode(null);
      }
    } else {
      triggerErrorMessage(router.locale);
    }
  }, [router.locale, router.asPath]);

  function triggerErrorMessage(locale: string) {
    if (setErrorMessage && setErrorCode) {
      console.log(router.asPath)
      const pathWithoutFragment = router.asPath.split('#')[0];
      if (!isPageExists(pathWithoutFragment, locale)) {
        setErrorMessage(message404[locale]);
        setErrorCode(404);
      } else {
        setErrorMessage(messageNoTranslation[locale]);
      }
    }
  }

  function isPageWithLocaleExists(url: string, locale: string) {
    const strapiLocale = locale === 'ua' ? 'uk' : locale;
    if (
      router.pathname != '/[slug]' &&
      router.pathname != '/info/[slug]' &&
      router.pathname != '/blog/[slug]' &&
      router.pathname != '/service/[slug]'
    ) {
      return true;
    }
    const pageIndex: number = allPages.findIndex(
      page =>
        (page.attributes.url === url ||
          `${page.attributes.url}#` === url ||
          `/service${page.attributes.url}` === url ||
          `/service${page.attributes.url}#` === url) &&
        page.attributes.locale === strapiLocale
    );
    return pageIndex !== -1;
  }

  function isPageExists(url: string) {
    if (
      router.pathname != '/[slug]' &&
      router.pathname != '/info/[slug]' &&
      router.pathname != '/blog/[slug]' &&
      router.pathname != '/service/[slug]'
    ) {
      return true;
    }
    const pageIndex: number = allPages.findIndex(
      page =>
        page.attributes.url === url || `/service${page.attributes.url}` === url
    );
    return pageIndex !== -1;
  }

  return (
    <div>
      <div className="switch navpart">
        {/* put link if the page exists and just plain button if it is not (for seo purposes) */}
        <div className={`switch-options navpart ${position}`}>
          {isPageWithLocaleExists(router.asPath, 'uk') ? (
            <Link
              href={router.asPath}
              locale="ua"
              className="text-monospace switch-option left navpart"
              onClick={() => handlePosition('ua')}
            >
              UA
            </Link>
          ) : (
            <button
              className="text-monospace switch-option left navpart btn-clear"
              onClick={() => {
                triggerErrorMessage('ua');
                handlePosition('ua');
              }}
            >
              UA
            </button>
          )}
          {isPageWithLocaleExists(router.asPath, 'ru') ? (
            <Link
              href={router.asPath}
              locale="ru"
              className="text-monospace switch-option center navpart"
              onClick={() => handlePosition('ru')}
            >
              RU
            </Link>
          ) : (
            <button
              className="text-monospace switch-option center navpart btn-clear"
              onClick={() => {
                triggerErrorMessage('ru');
                handlePosition('ru');
              }}
            >
              RU
            </button>
          )}
          {isPageWithLocaleExists(router.asPath, 'en') ? (
            <Link
              href={router.asPath}
              locale="en"
              className="text-monospace switch-option right navpart"
              onClick={() => handlePosition('en')}
            >
              EN
            </Link>
          ) : (
            <button
              className="text-monospace switch-option right navpart btn-clear"
              onClick={() => {
                triggerErrorMessage('en');
                handlePosition('en');
              }}
            >
              EN
            </button>
          )}
        </div>
        <div className={`mover ${position}`}></div>
      </div>
    </div>
  );
};

export default Switch;
