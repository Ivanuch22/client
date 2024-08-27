// @ts-nocheck

import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import { server,serverForPlugins } from '@/http';
import { $ } from '@/utils/utils';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import NotConfirmedModal from '@/components/organisms/NotConfirmedModal';
import React, { FormEvent, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { useWindowSize } from '@uidotdev/usehooks';
import getUserFingerPrint from "@/utils/getUserFingerPrint"
import MailModal from '@/components/organisms/ModalMail';
import getConfig from 'next/config';
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
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isLogin, logout, updateUser, login } = useAuth();
  const [isShowConfirmModal, setShowConfirmModal] = useState(false)
  const size = useWindowSize();
  const router = useRouter();
  const [modalActivationIsVisible, setActivationModalVisible] = useState(false);

  const locale = router.locale === 'ua' ? 'uk' : router.locale;


  useEffect(() => {
    const clearCookies = () => {
      Cookies.remove('userToken');
      Cookies.remove('userName');
      Cookies.remove('user');
    };
    clearCookies();
    updateUser()
    logout()

  }, []);

  useEffect(() => {
    const inputs = document.querySelectorAll('.input100');
    inputs.forEach(input => {
      input.addEventListener('blur', function () {
        if (input.value.trim() !== '') {
          input.classList.add('has-val');
        } else {
          input.classList.remove('has-val');
        }
      });

      input.addEventListener('focus', function () {
        hideValidate(input);
      });
    });

    const form = document.querySelector('.validate-form');
    form.addEventListener('submit', function (event) {
      let check = true;
      inputs.forEach(input => {
        if (!validate(input)) {
          showValidate(input);
          check = false;
        }
      });
      if (!check) {
        event.preventDefault();
      }
      return check;
    });

    function validate(input) {
      if (
        input.getAttribute('type') === 'email' ||
        input.getAttribute('name') === 'email'
      ) {
        const re =
          /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/;
        return re.test(input.value.trim());
      } else {
        return input.value.trim() !== '';
      }
    }

    function showValidate(input) {
      const thisAlert = input.parentElement;
      thisAlert.classList.add('alert-validate');
    }

    function hideValidate(input) {
      const thisAlert = input.parentElement;
      thisAlert.classList.remove('alert-validate');
    }
  }, []);
  const handleSuccess = () => {
    setIsSuccess(true);
    const previousPage = Cookies.get('previousPage') || '/';
    setTimeout(() => {
      router.push(previousPage);
      setIsSuccess(false);
    }, 3000);
  };

  const handleError = (message: string) => {
    setMessage(message);
    setIsError(true);
    setTimeout(() => {
      setIsError(false);
    }, 3000);
  };


  async function sendActivationMessage() {
    let getEmailCookies = Cookies.get('email');
    const email = getEmailCookies;


    const sendMessage = server.post("/auth/send-email-confirmation", {
      email: email
    })

    setActivationModalVisible(true);
    setTimeout(() => {
      setActivationModalVisible(false);
    }, 3000);
  }



  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    if (!email || !password) {
      return handleError('Заповніть правильно данні');
    }

    let userData;
    try{
      userData = await getUserFingerPrint();
    }catch(e){
      console.log(e)
      userData ={}
    }
    try {
      const response = await server.post('/auth/local', {
        identifier: email,
        password: password,
      });
      try{
        const updateUserHistory = await serverForPlugins.put("/custom-comment-fields/custom-history/update",{
          collectionId: response.data.user.id,
          collection :"User",
          history: userData
        })
      }catch(e){
        console.log("user data not updated")
      }

      Cookies.set('email', response.data.user.email, { expires: 7 });


      Cookies.set('userToken', response.data.jwt, { expires: 7 });
      Cookies.set('userName', response.data.user.real_user_name, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });

      login();
      updateUser()
      handleSuccess();
      router.push('/');
    } catch (error) {
      if(error.response?.status ===401){
       return setShowConfirmModal(true)
      };
      console.log(error)
      return handleError(error.response?.data.error.message);
    }
  }

  const asPath = router.asPath
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_FRONT_URL } = publicRuntimeConfig;
  const generateHrefLangTags = () => {
    const locales = ['ru', 'en', 'uk'];
    const hrefLangTags = locales.map((lang) => {
      const href = `${NEXT_FRONT_URL}${lang === 'ru' ? '' : "/"+lang}${asPath}`;
      return <link key={lang} rel="alternate" hrefLang={lang} href={href} />;
    });

    // Додавання x-default, який зазвичай вказує на основну або міжнародну версію сайту
    const defaultHref = `${NEXT_FRONT_URL}${asPath}`;
    hrefLangTags.push(<link key="x-default" rel="alternate" hrefLang="x-default" href={defaultHref} />);

    return hrefLangTags;
  };

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="login" />
        <meta name="keywords" content="login noindex, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {generateHrefLangTags()}
      </Head>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
        defer
      ></Script>
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
              <div className="container-xxl  position-relative p-0">
                {size.width >= 1200 ? (
                  <div className="container-xxl py-5   bg-primary mb-0"></div>
                ) : (
                  ''
                )}
              </div>

              <div className="limiter">
                <div
                  className="alert alert-success"
                  role="alert"
                  style={{
                    position: 'fixed',
                    bottom: '1rem',
                    right: '1rem',
                    zIndex: 400,
                    display: isSuccess ? 'block' : 'none',
                  }}
                >
                  {$t[locale].auth.success.log_message}
                </div>
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
                  {$t[locale].auth.error.empty}
                </div>
                <div
                  className="container-login100"
                  style={{ minHeight: 'auto', padding: '30px 0' }}
                >
                  <div className="wrap-login100 p-t-85 p-b-20">
                    <form
                      className="login100-form validate-form"
                      onSubmit={onSubmit}
                    >
                      <span
                        className="login100-form-title"
                        style={{ paddingBottom: 50, fontWeight: 600 }}
                      >
                        Trans-Hope
                      </span>
                      <div
                        className="wrap-input100 validate-input"
                        style={{ marginBottom: 35 }}
                        data-validate={$t[locale].auth.error.empty_email}
                      >
                        <input className="input100" type="text" name="email" />
                        <span
                          className="focus-input100"
                          data-placeholder="Email"
                        ></span>
                      </div>
                      <div
                        className="wrap-input100 validate-input"
                        style={{ marginBottom: 30 }}
                        data-validate={$t[locale].auth.error.empty_password}
                      >
                        <input
                          className="input100"
                          type="password"
                          name="password"
                        />
                        <span
                          className="focus-input100"
                          data-placeholder={$t[locale].auth.password}
                        ></span>
                      </div>

                      <div className="container-login100-form-btn">
                        <button className="login100-form-btn" type="submit">
                          {$t[locale].auth.header_button_name}
                        </button>
                      </div>
                      <ul
                        className="login-more p-t-190"
                        style={{ paddingTop: 50 ,listStyle: "none"}}
                      >
                        <li style={{ marginBottom: 4 }}>
                          <span className="txt1" style={{ marginRight: 5 }}>
                            {$t[locale].auth.forgot}
                          </span>
                          <Link href="/forgot" className="txt2">
                            {$t[locale].auth.password}?
                          </Link>
                        </li>
                        <li>
                          <span className="txt1" style={{ marginRight: 5 }}>
                            {$t[locale].auth.dont_have}
                          </span>
                          <Link href="/register" className="txt2">
                            {$t[locale].auth.register}
                          </Link>
                        </li>
                      </ul>
                    </form>
                  </div>
                </div>
              </div>

              <div id="dropDownSelect1"></div>
              <MailModal
                message={$t[locale].auth.successConfirmationMessage}
                isVisible={modalActivationIsVisible}
                onClose={() => {
                  setActivationModalVisible(false)
                }}
              />
              <NotConfirmedModal
                message={$t[locale].auth.notConfirmedMessage}
                isVisible={isShowConfirmModal}
                sendMessage={sendActivationMessage}
                onClose={() => {
                  setShowConfirmModal(false)
                }}
              />
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ query, locale }) {
  try {
    const strapiLocale = locale === 'ua' ? 'uk' : locale;
    const res = await server.get(`/code?locale=${$(strapiLocale)}`);

    const {
      index = '',
      index_seo_description,
      index_title,
      index_keywords,
    } = res.data.data.attributes;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes;

    return {
      props: {
        html: index,
        description: index_seo_description,
        title: index_title,
        keywords: index_keywords,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
    };
  } catch (error) {
    return {
      props: {
        html: ``,
        description: '',
        title: '',
        keywords: '',
        menu: [],
        allPages: [],
        footerMenus: {
          about: { title: '', items: [] },
          services: { title: '', items: [] },
          contacts: {},
        },
        footerGeneral: {},
        socialData: {},
      },
    };
  }
}
