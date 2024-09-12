//@ts-nocheck

// Страница контакто как и главная страница (index.tsx) сделаны статическими
// То есть их не нужно создавать в страпи и добавлять в меню в страпи,
// Вы можете изменять их так же как делаете в обычном html с единственной поправкой
// Что нужно использовать className вместо class

import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import { FormEvent, useEffect, useState } from 'react';
import { server } from '@/http';
import Script from 'next/script';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import { $ } from '@/utils/utils';
import axios from 'axios';
import captchas from '@/data/captcha';
import { getRandomElementFromArray } from '@/utils/getRandElemFromArr';
import MailModal from '@/components/organisms/ModalMail';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import getConfig from 'next/config';
import { generateHrefLangTags } from '@/utils/generators/generateHrefLangTags';

export interface Contacts {
  location: string;
  phone_number: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
export interface StrapiContacts {
  data: {
    id: number;
    attributes: Contacts;
  };
  meta: {};
}

export const initialContacts: Contacts = {
  location: '',
  phone_number: '',
  email: '',
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
};

export default function Home({
  html,
  title,
  description,
  keywords,
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  socialData,
}) {
  const [contacts, setContacts] = useState<Contacts>(initialContacts);
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [cIndex, setCIndex] = useState(getRandomElementFromArray(captchas));

  const messages = {
    success: {
      uk: 'Повідомлення успішно надіслане!',
      ru: 'Сообщение успешно отправлено!',
      en: 'Message sent successfully!',
    },
    error: {
      uk: 'Виникла помилка. Будь ласка спробуйте ще раз',
      ru: 'Возникла ошибка. Пожалуйста попробуйте еще раз',
      en: 'An error occured. Please try again',
    },
  };

  // Функция которая делает запрос к страпи для получения контактов
  const fetchContacts = async () => {
    try {
      const res = await server.get<StrapiContacts>('/contact');

      setContacts(res?.data?.data?.attributes);
    } catch (error) {
      throw new Error(`Во время получения произошла ошибка: ${error}`);
    }
  };

  useEffect(() => {
    // Делаем сам запрос после того как страница прогрузилась
    fetchContacts();
  }, []);

  useEffect(() => {
    const captchaLabel = document.querySelector('#captchaLabel');
    captchaLabel.textContent = captchas[cIndex].input;
    submitButton?.removeAttribute('disabled');
  }, [cIndex]);

  const resetCaptcha = () => {
    setCIndex(getRandomElementFromArray(captchas));
  };

  useEffect(() => {
    resetCaptcha();
  }, [router.locale]);

  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(() => {
    const captchaInput = document.querySelector('#captcha');

    const form = document.querySelector('#contact-form');
    const emailInput = document.querySelector('#email');
    const nameInput = document.querySelector('#name');
    const messageInput = document.querySelector('#message');

    const submitButton = document.querySelector('#submitButton');
    const cleanForm = () => {
      emailInput.value = '';
      nameInput.value = '';
      messageInput.value = '';
      captchaInput.value = '';
    };

    const handleSuccess = () => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    };
    const handleError = () => {
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, 3000);
    };

    const submit = async (e: FormEvent) => {
      e.preventDefault();

      if (captchaInput.value.trim() !== captchas[cIndex].output) {
        resetCaptcha();
        return handleError();
      }
      try {
        submitButton?.setAttribute('disabled', true);
        await axios.post('/mail/', {
          email: emailInput.value,
          name: nameInput.value,
          locale: locale,
          body: messageInput?.value,
        });
        setModalIsVisible(true);
        cleanForm();
        resetCaptcha();
        handleSuccess();
      } catch (error) {
        handleError();
      } finally {
        resetCaptcha();
      }
    };
    form?.addEventListener('submit', submit);

    return () => {
      form?.removeEventListener('submit', submit);
    };
  }, [cIndex]);
  const asPath = router.asPath
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;
const hrefLangTags = generateHrefLangTags(asPath);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {hrefLangTags.map((tag) => (
          <link key={tag.key} rel={tag.rel} hrefLang={tag.hrefLang} href={tag.href} />
        ))}
      </Head>

      <div className="container-xxl bg-white p-0">
        <div className="container-xxl position-relative p-0">
          <DefaultLayoutContext.Provider
            value={{
              footerMenus,
              footerGeneral,
              allPages,
              menu,
              socialData,
            }}
          >
            <DefaultLayout>
              <div
                className="alert alert-danger"
                role="alert"
                style={{
                  position: 'fixed',
                  bottom: '1rem',
                  right: '1rem',
                  zIndex: 400,
                  display: isError ? 'block' : 'none',
                }}
              >
                {messages.error[locale]}
              </div>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
          <MailModal
            isVisible={modalIsVisible}
            onClose={() => {
              setModalIsVisible(false);
            }}
          />
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ query, locale }) {
  try {
    const res = await server.get(`/code?locale=${$(locale)}`);
    const {
      contacts = '',
      contacts_seo_description = '',
      contacts_title = '',
      contacts_keywords = '',
    } = res.data.data.attributes;

    const strapiLocale = locale === 'ua' ? 'uk' : locale;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes;

    return {
      props: {
        html: contacts,
        description: contacts_seo_description,
        title: contacts_title,
        keywords: contacts_keywords,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
      revalidate: 60,

    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        contacts: '',
        contacts_seo_description: '',
        contacts_title: '',
        contacts_keywords: '',
        menu: [],
        allPages: [],
        footerMenus: {
          about: { title: '', items: [] },
          services: { title: '', items: [] },
          contacts: {},
        },
        footerGeneral: {},
        socialData: socialData ?? {},
      },
    };
  }
}
