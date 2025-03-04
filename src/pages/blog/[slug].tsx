// @ts-nocheck
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import parse from 'html-react-parser';
import Head from 'next/head';
import Link from 'next/link';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import { server, NEXT_STRAPI_API_URL, serverForPlugins } from '@/http/index';
import { errorText, message404 } from '../switch';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import genRatingData from '@/utils/generators/genRatingData';
import genFaqData from '@/utils/generators/genFaqData';
import genArticleData from '@/utils/generators/genArticleData';
import getHowToData from '@/utils/generators/getHowToData';
import { getMenu, getBlogPage } from '@/utils/queries';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import isPageWithLocaleExists from '@/utils/isPageWithLocaleExists';
import getRandomBanner from '@/utils/getRandomBanner';
import getRandomPopularNews from '@/utils/getRandomPopularNews';
import formatDateTime from '@/utils/formateDateTime';
import MailModal from '@/components/organisms/ModalMail';
import getPagesIdWithSameUrl from '@/utils/getPagesIdWithSameUrl';
import DefaultLayout from '@/components/layouts/default';
import { Crumb } from '@/components/molecules/Breacrumbs';
import Sidebar from '@/components/organisms/Sidebar';
import MostPopular from '@/components/organisms/MostPopular';
import Comments from '@/components/organisms/coments';
import NotConfirmedModal from '@/components/organisms/NotConfirmedModal';
import ModalConfirm from '@/components/organisms/ModalConfirm';
import { toLower, toUpper } from 'lodash';
import getCurrentFormattedTime from '@/utils/getCurrentFormattedTime';
import getUserIp from '@/utils/getUserIp';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { generateHrefLangTags } from '@/utils/generators/generateHrefLangTags';
import getPagesLocaleWithSameUrl from '@/utils/getPagesLocaleWithSameUrl ';

const fieldsToPopulate = [
  'seo_title',
  'Text',
  'user',
  'admin_date',
  'father',
  'children',
  'locale',
  'user_name',
  'user_img',
  'history',
];

const populateParams = fieldsToPopulate
  .map(field => `populate=${field}`)
  .join('&');

const { publicRuntimeConfig } = getConfig();

interface IComentData {
  comentID: number;
  userIp: string;
  pageUrl: string;
}

export interface PageAttibutes {
  seo_title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  page_title: string;
  seo_description: string;
  body: string;
  url: string;
  crumbs: Crumb[];
  slug: string;
  faq: any[];
  rating: {
    id: number;
    text: string;
    mark: number;
  };
}
export interface PageMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
export interface PageData {
  id: number;
  attributes: PageAttibutes;
}

export interface Page {
  data: PageData[];
  meta: PageMeta;
}
export interface MenuItem {
  id: number;
  attributes: {
    order: number;
    title: string;
    url: string;
    target: string;
    createdAt: string;
    updatedAt: string;
    children: {
      data: [];
    };
  };
}
export interface Query {
  query: {
    slug: string | null;
  };
}

const Page = ({
  seo_title,
  seo_description,
  page_title,
  body,
  keywords,
  headings,
  url,
  faq,
  rating,
  notFoundMessage,
  heading,
  code,
  pageIds,
  article,
  howto,
  randomBanner,
  mostPopular,
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  pageRes,
  views,
  admin_date,
  comments,
  pageImage,
  socialData,
  articleStrapi,
  mostPopularNews,
  activePageLocales,
}: PageAttibutes) => {
  console.log(activePageLocales);
  const [usersComments, setUserComments] = useState([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isShowNotFoutMessage, setIsShowNotFoutMessage] = useState(false);
  const [isShowMessageModal, setShowtMessageModal] = useState(false);
  const { NEXT_FRONT_URL, NEXT_MAILER, NEXT_STRAPI_BASED_URL } =
    publicRuntimeConfig;
  const router = useRouter();
  const [modalActivationIsVisible, setActivationModalVisible] = useState(false);
  const [isShowConfirmModal, setShowConfirmModal] = useState(false);
  const [editedCommentId, setEditedCommetId] = useState(0);
  const [commentUserId, setCommentUserId] = useState(0);
  const { isLogin, logout, updateUser, userData } = useAuth();
  const [globalUserIp, setGlobalUserIp] = useState('');
  const [user, setUser] = useState({});

  useEffect(() => {
    const getUserIpFunc = async () => {
      const getUserIps = await getUserIp();
      setGlobalUserIp(getUserIps);
    };
    getUserIpFunc();
    const getUserCookies = Cookies.get('user');
    if (!getUserCookies) return;
    const userCookies = JSON.parse(getUserCookies);
    let userFromBd = userCookies;
    async function getUser() {
      const strapiRes = await server.get(`/users/${userCookies.id}?populate=*`);
      Cookies.set('user', JSON.stringify(strapiRes.data), { expires: 7 });
      setUser(strapiRes.data);
    }

    getUser();
    setUser(userFromBd);
  }, []);

  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  useEffect(() => {
    setUserComments(comments);
  }, [comments]);

  useEffect(() => {
    setIsShowNotFoutMessage(notFoundMessage);
    const incrementPageViews = async pageId => {
      const viewedPages = (Cookies.get('viewedPages') || '').split(',');
      if (viewedPages.includes('' + pageId)) {
        return;
      }
      try {
        await axios.post('/api/increment-views', { id: pageId });
        viewedPages.push(pageId);
        Cookies.set('viewedPages', viewedPages.join(','), {
          expires: 1,
          sameSite: 'strict',
          secure: true,
        });
      } catch (error) {
        console.error('Error incrementing page views:', error);
      }
    };
    incrementPageViews(pageRes[0]?.id);
  }, [pageRes[0]?.id]);

  const findAncestors = (obj: any[], url: string) => {
    const ancestors = [] as Crumb[];
    for (const item of obj) {
      if (item.attributes.url === url) {
        ancestors.push({
          id: item.id,
          title: item.attributes.title,
          title_en: item.attributes.title_en,
          title_uk: item.attributes.title_uk,
          url: item.attributes.url,
          children: item.attributes.children.data,
        });
        return ancestors;
      }

      if (item.attributes.children.data.length > 0) {
        const childAncestors = findAncestors(
          item.attributes.children.data,
          url
        );
        if (childAncestors.length > 0) {
          ancestors.push({
            id: item.id,
            title: item.attributes.title,
            title_en: item.attributes.title_en,
            title_uk: item.attributes.title_uk,
            url: item.attributes.url,
            children: item.attributes.children.data,
          });
          ancestors.push(...childAncestors);
          return ancestors;
        }
      }
    }
    return ancestors;
  };

  const chunksHead = code?.reduce((acc, item) => {
    if (item.position === 'head') {
      acc += item.script;
    }
    return acc;
  }, ``);

  const chunksBodyTop = code?.reduce((acc, item) => {
    if (item.position === 'body-top') {
      acc += item.script;
    }

    return acc;
  }, ``);

  const chunksBodyFooter = code?.reduce((acc, item) => {
    if (item.position === 'body-footer') {
      acc += item.script;
    }

    return acc;
  }, ``);

  async function sendActivationMessage() {
    let getUserCookies = Cookies.get('user');
    const user = JSON.parse(getUserCookies);

    const sendMessage = server.post('/auth/send-email-confirmation', {
      email: user.email,
    });
    setShowtMessageModal(false);
    setActivationModalVisible(true);
    setTimeout(() => {
      setActivationModalVisible(false);
    }, 3000);
  }

  const saveDraftComment = async draftText => {
    const userToken = Cookies.get('userToken');

    if (!userToken) {
      return;
    }

    let getUserCookies = Cookies.get('user');
    const user = JSON.parse(getUserCookies);
    if (!draftText) {
      return console.log('Comment cannot be empty');
    }

    const userIp = await getUserIp();
    const currentTime = getCurrentFormattedTime();
    const commentType = 'edit';
    const commentHistoryJson = [
      {
        time: currentTime,
        user_ip: userIp,
        text: draftText,
        type: commentType,
      },
    ];
    let payload = {
      data: {
        user: { connect: [{ id: user.id }] },
        blog: { connect: pageIds },
        Text: draftText,
        admin_date: Date.now(),
        locale: toUpper(locale),
        user_name: user.real_user_name,
        user_img: user.user_image.id,
        publishedAt: null,
        history: commentHistoryJson,
      },
    };

    try {
      const response = await server.post('/comments1', payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
    } catch (error) {
      console.log(error);

      if (error?.response?.status === 401) {
        router.push('/login');
        return logout();
      }
    }
  };
  console.log(user);
  const sendMessage = async (e, fatherId) => {
    e.preventDefault();

    const userToken = Cookies.get('userToken');
    if (!userToken) {
      router.push('/login');
      return;
    }

    const formElement = e.target;
    const textAreaElement = formElement.querySelector('textarea');
    const commentText = textAreaElement.value;

    if (!commentText) {
      alert('Comment cannot be empty');
      return;
    }

    textAreaElement.value = '';

    const blogUrl = pageRes[0].attributes.url;

    if (!user.confirmed) {
      return setShowtMessageModal(true);
    }

    const userIp = await getUserIp();
    const currentTime = getCurrentFormattedTime();
    const commentType = 'post';
    const commentHistoryJson = [
      {
        time: currentTime,
        user_ip: userIp,
        text: commentText,
        type: commentType,
      },
    ];
    try {
      let payload;
      fatherId
        ? (payload = {
            data: {
              CustomUserSelector: user,
              user: { connect: [{ id: user.id }] },
              blog: { connect: [{ id: pageRes[0]?.id }] },
              father: { connect: [{ id: fatherId }] },
              Text: commentText,
              admin_date: Date.now(),
              locale: toUpper(locale),
              user_name: user.real_user_name,
              user_img: user.user_image.id,
            },
          })
        : (payload = {
            data: {
              CustomUserSelector: user,
              user: { connect: [{ id: user.id }] },
              blog: { connect: [{ id: pageRes[0]?.id }] },
              Text: commentText,
              admin_date: Date.now(),
              locale: toUpper(locale),
              user_name: user.real_user_name,
              user_img: user.user_image.id,
            },
          });
      const response = await server.post('/comments1', payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const createCommentHistory = await serverForPlugins.post(
        '/custom-comment-fields/custom-history/create',
        {
          collectionId: response?.data?.data?.id,
          collection: 'Blog Comment',
          history: commentHistoryJson,
        }
      );

      if (response.status === 200) {
        let comments = [];
        let updateChildrenInFather;
        fatherId
          ? (updateChildrenInFather = await server.put(
              `/comments1/${fatherId}`,
              {
                data: {
                  children: { connect: [response.data.data.id] },
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              }
            ))
          : (updateChildrenInFather = null);
        if (fatherId) {
          const newFunc = async () => {
            const fatherComment = await server.get(
              `/comments1/${fatherId}?populate=*`
            );
            const fatherLocale =
              fatherComment.data.data.attributes.locale === 'UK'
                ? 'UA'
                : fatherComment.data.data.attributes.locale;
            if (
              fatherComment.data.data.attributes.user.data.attributes
                .sendMessage
            ) {
              try {
                const response = await axios.post(`/api/comment-message`, {
                  email:
                    fatherComment.data.data.attributes.user.data.attributes
                      .email,
                  locale: fatherComment.data.data.attributes.locale,
                  userName:
                    fatherComment.data.data.attributes.user.data.attributes
                      .real_user_name,
                  link: `${NEXT_FRONT_URL}${
                    fatherLocale === 'RU' ? '' : `/${toLower(fatherLocale)}`
                  }${url}#comment`,
                });
              } catch (e) {
                console.log(e);
              }
            }
          };
          newFunc();
        }

        const getBlogComments = await server.get(
          `/comments1?filters[blog][url]=${url}&${populateParams}&sort[0]=admin_date&pagination[limit]=100`
        );

        comments = getBlogComments.data.data.filter(
          comment => comment.attributes.admin_date
        );
        setUserComments(comments);
      } else {
        console.log('Error posting comment:', response.status, response.data);
      }
    } catch (error) {
      console.log(error);

      if (error?.response?.status === 401) {
        router.push('/login');
        return logout();
      }
      console.error('Error during comment submission:', error);

      if (error.response && error.response.data) {
        const { message, details } = error.response.data.error || {};
        console.error('Error details:', message, details);
      }
    }
  };

  const updateComment = async (e, commentId) => {
    e.preventDefault();

    const userToken = Cookies.get('userToken');
    if (!userToken) {
      router.push('/login');
      return;
    }

    const formElement = e.target;
    const textAreaElement = formElement.querySelector('textarea');
    const commentText = textAreaElement.value;

    if (!commentText) {
      alert('Comment cannot be empty');
      return;
    }

    textAreaElement.value = '';

    if (!user.confirmed) {
      return setShowtMessageModal(true);
    }

    const userIp = await getUserIp();
    const currentTime = getCurrentFormattedTime();
    const commentType = 'post';
    const newHistoryEntry = {
      time: currentTime,
      user_ip: userIp,
      text: commentText,
      type: commentType,
    };

    try {
      await server.put(
        `/comments1/${commentId}`,
        {
          data: {
            Text: commentText,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const updateUserHistory = await serverForPlugins.put(
        '/custom-comment-fields/custom-history/update',
        {
          collectionId: commentId,
          collection: 'Blog Comment',
          history: newHistoryEntry,
        }
      );

      const getBlogComments = await server.get(
        `/comments1?filters[blog][url]=${url}&${populateParams}&sort[0]=admin_date&pagination[limit]=100`
      );

      const comments = getBlogComments.data.data.filter(
        comment => comment.attributes.admin_date
      );
      setUserComments(comments);
    } catch (error) {
      if (error?.response?.status === 401) {
        router.push('/login');
        return logout();
      }
      console.error('Error updating comment:', error);
    }
  };

  const saveChanginDraftComment = async (draftText, commentId) => {
    const userToken = Cookies.get('userToken');
    if (!userToken) {
      return;
    }
    if (!draftText) {
      return console.log('Comment cannot be empty');
    }
    const userIp = await getUserIp();
    const currentTime = getCurrentFormattedTime();
    const commentType = 'edit';
    const newHistoryEntry = {
      time: currentTime,
      user_ip: userIp,
      text: draftText,
      type: commentType,
    };

    try {
      const updateCommentHistory = await serverForPlugins.put(
        '/custom-comment-fields/custom-history/update',
        {
          collectionId: commentId,
          collection: 'Blog Comment',
          history: newHistoryEntry,
        }
      );
    } catch (error) {
      if (error?.response?.status === 401) {
        router.push('/login');
        return logout();
      }

      console.error('Error updating comment:', error);
    }
  };

  const deleteComment = async (commentId, userId) => {
    const userToken = Cookies.get('userToken'); // Retrieve user token from cookies

    const userIp = await getUserIp();
    const currentTime = getCurrentFormattedTime();
    const commentType = 'delete';
    const newHistoryEntry = {
      time: currentTime,
      user_ip: userIp,
      text: '',
      type: commentType,
    };

    if (user.id !== userId) {
      return console.log("it's not your comment");
    }

    const resposnse = await server.put(
      `/comments1/${commentId}`,
      {
        data: {
          publishedAt: null,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const updateCommentHistory = await serverForPlugins.put(
      '/custom-comment-fields/custom-history/update',
      {
        collectionId: commentId,
        collection: 'Blog Comment',
        history: newHistoryEntry,
      }
    );
    const getBlogComments = await server.get(
      `/comments1?filters[blog][url]=${url}&${populateParams}&sort[0]=admin_date&pagination[limit]=100`
    );

    comments = getBlogComments.data.data.filter(
      comment => comment.attributes.admin_date
    );
    setUserComments(comments);
  };
  const asPath = router.asPath;
  const hrefLangTags = generateHrefLangTags(asPath, activePageLocales);

  return (
    <>
      <Head>
        {hrefLangTags.map(tag => (
          <link
            key={tag.key}
            rel={tag.rel}
            hrefLang={tag.hrefLang}
            href={tag.href.endsWith('/') ? tag.href.slice(0, -1) : tag.href}
          />
        ))}
        <title>{seo_title}</title>
        <meta name="description" content={seo_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keyword" content={keywords} />
        <meta property="og:title" content={seo_title} />
        <meta property="og:description" content={seo_description} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={NEXT_STRAPI_API_URL.replace('/api', '') + url}
        />
        <meta
          property="og:image"
          content={`${
            NEXT_STRAPI_API_URL.replace('/api', '') +
              pageImage?.data?.attributes?.url || 'not found'
          }`}
        />
        {faq && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: faq }}
          />
        )}
        {rating && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: rating }}
          />
        )}
        {/* {article && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: article }}
          />
        )} */}
        {howto && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: howto }}
          />
        )}
        <>{parse(chunksHead)}</>
      </Head>
      <>{parse(chunksBodyTop)}</>
      <section
        itemScope
        itemType="http://schema.org/Blog"
        className="container-xxl bg-white p-0"
      >
        <div className="container-xxl position-relative p-0">
          <DefaultLayoutContext.Provider
            value={{
              footerMenus,
              footerGeneral,
              allPages,
              menu,
              errorMessage,
              setErrorMessage,
              errorCode,
              setErrorCode,
              socialData,
            }}
          >
            <MailModal
              message={$t[locale].auth.successConfirmationMessage}
              isVisible={modalActivationIsVisible}
              onClose={() => {
                setActivationModalVisible(false);
              }}
            />
            <ModalConfirm
              message={$t[locale].auth.confirm_text_delete}
              isVisible={isShowConfirmModal}
              onClose={() => {
                setShowConfirmModal(false);
              }}
              onSubmit={() => {
                deleteComment(editedCommentId, commentUserId);
                setShowConfirmModal(false);
              }}
            />
            <NotConfirmedModal
              message={$t[locale].auth.notConfirmedMessage}
              isVisible={isShowMessageModal}
              sendMessage={sendActivationMessage}
              onClose={() => {
                setShowtMessageModal(false);
              }}
            />
            <DefaultLayout>
              {/* В компонент hero передаем заголовок страницы и данные которые там будут преобразованы в breadcrumb */}
              <div className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  {/* <div className="container-xxl py-5 bg-primary  mb-5"> */}
                  <div
                    className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5"
                    style={{ marginLeft: 0 }}
                  >
                    <header className="row g-5 pt-1">
                      <div className="col-12 text-center text-md-start">
                        <nav>
                          {/* <ol style={{ listStyleType: "none", padding: 0 }} className='text-white  d-flex align-items-center flex-wrap  justify-content-center justify-content-xl-start '> */}
                          <ol
                            style={{ listStyleType: 'none', padding: 0 }}
                            className="text-white animated slideInLeft d-flex align-items-center flex-wrap  justify-content-center justify-content-xl-start "
                          >
                            <li>
                              <Link style={{ fontWeight: 600 }} href={`/blog`}>
                                <span className="d-inline text-white heading_title">
                                  {$t[locale].blog.all} |{' '}
                                </span>
                              </Link>
                            </li>

                            {headings.map((heading, index) => {
                              const headingName = heading?.attributes.Name;
                              const isLast = index === headings.length - 1;
                              return (
                                <li
                                  key={heading.id}
                                  className="d-flex gap-2 align-items-center  "
                                >
                                  <Link
                                    style={{ fontWeight: 600 }}
                                    href={`/blog?heading=${headingName}`}
                                  >
                                    <span className="d-inline heading_title text-white heading_name">
                                      {headingName.charAt(0).toUpperCase() +
                                        headingName.slice(1)}
                                    </span>
                                  </Link>
                                  {!isLast && (
                                    <span className="d-inline heading_title text-white">
                                      {' '}
                                      |{' '}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        </nav>
                        <h1 className="d-none text-white animated slideInLeft">
                          {page_title}
                        </h1>
                        <h1 className="display-5 text-white animated slideInLeft">
                          {page_title}
                        </h1>

                        <nav aria-label="breadcrumb">
                          <ol
                            itemScope
                            itemType="http://schema.org/BreadcrumbList"
                            className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft"
                          >
                            <li
                              itemProp="itemListElement"
                              itemScope
                              itemType="http://schema.org/ListItem"
                              className="breadcrumb-item"
                            >
                              <Link
                                itemProp="item"
                                className=" text-white"
                                href="/"
                              >
                                <meta itemProp="position" content="1" />
                                <span itemProp="name">
                                  {$t[locale].menu.main}
                                </span>
                              </Link>
                            </li>
                            <li
                              itemProp="itemListElement"
                              itemScope
                              itemType="http://schema.org/ListItem"
                              className="breadcrumb-item"
                            >
                              <Link
                                itemProp="item"
                                className=" text-white"
                                href="/blog"
                              >
                                <meta itemProp="position" content="2" />

                                <span itemProp="name">
                                  {$t[locale].blog.titleName}
                                </span>
                              </Link>
                            </li>
                            <li
                              itemProp="itemListElement"
                              itemScope
                              itemType="http://schema.org/ListItem"
                              className="breadcrumb-item"
                            >
                              <Link
                                itemProp="item"
                                className=" text-white"
                                href={url}
                              >
                                <meta itemProp="position" content="3" />

                                <span itemProp="name">
                                  {seo_title ? page_title : '404'}
                                </span>
                              </Link>
                            </li>
                          </ol>
                        </nav>
                      </div>
                    </header>
                  </div>
                </div>
              </div>
              <div className="container-xxl">
                <div className="row ">
                  <div className="col article-col pe-md-2">
                    <main
                      className="cont-body"
                      style={{ maxWidth: '90%', margin: '0 auto' }}
                    >
                      {errorMessage && (
                        <div className="error-message">
                          <h3>
                            {errorCode != null
                              ? `${
                                  errorText[
                                    Object.keys(message404).find(
                                      key => message404[key] === errorMessage
                                    )
                                  ]
                                } ${errorCode}`
                              : errorMessage}
                          </h3>
                          {errorCode != null && (
                            <p className="error-descr">{errorMessage}</p>
                          )}
                        </div>
                      )}
                      {notFoundMessage && (
                        <div className="error-message">
                          <h3>{$t[locale].blog.pageNotFoud}</h3>
                          {errorCode != null && (
                            <p className="error-descr">{errorMessage}</p>
                          )}
                        </div>
                      )}
                      {!notFoundMessage && (
                        <>
                          <article
                            itemProp="blogPosts"
                            itemScope
                            itemType="https://schema.org/BlogPosting"
                          >
                            {articleStrapi && (
                              <div className="notShowOnPage">
                                <span
                                  itemProp="author"
                                  itemScope
                                  itemType="https://schema.org/Person"
                                >
                                  <link
                                    itemProp="url"
                                    href={`${NEXT_FRONT_URL}/user/${articleStrapi?.author?.data?.attributes?.username}`}
                                  />
                                  <span
                                    itemProp="name"
                                    href={`${NEXT_FRONT_URL}/user/${articleStrapi?.author?.data?.attributes?.username}`}
                                  >
                                    {
                                      articleStrapi?.author.data.attributes
                                        .real_user_name
                                    }
                                  </span>
                                </span>
                                {articleStrapi?.images?.data.map(element => {
                                  return (
                                    <Image
                                      loading="lazy"
                                      width={10}
                                      height={10}
                                      itemProp="image"
                                      src={`${
                                        NEXT_STRAPI_BASED_URL +
                                        element?.attributes?.url
                                      }`}
                                      alt={
                                        element?.attributes?.alternativeText ||
                                        'alt text'
                                      }
                                      key={element?.id}
                                    />
                                  );
                                })}
                                <div itemProp="headline">{seo_title}</div>
                                <div itemProp="articleBody">
                                  {articleStrapi.body}
                                </div>
                              </div>
                            )}
                            <header>
                              <div className="row">
                                <dl className="row gap-sm-2 align-items-center mb-2 ps-0">
                                  <dt className="notShowOnPage">
                                    {$t[locale].seo.category}
                                  </dt>
                                  <dd>
                                    <Link
                                      className="text-capitalize fw-bold w-auto part  page_heading_page "
                                      href={`/blog?heading=${heading.data?.attributes.Name}`}
                                    >
                                      {heading.data?.attributes.Name}
                                    </Link>
                                  </dd>
                                  <dt className="notShowOnPage">
                                    {$t[locale].seo.publishTime}
                                  </dt>
                                  <dd>
                                    <time
                                      itemProp="datePublished"
                                      dateTime={admin_date}
                                      className="w-auto part"
                                    >
                                      {formatDateTime(admin_date)}
                                    </time>
                                  </dd>
                                  <dt className="notShowOnPage">
                                    {$t[locale].seo.comments}
                                  </dt>
                                  <dd>
                                    <div className="w-auto comments part">
                                      <Link
                                        href={`${url}#comment`}
                                        className=""
                                      >
                                        <picture>
                                          <Image
                                            src={'/img/commentSvgIcon.svg'}
                                            width="24"
                                            height="24"
                                            alt="comment icon"
                                          ></Image>
                                        </picture>
                                        <span className="disqus-comment-count">
                                          {usersComments.length}
                                        </span>
                                      </Link>
                                    </div>
                                  </dd>
                                  <dt className="notShowOnPage">
                                    {$t[locale].seo.views}
                                  </dt>
                                  <dd>
                                    <div className="w-auto part">
                                      <picture style={{ marginRight: 7 }}>
                                        <Image
                                          src={'/img/viewSvgIcon.svg'}
                                          height="24"
                                          width="20"
                                          alt="views"
                                        ></Image>
                                      </picture>

                                      {views}
                                    </div>
                                  </dd>
                                </dl>
                              </div>
                            </header>
                            <div
                              dangerouslySetInnerHTML={{ __html: body }}
                            ></div>
                            <div id="comment"></div>
                            <Comments
                              blogImage={pageImage}
                              articleStrapi={articleStrapi}
                              seo_title={seo_title}
                              admin_date={admin_date}
                              pageUrl={url}
                              globalUserIp={globalUserIp}
                              saveDraftComment={saveDraftComment}
                              updateComment={updateComment}
                              saveChanginDraftComment={saveChanginDraftComment}
                              onDelete={(commentId, userId) => {
                                setEditedCommetId(commentId);
                                setCommentUserId(userId);
                                setShowConfirmModal(true);
                              }}
                              data={usersComments}
                              sendMessage={sendMessage}
                            />
                          </article>
                        </>
                      )}
                    </main>
                  </div>
                  <Sidebar randomBanner={randomBanner}>
                    <MostPopular
                      title={$t[locale].news.mostpopular}
                      data={mostPopularNews}
                    />
                    <MostPopular
                      title={$t[locale].blog.mostpopular}
                      data={mostPopular}
                    />
                  </Sidebar>
                </div>
              </div>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </section>
      <>{parse(chunksBodyFooter)}</>
    </>
  );
};

export async function getServerSideProps({
  query,
  locale,
  res,
  resolvedUrl,
}: Query) {
  let comments = [];
  let pageIds;
  const slug = `/blog/${query?.slug}` || '';
  const Locale = locale === 'ua' ? 'uk' : locale;
  let notFoundMessage = false;
  const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;

  // Паралельне виконання основних запитів
  const [
    randomBanner,
    mostPopularBlog,
    mostPopularNewsResponse,
    headingsRes,
    pageRes,
    strapiMenu,
    headerFooterData,
    socialRes,
    pagesWithSameUrl,
  ] = await Promise.all([
    getRandomBanner(Locale),
    getRandomPopularNews(Locale),
    getRandomPopularNews(Locale, 4, 'newss', false),
    server
      .get(`/headings?locale=${Locale}`)
      .catch(() => ({ data: { data: [] } })), // Обробка помилок для headings
    server.get(getBlogPage(slug, Locale)),
    server.get(getMenu('main')),
    getHeaderFooterMenus(Locale),
    server.get('/social'),
    server.get(getBlogPage(slug, 'all')),
  ]);
  // Обробка результатів
  let headings = headingsRes?.data?.data || [];
  let pageData = pageRes?.data?.data || [];
  let menuData = headerFooterData || {};
  let socialData = socialRes?.data?.data?.attributes || null;
  let mostPopular =
    mostPopularBlog.length > 0
      ? mostPopularBlog
      : await getRandomPopularNews('ru');

  // Якщо не знайшли сторінку, шукаємо в російській версії
  if (pageData.length === 0) {
    notFoundMessage = true;
    pageData = pageRes?.data?.data || [];
  }

  const crumbs = strapiMenu?.data?.data[0]?.attributes?.items?.data || [];
  if (!isPageWithLocaleExists(resolvedUrl, Locale, menuData.allPages)) {
    res.statusCode = 404;
  }

  // Отримання коментарів і реакцій
  const pageUrl = pageData[0]?.attributes?.url || '';
  const getBlogComments = await server.get(
    `/comments1?filters[blog][url]=${pageUrl}&${populateParams}&sort[0]=admin_date&pagination[limit]=100`
  );
  comments =
    getBlogComments?.data?.data?.filter(
      comment => comment.attributes.admin_date
    ) || [];

  let commentsReactionsByPageUrl = await fetch(
    `${NEXT_STRAPI_BASED_URL}/custom-comment-fields/reactionsByPage?page_url=${pageUrl}`
  )
    .then(response => response.json())
    .catch(() => []);

  const commentsWithReaction = comments.map(comment => ({
    ...comment,
    reactions: commentsReactionsByPageUrl.filter(
      reaction => reaction.comment_id === comment.id
    ),
  }));

  if (pageData[0]?.attributes) {
    const {
      seo_title,
      seo_description,
      page_title,
      url,
      body,
      keywords,
      faq,
      heading,
      rating,
      code,
      article,
      views,
      admin_date,
      howto,
      image: pageImage,
    } = pageData[0]?.attributes;

    await getPagesIdWithSameUrl(url).then(data => (pageIds = data));

    const shortenedTitle =
      page_title.length > 65 ? `${page_title.slice(0, 65)}...` : page_title;
    const activePageLocales = pagesWithSameUrl.data.data.map(
      element => element.attributes.locale
    );
    return {
      props: {
        activePageLocales: activePageLocales,
        mostPopularNews: mostPopularNewsResponse,
        pageImage,
        admin_date,
        seo_title,
        seo_description,
        page_title: shortenedTitle,
        url,
        pageRes: pageData,
        body,
        crumbs,
        notFoundMessage,
        slug,
        keywords,
        comments: commentsWithReaction,
        heading,
        code,
        views,
        rating: genRatingData(rating?.data),
        faq: genFaqData(faq?.data),
        article: genArticleData(article, admin_date, Locale, slug),
        howto: getHowToData(howto),
        randomBanner,
        mostPopular,
        menu: menuData.menu,
        allPages: menuData.allPages,
        footerMenus: menuData.footerMenus,
        footerGeneral: menuData.footerGeneral,
        headings,
        socialData,
        commentsReactionsByPageUrl,
        articleStrapi: article,
      },
    };
  }

  return {
    props: {
      activePageLocales: [],
      mostPopularNews: [],
      pageImage: null,
      headings,
      admin_date: '',
      seo_title: '',
      seo_description: '',
      page_title: '',
      url: '',
      body: '',
      comments: [],
      mostPopular,
      pageRes: [],
      crumbs: '',
      slug: '',
      keywords: '',
      rating: null,
      views: 0,
      pageIds: [],
      heading: '',
      article: null,
      faq: [],
      notFoundMessage: true,
      code: [],
      howto: null,
      randomBanner,
      menu: menuData.menu || [],
      allPages: menuData.allPages || [],
      footerMenus: menuData.footerMenus || {
        about: { title: '', items: [] },
        services: { title: '', items: [] },
        contacts: {},
      },
      footerGeneral: menuData.footerGeneral || {},
      socialData,
      commentsReactionsByPageUrl: [],
      articleStrapi: null,
    },
  };
}

export default Page;
