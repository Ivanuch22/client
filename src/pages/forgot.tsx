// @ts-nocheck

import MailModal from "@/components/organisms/ModalMail";
import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import { server } from '@/http';
import { $ } from '@/utils/utils';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import React, { useEffect, useState, useRef } from 'react';
import { useWindowSize } from "@uidotdev/usehooks";
import axios from "axios";
import getConfig from "next/config";

export default function Forgot({
    menu,
    allPages,
    footerMenus,
    footerGeneral,
    socialData,
}) {
    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : router.locale;
    const size = useWindowSize()
    const [modalIsVisible, setModalVisible] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const inputs = document.querySelectorAll('.input100');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                if (input.value.trim() !== "") {
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
            if (input.getAttribute('type') === 'email' || input.getAttribute('name') === 'email') {
                const re = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/;
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

    function validate(value) {
        const re = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/;
        return re.test(value);
    }
    async function onSubmit(e) {
        e.preventDefault();
        const email = emailRef.current?.value;
        if (validate(email)) {
            setModalVisible(true);
            const form = document.querySelector('.login100-form');
            await server.post("/auth/forgot-password", {
                email: email
            })
            console.log("повідомлення відправлено")
            if (form) {
                form.reset();
            }
        }
    }
    const asPath = router.asPath
    console.log(asPath)
    const { publicRuntimeConfig } = getConfig();
    const { NEXT_FRONT_URL } = publicRuntimeConfig;
    const generateHrefLangTags = () => {
      const locales = ['ru', 'en', 'ua'];
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
                <title>Forgot</title>
                <meta name="description" content="Forgot" />
                <meta name="keywords" content="Forgot noindex, follow" />
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
                                {size.width >= 1200 ? <div className="container-xxl py-5   bg-primary mb-0">
                                </div> : ""}
                            </div>
                            <MailModal
                                isVisible={modalIsVisible}
                                onClose={() => {
                                    setModalVisible(false);
                                }}
                                message={$t[locale].auth.success.forgot_message}
                            />
                            <div className="limiter">
                                <div className="container-login100">
                                    <div className="wrap-login100 p-t-85 p-b-20">
                                        <form className="login100-form validate-form" onSubmit={onSubmit}>
                                            <span className="login100-form-title" style={{ paddingBottom: 50, fontWeight: 600, }}>
                                                Trans-Hope
                                            </span>
                                            <div className="wrap-input100 validate-input"
                                                style={{ marginTop: 5, marginBottom: 35 }} data-validate={$t[locale].auth.error.empty_email}>
                                                <input ref={emailRef} className="input100" type="email" name="email" />
                                                <span className="focus-input100" data-placeholder="Email"></span>
                                            </div>
                                            <div className="container-login100-form-btn">
                                                <button type="submit" className="login100-form-btn">
                                                    {$t[locale].auth.send_message}
                                                </button>
                                            </div>
                                            <ul className="login-more p-t-190" style={{ paddingTop: 50,listStyle: "none" }}>
                                                <li style={{ marginBottom: 4 }}>
                                                    <span className="txt1" style={{ marginRight: 5 }}>
                                                        {$t[locale].auth.already_have}
                                                    </span>
                                                    <Link href="/login" className="txt2">
                                                        {$t[locale].auth.header_button_name}
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
                socialData: {}
            },
        };
    }
}
