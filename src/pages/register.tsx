// @ts-nocheck

import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import axios from 'axios';
import { server } from '@/http';
import { $ } from '@/utils/utils';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import React, { useEffect, useState } from 'react';
import captchas from '@/data/captcha';
import { getRandomElementFromArray } from '@/utils/getRandElemFromArr';
import { FormEvent } from 'react';
import { uuidv7 } from 'uuidv7';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { useWindowSize } from '@uidotdev/usehooks';
import ModalRegConfirm from '@/components/organisms/ModalRegConfirm';
import getConfig from 'next/config';


export default function Home({
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  socialData,
}) {
  const router = useRouter();
  const {login,updateUser } = useAuth();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const size = useWindowSize();
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_MAILER ,NEXT_STRAPI_BASED_URL} = publicRuntimeConfig;

  const [cIndex, setCIndex] = useState(getRandomElementFromArray(captchas));
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [check, setCheck] = useState('true');
  const [message, setMessage] = useState('');
  const [ip, setIp] = useState<string | null>(null);
  const [modalIsVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const captchaLabel = document.querySelector('#captchaLabel');
    captchaLabel.dataset.placeholder = captchas[cIndex].input;
  }, [cIndex]);

  useEffect(() => {
    const referrer = document.referrer;
    if (!referrer.includes(window.location.host)) {
      Cookies.set('previousPage', referrer, { expires: 1 / 24 });
    }
  }, []);
  useEffect(() => {
    const userName = Cookies.get('userName');
    const userToken = Cookies.get('userToken');
    if (userName && userToken) {
      router.push('/profile');
    }
  }, [router]);
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
      setCheck(true);
      inputs.forEach(input => {
        if (!validate(input)) {
          showValidate(input);
          setCheck(false);
        }
      });
      if (!check) {
        event.preventDefault();
      }
      return check;
    });

    function validate(input) {
      if (
        input.getAttribute('type') === 'captcha' ||
        input.getAttribute('name') === 'captcha'
      ) {
        return input.value.trim() === captchas[cIndex].output;
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
    getUserIp();
  }, []);

  async function getUserIp  () {
    try {
      const userIp = await axios.get('/api/userIp');
      setIp(userIp.data.ip as string);
    } catch (error) {
      console.error('Failed to fetch IP:', error);
      setIp(null);
    }
  };
  function handleSuccess() {
    setIsSuccess(true);
    setModalVisible(true);

    const form = document.querySelector('.login100-form');
    if (form) {
      form.reset();
    }
    const getPreviousPage = Cookies.get('previousPage') || '/';

    setTimeout(() => {
      setIsSuccess(false);
      setModalVisible(false);
    }, 3000);
    router.push(getPreviousPage);

  }
  function handleError(message: string) {
    setMessage(message);
    setIsError(true);
    setTimeout(() => {
      setIsError(false);
    }, 3000);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    const captcha = formData.get('captcha');
    const uuid = uuidv7();

    if (!email || !password || !name || captcha !== captchas[cIndex].output) {
      return handleError($t[locale].auth.error.empty);
    }

    try {
      const response = await server.post('/auth/local/register', {
        username: uuid,
        real_user_name: name,
        email: email,
        password: password,
        UUIDv7: uuid,
        user_ip: ip,
        confirmed: false,
        imgLink: `${NEXT_STRAPI_BASED_URL}/uploads/nophoto_c7c9abf542.png`
      });
      if (response.status === 200) {
        handleSuccess();
        login();

        Cookies.set('userToken', response.data.jwt, { expires: 7 });
        Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
        Cookies.set('userName', response.data.user.real_user_name, { expires: 7 });
        console.log("sdfha")
        updateUser()
      } else {
        return handleError(error.response.data.error.message);
      }
    } catch (error) {
      return handleError(error.response.data.error.message);
    }
  }
  return (
    <>
      <Head>
        <title>Register</title>
        <meta name="description" content="register" />
        <meta name="keywords" content="register noindex, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
              <ModalRegConfirm
                message={$t[locale].auth.success.reg_message}
                dangerMessage={$t[locale].auth.success.reg_messageDanger}
                isVisible={modalIsVisible}
                onClose={() => {
                  setModalVisible(false);
                }}
              />
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
                  {$t[locale].auth.success.reg_message}
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
                  {message}
                </div>
                <div className="container-login100">
                  <div className="wrap-login100 p-t-85 p-b-20">
                    <form
                      onSubmit={onSubmit}
                      className="login100-form validate-form"
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
                        data-validate={$t[locale].auth.error.empty_name}
                      >
                        <input className="input100" type="name" name="name" />
                        <span
                          className="focus-input100"
                          data-placeholder="Name"
                        ></span>
                      </div>
                      <div
                        className="wrap-input100 validate-input"
                        style={{ marginBottom: 35 }}
                        data-validate={$t[locale].auth.error.empty_email}
                      >
                        <input className="input100" type="email" name="email" />
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
                      <div
                        className="wrap-input100 validate-input"
                        style={{ marginBottom: 30 }}
                        data-validate={$t[locale].auth.error.empty_captcha}
                      >
                        <input
                          type="captcha"
                          className="input100"
                          name="captcha"
                          id="captcha"
                        />
                        <span
                          className="focus-input100"
                          id="captchaLabel"
                          data-placeholder={$t[locale].auth.password}
                        ></span>
                      </div>
                      <div className="container-login100-form-btn">
                        <button className="login100-form-btn" type="submit">
                          {$t[locale].auth.register}
                        </button>
                      </div>
                      <ul
                        className="login-more p-t-190"
                        style={{ paddingTop: 50 }}
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
                            {$t[locale].auth.already_have}
                          </span>
                          <Link href="/login" className="txt2">
                            {$t[locale].auth.header_button_name}
                          </Link>
                        </li>
                      </ul>
                    </form>
                  </div>
                </div>
              </div>

              <div id="dropDownSelect1"></div>
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
    console.log(res)
    const {
      index = '',
      index_seo_description,
      index_title,
      index_keywords,
    } = res.data.data.attributes;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    console.log(socialRes)
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
