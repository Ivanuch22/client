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

  const [pathWithoutFragment, setPathWithoutFragment]= useState(router.asPath.split('#')[0])
  


  function handlePosition(locale: string | undefined) {
    if (locale === 'ua') {
      setPosition('left');
    } else if (locale === 'ru') {
      setPosition('center');
      if (isPageWithLocaleExists(pathWithoutFragment, 'ru')) {
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
    if (isPageWithLocaleExists(pathWithoutFragment, router.locale)) {
      if (setErrorMessage && setErrorCode) {
        setErrorMessage('');
        setErrorCode(null);
      }
    } else {
      triggerErrorMessage(router.locale);
    }
  }, [router.locale, pathWithoutFragment]);

  
  function triggerErrorMessage(locale: string) {
    if (setErrorMessage && setErrorCode) {
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
      router.pathname != '/news/[slug]' &&
      router.pathname != '/usefull'
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
      router.pathname != '/news/[slug]' &&
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
  useEffect(()=>{
    setPathWithoutFragment(router.asPath.split('#')[0]);
  },[router.asPath])
  return (
    <div>
      <div className="switch navpart">
        {/* put link if the page exists and just plain button if it is not (for seo purposes) */}
        <div className={`switch-options navpart ${position}`}>
          {isPageWithLocaleExists(pathWithoutFragment, 'uk') ? (
            <Link
              href={pathWithoutFragment}
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
          {isPageWithLocaleExists(pathWithoutFragment, 'ru') ? (
            <Link
              href={pathWithoutFragment}
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
          {isPageWithLocaleExists(pathWithoutFragment, 'en') ? (
            <Link
              href={pathWithoutFragment}
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
