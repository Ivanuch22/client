// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import Head from 'next/head';
import Link from 'next/link';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import $t from '@/locale/global';
import { server } from '@/http/index';
import { errorText, message404 } from '../switch';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';

import { $ } from '@/utils/utils';
import genRatingData from '@/utils/generators/genRatingData';
import genFaqData from '@/utils/generators/genFaqData';
import genArticleData from '@/utils/generators/genArticleData';
import getHowToData from '@/utils/generators/getHowToData';
import { getMenu, getBlogPage } from '@/utils/queries';
import genListItemData from '@/utils/generators/genListItemData';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import isPageWithLocaleExists from '@/utils/isPageWithLocaleExists';
import getRandomBanner from '@/utils/getRandomBanner';
import getRandomPopularNews from '@/utils/getRandomPopularNews';
import formatDateTime from '@/utils/formateDateTime';
import MailModal from '@/components/organisms/ModalMail';
import getPagesIdWithSameUrl from "@/utils/getPagesIdWithSameUrl"

import DefaultLayout from '@/components/layouts/default';
import { Crumb } from '@/components/molecules/Breacrumbs';
import Sidebar from '@/components/organisms/Sidebar';
import MostPopular from '@/components/organisms/MostPopular';
import Comments from '@/components/organisms/coments';
import NotConfirmedModal from '@/components/organisms/NotConfirmedModal';
import ModalConfirm from '@/components/organisms/ModalConfirm';
import { toLower, toUpper } from 'lodash';
import getCurrentFormattedTime from "@/utils/getCurrentFormattedTime"
import getUserIp from "@/utils/getUserIp"
import { useAuth } from '@/contexts/AuthContext';




const { publicRuntimeConfig } = getConfig();

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
  extraLinks,
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
  socialData,
}: PageAttibutes) => {

  const [usersComments, setUserComments] = useState([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isShowNotFoutMessage, setIsShowNotFoutMessage] = useState(false)
  const [isShowMessageModal, setShowtMessageModal] = useState(false)
  const { NEXT_FRONT_URL, NEXT_MAILER } = publicRuntimeConfig;
  const router = useRouter();
  const [modalActivationIsVisible, setActivationModalVisible] = useState(false);
  const [isShowConfirmModal, setShowConfirmModal] = useState(false)
  const [editedCommentId, setEditedCommetId] = useState(0)
  const [commentUserId, setCommentUserId] = useState(0)
  const { isLogin, logout, updateUser } = useAuth();


  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  useEffect(() => {
    setUserComments(comments)
  }, [comments])


  useEffect(() => {
    setIsShowNotFoutMessage(notFoundMessage)
    const incrementPageViews = async (pageId) => {
      const viewedPages = (Cookies.get('viewedPages') || '').split(',');
      if (viewedPages.includes("" + pageId)) {
        console.log('Already viewed this page');
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
    incrementPageViews(pageRes[0]?.id)
  }, [pageRes[0]?.id]);





  // Эта функция рекурсивно пробегаем по объекту навигации который мы возвращаем из функции getServerSideProps
  // и генерирует одномерный мессив объектов который будет в последующем преобразован в компонент breadcrumbs
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


    const sendMessage = server.post("/auth/send-email-confirmation", {
      email: user.email
    })
    setShowtMessageModal(false)
    setActivationModalVisible(true);
    setTimeout(() => {
      setActivationModalVisible(false);
    }, 3000);
  }


  const shortenedTitle = useMemo<string>(() => {
    return page_title.length > 65
      ? `${page_title.slice(0, 65)}...`
      : page_title;
  }, [page_title]);

  const saveDraftComment = async(draftText)=>{
    const userToken = Cookies.get('userToken');

    
    if (!userToken) {
      return 
    }
    let getUserCookies = Cookies.get('user');
    const user = JSON.parse(getUserCookies);
    if (!draftText) {
      
      return console.log('Comment cannot be empty');
    }

    const userIp = await getUserIp()
    const currentTime = getCurrentFormattedTime()
    const commentType = "edit"
    const commentHistoryJson = [
      {
        time: currentTime,
        user_ip: userIp,
        text: draftText,
        type: commentType
      }
    ]
    console.log(user)
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
        history: commentHistoryJson
      }

    }

    try{
      const response = await server.post('/comments1', payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
    }catch(error){
      console.log(error)

      if (error.response.status === 401) {
        router.push("/login")
        return logout();
      }
    }


    console.log(response.data)
  }

  const sendMessage = async (e, fatherId) => {
    e.preventDefault();

    const userToken = Cookies.get('userToken');
    if (!userToken) {
      router.push('/login');
      return;
    }

    const formElement = e.target;
    const textAreaElement = formElement.querySelector("textarea");
    const commentText = textAreaElement.value;

    if (!commentText) {
      alert('Comment cannot be empty');
      return;
    }

    textAreaElement.value = '';

    let getUserCookies = Cookies.get('user');
    const user = JSON.parse(getUserCookies);
    const blogUrl = pageRes[0].attributes.url

    if (!user.confirmed) {
      return setShowtMessageModal(true)
    }

    const userIp = await getUserIp()
    const currentTime = getCurrentFormattedTime()
    const commentType = "post"
    const commentHistoryJson = [
      {
        time: currentTime,
        user_ip: userIp,
        text: commentText,
        type: commentType
      }
    ]


    try {
      let payload;
      fatherId ? payload = {
        data: {
          user: { connect: [{ id: user.id }] },
          blog: { connect: pageIds },
          father: { connect: [{ id: fatherId }] },
          Text: commentText,
          admin_date: Date.now(),
          locale: toUpper(locale),
          user_name: user.real_user_name,
          user_img: user.user_image.id,
          history: commentHistoryJson
        }

      } : payload = {
        data: {
          user: { connect: [{ id: user.id }] },
          blog: { connect: pageIds },
          Text: commentText,
          admin_date: Date.now(),
          locale: toUpper(locale),
          user_name: user.real_user_name,
          user_img: user.user_image.id,
          history: commentHistoryJson
        }
      };
      console.log(commentText)
      const response = await server.post('/comments1', payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        let comments = [];
        let updateChildrenInFather;
        fatherId ? updateChildrenInFather = await server.put(`/comments1/${fatherId}`, {
          data: {
            children: { connect: [response.data.data.id] }
          }
        }, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }) : updateChildrenInFather = null;
        if (fatherId) {
          const newFunc = async () => {
            const fatherComment = await server.get(`/comments1/${fatherId}?populate=*`);
            const fatherLocale = fatherComment.data.data.attributes.locale === 'UK' ? 'UA' : fatherComment.data.data.attributes.locale;
            console.log(fatherLocale)
            if (fatherComment.data.data.attributes.user.data.attributes.sendMessage) {
              const response = await axios.post(`/api/comment-message`, {
                email: fatherComment.data.data.attributes.user.data.attributes.email,
                locale: fatherComment.data.data.attributes.locale,
                userName: fatherComment.data.data.attributes.user.data.attributes.real_user_name,
                link: `${NEXT_FRONT_URL}${(fatherLocale === "RU" ? "" : `/${toLower(fatherLocale)}`)}${url}#comment`
              });
            }
          }
          newFunc()
        }

    const getBlogComments = await server.get(`/comments1?filters[blog][url]=${url}&populate=*&sort[0]=admin_date&pagination[limit]=100`);


        comments = getBlogComments.data.data.filter(comment => comment.attributes.admin_date);
        setUserComments(comments);
      } else {
        console.log('Error posting comment:', response.status, response.data);
      }
    } catch (error) {
      console.log(error)

      if (error.response.status === 401) {
        router.push("/login")
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
    const textAreaElement = formElement.querySelector("textarea");
    const commentText = textAreaElement.value;

    if (!commentText) {
      alert('Comment cannot be empty');
      return;
    }

    textAreaElement.value = '';

    let getUserCookies = Cookies.get('user');
    const user = JSON.parse(getUserCookies);
    const blogUrl = pageRes[0].attributes.url;

    if (!user.confirmed) {
      return setShowtMessageModal(true);
    }

    const userIp = await getUserIp()
    const currentTime = getCurrentFormattedTime()
    const commentType = "post"
    const newHistoryEntry =
    {
      time: currentTime,
      user_ip: userIp,
      text: commentText,
      type: commentType
    }



    try {
      const currentCommentResponse = await server.get(`/comments1/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        }
      });
      const currentComment = currentCommentResponse.data.data;

      const currentHistory = currentComment.attributes.history || [];

      const updatedHistory = [newHistoryEntry, ...currentHistory];

      await server.put(`/comments1/${commentId}`,
        {
          data: {
            Text: commentText,
            history: updatedHistory
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          }
        });

        const getBlogComments = await server.get(`/comments1?filters[blog][url]=${url}&populate=*&sort[0]=admin_date&pagination[limit]=100`);
      const comments = getBlogComments.data.data.filter(comment => comment.attributes.admin_date);
      setUserComments(comments);
    } catch (error) {
      console.log(error)

      if (error.response.status === 401) {
        router.push("/login")
        return logout();

      }
      console.error('Error updating comment:', error);
    }

  };

  const saveChanginDraftComment = async(draftText,commentId)=>{
    const userToken = Cookies.get('userToken');

    if (!userToken) {
      return 
    }
    let getUserCookies = Cookies.get('user');
    const user = JSON.parse(getUserCookies);
    if (!draftText) {
      return console.log('Comment cannot be empty');
    }

    const userIp = await getUserIp()
    const currentTime = getCurrentFormattedTime()
    const commentType = "edit"
    const newHistoryEntry = [
      {
        time: currentTime,
        user_ip: userIp,
        text: draftText,
        type: commentType
      }
    ]

    try {
      const currentCommentResponse = await server.get(`/comments1/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        }
      });
      const currentComment = currentCommentResponse.data.data;

      const currentHistory = currentComment.attributes.history || [];

      const updatedHistory = [newHistoryEntry, ...currentHistory];

      await server.put(`/comments1/${commentId}`,
        {
          data: {
            history: updatedHistory
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          }
        });
    } catch (error) {
      console.log(error)
      if (error.response.status === 401) {
        router.push("/login")
        return logout();

      }

      console.error('Error updating comment:', error);
    }
  }


  const deleteComment = async (commentId, userId) => {
    const userToken = Cookies.get('userToken'); // Retrieve user token from cookies
    let getUserCookies = Cookies.get('user');
    const user = JSON.parse(getUserCookies);
    console.log(user.id)

    if (user.id !== userId) {
      console.log(userId)
      return console.log("it's not your comment")
    }

    const resposnse = await server.put(`/comments1/${commentId}`, {
      data: {
        publishedAt: null
      }
    }, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },

    });
    const getBlogComments = await server.get(`/comments1?filters[blog][url]=${url}&populate=*&sort[0]=admin_date&pagination[limit]=100`);

    comments = getBlogComments.data.data.filter(comment => comment.attributes.admin_date);
    setUserComments(comments);

  }


  return (
    <>
      <Head>
        <title>{seo_title}</title>
        <meta name="description" content={seo_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keyword" content={keywords} />
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
        {article && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: article }}
          />
        )}
        {howto && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: howto }}
          />
        )}
        {extraLinks && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: extraLinks }}
          />
        )}
        <>{require('html-react-parser')(chunksHead)}</>
      </Head>
      <>{require('html-react-parser')(chunksBodyTop)}</>
      <div className="container-xxl bg-white p-0">
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
                setActivationModalVisible(false)
              }}
            />
            <ModalConfirm
              message={$t[locale].auth.confirm_text_delete}
              isVisible={isShowConfirmModal}
              onClose={() => {
                setShowConfirmModal(false)
              }}
              onSubmit={() => {
                deleteComment(editedCommentId, commentUserId)
                setShowConfirmModal(false)
              }}
            />
            <NotConfirmedModal
              message={$t[locale].auth.notConfirmedMessage}
              isVisible={isShowMessageModal}
              sendMessage={sendActivationMessage}
              onClose={() => {
                setShowtMessageModal(false)
              }}
            />
            <DefaultLayout>
              {/* В компонент hero передаем заголовок страницы и данные которые там будут преобразованы в breadcrumb */}
              <div className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  <div className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5">
                    <div className="row g-5 pt-1">
                      <div
                        className="col-12 text-center text-md-start"

                      >
                        <h1 className="text-white animated d-flex align-items-center flex-wrap slideInLeft justify-content-center justify-content-xl-start ">
                          <Link href={`/blog`}>
                            <span className="d-inline text-white heading_title">{$t[locale].blog.all} | </span>
                          </Link>
                          {headings.map((heading, index) => {
                            const headingName = heading?.attributes.Name;
                            const isLast = index === headings.length - 1;

                            return (
                              <div key={heading.id} className='d-flex gap-2 align-items-center  '>
                                <Link href={`/blog?heading=${headingName}`}>
                                  <span className="d-inline heading_title text-white heading_name">
                                    {headingName.charAt(0).toUpperCase() + headingName.slice(1)}
                                  </span>
                                </Link>
                                {!isLast && <span className="d-inline heading_title text-white"> | </span>}
                              </div>
                            );
                          })}
                        </h1>
                        <h1 className="d-none text-white animated slideInLeft">
                          {shortenedTitle}
                        </h1>
                        <h1 className="display-5 text-white animated slideInLeft">
                          {shortenedTitle}
                        </h1>


                        <nav aria-label="breadcrumb">
                          <ol className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft">
                            <li className="breadcrumb-item">
                              <Link className="text-white" href="/">
                                {$t[locale].menu.main}
                              </Link>
                            </li>
                            <li className="breadcrumb-item">
                              <Link className="text-white" href="/blog">
                                {$t[locale].blog.titleName}
                              </Link>
                            </li>
                            <li className="breadcrumb-item">
                              <a className="text-white" href="#">
                                {seo_title ? shortenedTitle : '404'}
                              </a>
                            </li>
                          </ol>
                        </nav>
                      </div>
                    </div>
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
                              ? `${errorText[
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
                          <h3>
                            {$t[locale].blog.pageNotFoud}
                          </h3>
                          {errorCode != null && (
                            <p className="error-descr">{errorMessage}</p>
                          )}
                        </div>
                      )}
                      {!notFoundMessage && (
                        <>
                          <div className="row">
                            <div className='row gap-sm-2 align-items-center mb-2 ps-4'>
                              <Link className='text-capitalize fw-bold w-auto part  page_heading_page ' href={`/blog?heading=${heading.data?.attributes.Name}`}>{heading.data?.attributes.Name}</Link>
                              <div className='w-auto part'>{formatDateTime(admin_date)}</div>
                              <div className="w-auto comments part" >
                                <Link href={`${url}#comment`} className="">
                                  <img src="https://itc.ua/wp-content/themes/ITC_6.0/images/comment_outline_24.svg" height="24" width="24" alt="comment" />
                                  <span className="disqus-comment-count" data-disqus-identifier="2259249=">{usersComments.length}</span>
                                </Link>
                              </div>
                              <div className='w-auto part'><img style={{ marginRight: 7 }} src="https://itc.ua/wp-content/themes/ITC_6.0/images/eye2.png" height="11" width="17" alt="views icon"></img>{views}</div>

                            </div>

                          </div>
                          <div dangerouslySetInnerHTML={{ __html: body }}></div>
                          <div id="comment"></div>
                          <Comments
                          saveDraftComment = {saveDraftComment}
                           updateComment={updateComment}
                           saveChanginDraftComment = {saveChanginDraftComment}
                          onDelete={(commentId, userId) => {
                            console.log(userId, commentId)
                            setEditedCommetId(commentId);
                            setCommentUserId(userId)
                            console.log(commentUserId)

                            setShowConfirmModal(true)
                          }} data={usersComments} sendMessage={sendMessage} />
                        </>
                      )}
                    </main>
                  </div>
                  <Sidebar randomBanner={randomBanner}>
                    <MostPopular title={$t[locale].blog.mostpopular} data={mostPopular} />

                  </Sidebar>
                </div>
              </div>
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </div>
      </div>
      <>{require('html-react-parser')(chunksBodyFooter)}</>
    </>
  );
};

export async function getServerSideProps({
  query,
  locale,
  res,
  resolvedUrl,
}: Query) {
  let headings;
  let comments = [];
  let pageIds;

  const slug = `/blog/${query?.slug}` || '';
  const Locale = locale === 'ua' ? 'uk' : locale;
  let notFoundMessage = false
  const randomBanner = await getRandomBanner(Locale);
  let mostPopular = await getRandomPopularNews(Locale);


  if (mostPopular.length === 0) {
    mostPopular = await getRandomPopularNews("ru");
  }


  try {
    const getHeadings = await server.get(`/headings?locale=${Locale}`);
    headings = getHeadings.data.data;
  } catch (e) {
    console.error("Error fetching headings data", e);
    headings = [];
  }

  let pageRes = await server.get(getBlogPage(slug, $(Locale)));
  if (pageRes.data.data.length === 0) {
    // notFoundMessage = true
    // pageRes = await server.get(getBlogPage(slug, "ru"));
  }
  const strapiMenu = await server.get(getMenu('main'));

  const { menu, allPages, footerMenus, footerGeneral } = await getHeaderFooterMenus(Locale);

  const crumbs = strapiMenu.data.data[0].attributes.items.data;

  if (!isPageWithLocaleExists(resolvedUrl, Locale, allPages)) {
    res.statusCode = 404;
  }

  const socialRes = await server.get('/social');
  const socialData = socialRes.data.data.attributes;

  if (pageRes.data?.data[0]?.attributes) {
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
      extraLinks,
      code,
      admin_date,
      article,
      views,
      publishedAt,
      howto,
    }: PageAttibutes = pageRes.data?.data[0]?.attributes;
    await getPagesIdWithSameUrl(url).then(data => pageIds = data)

    const getBlogComments = await server.get(`/comments1?filters[blog][url]=${url}&populate=*&sort[0]=admin_date&pagination[limit]=100`);
    comments = getBlogComments.data.data.filter(comment => comment.attributes.admin_date);

    // replace port in images
    const regex = /src="https:\/\/t-h-logistics\.com:17818\/uploads\//g;
    const replacedImagesSrcBody = body.replace(
      regex,
      'src="https://t-h-logistics.com/uploads/'
    );

    return {
      props: {
        admin_date,
        seo_title,
        pageIds,
        seo_description,
        page_title,
        url,
        pageRes: pageRes.data.data,
        body: replacedImagesSrcBody,
        crumbs,
        notFoundMessage,
        slug,
        keywords,
        comments,
        heading,
        code,
        views,
        extraLinks: genListItemData(extraLinks),
        rating: genRatingData(rating.data),
        faq: genFaqData(faq.data),
        article: genArticleData(article, publishedAt, Locale, slug),
        howto: getHowToData(howto),
        randomBanner,
        mostPopular,
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        headings,
        socialData: socialData ?? null,
      },
    };
  }

  return {
    props: {
      headings,
      admin_date: "",
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
      heading: "",
      article: null,
      faq: [],
      extraLinks: [],
      notFoundMessage: true,
      code: [],
      howto: null,
      randomBanner,
      menu: menu ?? [],
      allPages: allPages ?? [],
      footerMenus: footerMenus ?? {
        about: { title: '', items: [] },
        services: { title: '', items: [] },
        contacts: {},
      },
      footerGeneral: footerGeneral ?? {},
      socialData: socialData ?? null,
    },
  };
}

export default Page;
