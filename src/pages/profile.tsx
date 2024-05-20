//@ts-nocheck

import Head from 'next/head';
import DefaultLayout from '@/components/layouts/default';
import { useEffect, useState } from 'react';
import { server } from '@/http';
import Script from 'next/script';
import { useRouter } from 'next/router';
import $t from '@/locale/global';
import DefaultLayoutContext from '@/contexts/DefaultLayoutContext';
import getHeaderFooterMenus from '@/utils/getHeaderFooterMenus';
import { useAuth } from '@/contexts/AuthContext';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/organisms/ModalConfirm'
import MailModal from '@/components/organisms/ModalMail';
import ImgEditor from '@/components/organisms/ImgEditor';
import getConfig from 'next/config';
import NotConfirmedModal from '@/components/organisms/NotConfirmedModal';
import PasswordModal from '@/components/organisms/PasswordModal';

export default function Profile({
  menu,
  allPages,
  footerMenus,
  footerGeneral,
  socialData,
}) {
  const { publicRuntimeConfig } = getConfig();
  const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;
  const noImgUrl = `${NEXT_STRAPI_BASED_URL}/uploads/nophoto_c7c9abf542.png`;

  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState({});
  const [isDisabled, setIsDisabled] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.imgLink || noImgUrl);
  const router = useRouter();
  const locale = router.locale === 'ua' ? 'uk' : router.locale;
  const { isLogin, logout, updateUser } = useAuth();
  const [defaultBirthday, setDefaultBirthday] = useState('2000-01-01')
  const [modalIsVisible, setModalVisible] = useState(false);
  const [modalActivationIsVisible, setActivationModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false)
  const [isShowMessageModal, setShowtMessageModal] = useState(false)
  const [isShowPasswordModal, setShowPasswordModal] = useState(false);


  useEffect(() => {
    setLogin(isLogin);
  }, [isLogin]);
  useEffect(() => {
    const getUserCookies = Cookies.get('user');
    if (!getUserCookies) return
    const userCookies = JSON.parse(getUserCookies)
    let userFromBd = userCookies;
    async function getUser() {
      const strapiRes = await server.get(`/users/${userCookies.id}`)
      Cookies.set('user', JSON.stringify(strapiRes.data), { expires: 7 });
      setUser(strapiRes.data)
    }

    getUser()
    setUser(userFromBd);

    if (userFromBd.imgLink) {
      setAvatarUrl(userFromBd.imgLink);
    } else {
      setAvatarUrl(noImgUrl)
    }

    if (userFromBd.birthday) {
      setDefaultBirthday(userFromBd.birthday)
    }
  }, []);

  useEffect(() => {
    if (user.birthday) {
      setDefaultBirthday(user.birthday)
    }
  }, [user])


  async function updateJWT(password) {
    const getUserCookies = Cookies.get('user');
    const userCookies = JSON.parse(getUserCookies)
    const email = userCookies.email;

    if (!email || !password) {
      return handleError('Заповніть правильно данні');
    }

    try {
      const response = await server.post('/auth/local', {
        identifier: email,
        password: password,
      });
      Cookies.set('userToken', response.data.jwt, { expires: 7 });
      Cookies.set('userName', response.data.user.real_user_name, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
      updateUser();
      setShowPasswordModal(false)

    } catch (error) {
      console.log('An error occurred:', error.response);
      return handleError(error);
    }
  }

  async function updateStrapiData(userObj: object) {
    const newObj = {
      imgLink: userObj.imgLink,
      avatarId: userObj.avatarId,
      birthday: userObj.birthday,
      email: userObj.email,
      real_user_name: userObj.real_user_name,
      sendMessage: userObj.sendMessage
    }


    const strapiRes = await server.put(`/users/${userObj.id}`, newObj, {
      headers: {
        Authorization: `Bearer ${Cookies.get('userToken')}`,
      },
    });
    Cookies.set('user', JSON.stringify(strapiRes.data), { expires: 7 });
    Cookies.set('userName', JSON.stringify(strapiRes.data.real_user_name), {
      expires: 7,
    });
    return strapiRes

  }
  async function changeData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user.confirmed) {
      return setShowtMessageModal(true)
    }

    try {
      const resData = await updateStrapiData(user);
      if (resData.status === 200) {
        setIsDisabled(true);
        handleSuccess();
        updateUser();
      } else {
        handleError($t[locale].auth.error.invalid);
        console.log(e);
      }
      setModalVisible(false)
    } catch (e) {

      if (e.response.status === 401) {
        return setShowPasswordModal(true)
      }
      setModalVisible(false)
      handleError($t[locale].auth.error.empty);
    }
  };
  async function changePass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user.confirmed) {
      return setShowtMessageModal(true)
    }
    const formData = new FormData(event.currentTarget);
    const oldPass = formData.get('oldPass');
    const newPass = formData.get('newPass');
    const token = Cookies.get('userToken');
    console.log("hello")
    try {
      const res = await server.post(
        '/auth/change-password',
        {
          currentPassword: oldPass,
          password: newPass,
          passwordConfirmation: newPass,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleSuccess();
      event.target.reset();
    } catch (e) {
      if (e.response.status === 401) {
        setShowPasswordModal(true)
      }
      handleError(e.message);
    }
  }
  async function handleUpload(file) {

    try {
      setIsLoading(true);
      const response = await server.post(`/upload`, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${Cookies.get('userToken')}`,
        },
      });

      const uploadedFile = response.data[0];
      console.log(response.data);
      setAvatarUrl(`${NEXT_STRAPI_BASED_URL}${uploadedFile.url}`);
      updateStrapiData({
        ...user,
        imgLink: `${NEXT_STRAPI_BASED_URL}${uploadedFile.url}`,
        avatarId: uploadedFile.id,
      });
      setUser({
        ...user,
        imgLink: `${NEXT_STRAPI_BASED_URL}${uploadedFile.url}`,
        avatarId: uploadedFile.id,
      });
      setAvatarModalVisible(false)

    } catch (error) {
      if (error.response.status === 401) {
        return setShowPasswordModal(true)
      }
      setAvatarModalVisible(false)

      console.error('Error uploading image: ', error);
    } finally {
      setAvatarModalVisible(false)
      setIsLoading(false);
    }
  }
  async function sendActivationMessage() {
    const sendMessage = server.post("/auth/send-email-confirmation", {
      email: user.email
    })
    setActivationModalVisible(true);
    setTimeout(() => {
      setActivationModalVisible(false);
    }, 3000);
  }
  function handleSuccess() {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  }
  function handleError(message?: string) {
    message ? setMessage(message) : setMessage($t[locale].auth.error.invalid_pass);

    setIsError(true);
    setTimeout(() => {
      setIsError(false);
    }, 3000);
  }
  function onChange(obj: object) {
    if (!user.confirmed) {
      return setShowtMessageModal(true)
    }
    setUser(obj);
    Cookies.set("user", JSON.stringify(obj))
    setIsDisabled(false);
  }




  return (
    <>
      <Head>
        <title>Profile</title>
        <meta name="description" content="Profile" />
        <meta name="keywords" content="Profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
        defer
      ></Script>
      <div className="container-xxl bg-white p-0">
        <main className="container-xxl position-relative p-0">
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
              <div className="container-xxl position-relative p-0">
                <div className="container-xxl py-5 bg-primary hero-header mb-5">
                  <div className="container mb-5 mt-5 py-2 px-lg-5 mt-md-1 mt-sm-1 mt-xs-0 mt-lg-5">
                    <div className="row g-5 pt-1">
                      <div
                        className="col-12 text-center text-md-start"
                        style={{ marginTop: '40px', marginBottom: '50px' }}
                      >
                        <h1 className="display-4 text-white animated slideInLeft">
                          {$t[locale].auth.profile.profile}
                        </h1>
                        <nav aria-label="breadcrumb">
                          <ol className="breadcrumb justify-content-center justify-content-md-start animated slideInLeft">
                            <li className="breadcrumb-item">
                              <a className="text-white" href="#">
                                {$t[locale].menu.main}
                              </a>
                            </li>
                            <li className="breadcrumb-item">
                              <a className="text-white" href="#">
                                {$t[locale].auth.profile.profile}

                              </a>
                            </li>
                          </ol>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                {$t[locale].auth.success.change_message}
              </div>
              <NotConfirmedModal
                message={$t[locale].auth.notConfirmedMessage}
                isVisible={isShowMessageModal}
                sendMessage={sendActivationMessage}
                onClose={() => {
                  setShowtMessageModal(false)
                }}
              />
              <MailModal
                message={$t[locale].auth.successConfirmationMessage}
                isVisible={modalActivationIsVisible}
                onClose={() => {
                  setActivationModalVisible(false)
                }}
              />
              <PasswordModal
                message={"Confirm your password"}
                isVisible={isShowPasswordModal}
                description='For your security, please confirm your password.'
                onClose={() => {
                  logout()
                  setShowPasswordModal(false)
                }}
                onSubmit={(e) => updateJWT(e)}
              />
              <ConfirmModal
                message={$t[locale].auth.confirm_text}
                isVisible={modalIsVisible}
                onClose={() => {
                  setModalVisible(false)
                }}
                onSubmit={changeData}
              />
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

              <div
                className="container"
                style={login ? { display: 'block' } : { display: 'none' }}
              >
                <Tabs>
                  <TabList className="nav nav-tabs mb-5">
                    <Tab key="1" className="nav-link ">
                      <span className="d-none d-md-block">
                        <i className="bi-person me-2"></i>{$t[locale].auth.profile.profile}
                      </span>
                      <span className="d-block d-md-none">
                        <i className="bi-person"></i>
                      </span>
                    </Tab>
                    <Tab key="3" className="nav-link ">
                      <span className="d-none d-md-block">
                        <i className="bi-mailbox me-2"></i>{$t[locale].auth.profile.change_profile}
                      </span>
                      <span className="d-block d-md-none">
                        <i className="bi-mailbox"></i>
                      </span>
                    </Tab>
                    <Tab key="2" className="nav-link ">
                      <span className="d-none d-md-block">
                        <i className="bi-lock me-2"></i>{$t[locale].auth.profile.change_pass}
                      </span>
                      <span className="d-block d-md-none">
                        <i className="bi-lock"></i>
                      </span>
                    </Tab>

                  </TabList>

                  <TabPanel>
                    <div className="card mb-4">
                      <div
                        style={{ justifyContent: 'space-between' }}
                        className="card-body position-relative  d-block d-md-flex align-items-center"
                      >
                        <div className="position-absolute p-2 top-0 start-0">
                          <label
                            type="button"
                            onClick={() => {
                              if (!user.confirmed) {
                                return setShowtMessageModal(true)
                              }
                              setAvatarModalVisible(true)
                            }}
                            title="Додати фото"
                            className="btn btn-success btn-sm px-1 py-0"
                          >
                            <i className="bi bi-upload"></i>
                          </label>
                          {isLoading && (
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            ></div>
                          )}
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <div className="flex-shrink-0">
                            <img
                              src={avatarUrl}
                              width="80"
                              className="rounded"
                              alt="Avatar"
                            />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h5>{user.real_user_name}</h5>
                            <p className="mb-0">{user.email}</p>
                          </div>

                        </div>
                        {!user.confirmed &&
                          <div className='d-flex flex-column  justify-content-center gap-0'>
                            <span className='text reply-button d-flex justify-content-center'>{$t[locale].auth.profile.notConfirmed}</span>
                            <button onClick={() => setShowtMessageModal(true)} className='btn btn-primary m-2 d-inline-block'>{$t[locale].auth.activationBtnText}</button>
                          </div>
                        }

                        <button
                          className="btn-danger btn ml-4"
                          onClick={logout}
                        >
                          {$t[locale].auth.profile.exit}
                        </button>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setModalVisible(true)
                      }}
                      className="col-12 col-md-8 col-lg-5"
                    >
                      <div className="card mb-4">
                        <div className="card-body position-relative">
                          <div className="position-absolute p-2 top-0 start-0">
                            <label onClick={() => {
                              if (!user.confirmed) {
                                return setShowtMessageModal(true)
                              }
                              setAvatarModalVisible(true)
                            }}
                              type="button"
                              title="Додати фото"
                              className="btn btn-success btn-sm px-1 py-0"
                            >
                              <i className="bi bi-upload"></i>
                            </label>
                            {isLoading && (
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              ></div>
                            )}
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <img
                                src={avatarUrl}
                                width="80"
                                className="rounded"
                                alt="Avatar"
                              />
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h5>{user.real_user_name}</h5>
                              <p className="mb-0">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <label htmlFor="full_name" className="form-label">
                        {$t[locale].auth.name}:
                      </label>
                      <div className="row g-1 mb-3">
                        <div className="col-12">
                          <div className="col-12 col-lg-9">
                            <div id="full_name" className="input-group">
                              <input
                                id="firstname"
                                type="text"
                                name="firstname"
                                className="form-control"
                                onChange={e =>
                                  onChange({
                                    ...user,
                                    real_user_name: e.target.value,
                                  })
                                }
                                value={user.real_user_name}
                                placeholder="Ім&#039;я"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row g-1 mb-3">
                        <div className="col-12">
                          <div className="col-12 col-lg-9">
                            <label htmlFor="email" className="form-label">
                              Email:
                            </label>
                            <input
                              id="email"
                              type="email"
                              name="email"
                              onChange={e =>
                                onChange({ ...user, email: e.target.value })
                              }
                              value={user.email}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-1 mb-3">
                        <div className="col-12">
                          <div className="col-12 col-lg-9">
                            <label htmlFor="birthday" className="form-label">
                              {$t[locale].auth.profile.birthday}:
                            </label>
                            <input
                              type="date"
                              name="birthday"
                              id="birthday"
                              onChange={e => {
                                onChange({ ...user, birthday: e.target.value })
                                console.log(e.target.value)
                              }
                              }
                              value={defaultBirthday}
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="flexSwitchCheckChecked"
                          onChange={e => {
                            onChange({
                              ...user,
                              sendMessage: !user.sendMessage,
                            });
                          }}
                          checked={user.sendMessage}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexSwitchCheckChecked"
                        >
                          {$t[locale].auth.profile.get_notification}
                        </label>
                      </div>
                      <div className="mb-3 pt-4 ">
                        <button
                          disabled={isDisabled}
                          type="submit"
                          className="btn btn-success"
                          style={{ marginRight: 15 }}
                        >
                          {$t[locale].auth.saveChanges}
                        </button>
                        <button
                          type='button'
                          className="btn-danger btn ml-4"
                          onClick={logout}
                        >
                          {$t[locale].auth.profile.exit}
                        </button>
                      </div>
                    </form>
                  </TabPanel>
                  <TabPanel>
                    <form
                      onSubmit={changePass}
                      className="col-12 col-md-8 col-lg-5"
                    >
                      <div className="row g-1 mb-3">
                        <div className="col-12">
                          <div className="col-12 col-lg-9">
                            <label htmlFor="oldPass" className="form-label">
                              {$t[locale].auth.profile.old_pass}
                            </label>
                            <input
                              id="oldPass"
                              type="password"
                              name="oldPass"
                              className="form-control"
                              required
                              onChange={
                                (e) => {
                                  if (!user.confirmed) {
                                    e.target.value = "";
                                    return setShowtMessageModal(true)
                                  }
                                }
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row g-1 mb-3">
                        <div className="col-12">
                          <div className="col-12 col-lg-9">
                            <label htmlFor="newPass" className="form-label">
                              {$t[locale].auth.profile.new_pass}
                            </label>
                            <input
                              id="newPass"
                              type="password"
                              name="newPass"
                              className="form-control"
                              required
                              onChange={
                                (e) => {
                                  if (!user.confirmed) {
                                    e.target.value = "";
                                    return setShowtMessageModal(true)
                                  }
                                }
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 pt-4">
                        <button type="submit" className="btn btn-success">
                          {$t[locale].auth.profile.change_pass}
                        </button>
                      </div>
                    </form>
                  </TabPanel>

                </Tabs>
              </div>

              <div
                className="container"
                style={login ? { display: 'none' } : { display: 'block' }}
              >
                <Link className="btn btn-primary" href="/login">
                  {$t[locale].auth.header_button_name}
                </Link>
              </div>
              <ImgEditor onClose={() => { setAvatarModalVisible(false) }} isShow={avatarModalVisible} handleUpload={handleUpload} />
            </DefaultLayout>
          </DefaultLayoutContext.Provider>
        </main>
      </div>
    </>
  );
}
export async function getServerSideProps({ query, locale }: Query) {
  const { q } = query;

  try {
    const serverPages = await server.get(
      `/pages?filters[$or][0][seo_title][$containsi]=${q}&filters[$or][1][seo_description][$containsi]=${q}&filters[$or][2][body][$containsi]=${q}&locale=${locale === 'ua' ? 'uk' : locale
      }`
    );
    const serverSeoPages = await server.get(
      `/page-seos?filters[$or][0][seo_title][$containsi]=${q}&filters[$or][1][seo_description][$containsi]=${q}&filters[$or][2][seo_description][$containsi]=${q}&locale=${locale === 'ua' ? 'uk' : locale
      }`
    );
    const pages = serverPages.data.data;
    const seoPages = serverSeoPages.data.data;

    const strapiLocale = locale === 'ua' ? 'uk' : locale;

    const { menu, allPages, footerMenus, footerGeneral } =
      await getHeaderFooterMenus(strapiLocale);

    const socialRes = await server.get('/social');
    const socialData = socialRes.data.data.attributes;

    return {
      props: {
        pages: [...pages, ...seoPages],
        menu,
        allPages,
        footerMenus,
        footerGeneral,
        socialData: socialData ?? null,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        notFound: true,
        pages: [],
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
