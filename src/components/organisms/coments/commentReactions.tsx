// @ts-nocheck
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { NEXT_STRAPI_API_URL } from '@/http/index';
import { IComentReaction, IReaction } from '@/types/commentReactions';
import getConfig from 'next/config';
import $t from '@/locale/global';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LikeSvgIcon from '@/img/userLikeIcon.svg';
import DisLikeSvgIcon from '@/img/userDisLikeIcon.svg';
import Image from 'next/image';

export interface IComentData {
  comentID: number;
  userIp: string;
  pageUrl: string;
}

const CommentReactions = ({
  comments,
  commentData,
  reactions = [],
  globalUserIp = '',
}: IComentReaction) => {
  const [comment, setComments] = useState(comments);
  const [isLike, setLike] = useState(false);
  const [isDislike, setDislike] = useState(false);
  const [likeReaction, setLikeReaction] = useState(
    reactions.filter(element => element.action === 'like')
  );
  const [disLikeReaction, setDisLikeReaction] = useState(
    reactions.filter(element => element.action === 'dislike')
  );
  const [likeCount, setLikeCount] = useState(
    likeReaction.length + +comment.attributes.admin_like
  );
  const [dislikeCount, setDislikeCount] = useState(
    disLikeReaction.length + +comment.attributes.admin_dislike
  );
  const [userCookieUserData, setCookieUserData] = useState(Cookies.get('user'));
  const userData = userCookieUserData ? JSON.parse(userCookieUserData) : null;
  const router = useRouter();

  const locale = router.locale === 'ua' ? 'uk' : router.locale || 'ru';

  const { publicRuntimeConfig } = getConfig();
  const { NEXT_USER_DEFAULT_URL, NEXT_STRAPI_BASED_URL, NEXT_FRONT_URL } =
    publicRuntimeConfig;

  const [anonimusLike, setAnonimusLike] = useState(
    likeReaction.filter(reaction => {
      if (reaction.real_user_name == '-' && reaction.user_email === '-') {
        return reaction;
      }
    }).length + +comment.attributes.admin_like
  );
  const [anonimusDisLike, setAnonimusDisLike] = useState(
    disLikeReaction.filter(reaction => {
      if (reaction.real_user_name == '-' && reaction.user_email === '-') {
        return reaction;
      }
    }).length + +comment.attributes.admin_like
  );

  const shortText = text => {
    return text.length > 12 ? `${text.slice(0, 12)}...` : text;
  };

  const getUserEmailForIf = userData?.email ? userData?.email : '-';

  useEffect(() => {
    const myIp = reactions.filter(element => {
      if (
        element.user_email === getUserEmailForIf &&
        element.ip_address == globalUserIp
      ) {
        return element;
      }
    });
    if (
      myIp[0]?.user_email === getUserEmailForIf &&
      myIp[0]?.user_email !== '-'
    ) {
      if (myIp[0]?.action == 'like') {
        setLike(true);
        setDislike(false);
      } else if (myIp[0]?.action == 'dislike') {
        setLike(false);
        setDislike(true);
      }
    } else if (globalUserIp == myIp[0]?.ip_address) {
      if (myIp[0]?.action == 'like') {
        setLike(true);
        setDislike(false);
      } else if (myIp[0]?.action == 'dislike') {
        setLike(false);
        setDislike(true);
      }
    }
  }, [globalUserIp]);

  useEffect(() => {
    setAnonimusLike(
      likeReaction.filter(reaction => {
        if (reaction.real_user_name == '-' && reaction.user_email === '-') {
          return reaction;
        }
      }).length + +comment.attributes.admin_like
    );
    setAnonimusDisLike(
      disLikeReaction.filter(reaction => {
        if (reaction.real_user_name == '-' && reaction.user_email === '-') {
          return reaction;
        }
      }).length + +comment.attributes.admin_dislike
    );
  }, [disLikeReaction, likeReaction, comment]);

  const updateCommentReaction = async (
    commentData: IComentData,
    action: string
  ) => {
    try {
      const userToken = Cookies.get('userToken');
      if (userToken) {
        let updateComment = await axios.post(
          `${NEXT_STRAPI_BASED_URL}/custom-comment-fields/comment-actions`,
          {
            page_url: commentData.pageUrl,
            ip_address: commentData.userIp,
            comment_id: commentData.comentID,
            user_email: getUserEmailForIf,
            username: userData?.username,
            action,
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        return updateComment;
      } else {
        let updateComment = await axios.post(
          `${NEXT_STRAPI_BASED_URL}/custom-comment-fields/comment-actions`,
          {
            page_url: commentData.pageUrl,
            ip_address: commentData.userIp,
            comment_id: commentData.comentID,
            user_email: getUserEmailForIf,
            action,
          }
        );
        return updateComment;
      }
    } catch (e) {
      console.log(e);
      return 400;
    }
  };

  const onClick = async (e: any) => {
    const buttonType = e.currentTarget.getAttribute('data-type');
    if (buttonType === 'like') {
      setLike(!isLike);
      setDislike(false);
      setLikeCount(prev => (isLike ? prev - 1 : prev + 1));
      if (isDislike) {
        setDislikeCount(dislikeCount => dislikeCount - 1);
      }
      const fetchStatus = await updateCommentReaction(commentData, 'like');
      console.log(fetchStatus, 'fetch status');
      if (fetchStatus.status == 201) {
        console.log('status 2001');
        setLikeReaction(prev => {
          return [
            ...prev,
            {
              page_url: commentData.pageUrl,
              user_email: getUserEmailForIf,
              username: userData?.username ? userData?.username : '-',
              ip_address: commentData.userIp,
              real_user_name: userData?.real_user_name
                ? userData.real_user_name
                : '-',
              user_image: fetchStatus?.data?.user?.user_image
                ? fetchStatus?.data?.user?.user_image
                : NEXT_USER_DEFAULT_URL,
              comment_id: commentData.comentID,
              action: 'like',
            },
          ];
        });
        setDisLikeReaction(prev => {
          return prev.filter(
            element =>
              element.ip_address !== commentData.userIp ||
              element.user_email !== getUserEmailForIf
          );
        });
      } else if (fetchStatus.status == 200) {
        setLikeReaction(prev => {
          return prev.filter(
            element =>
              element.ip_address !== commentData.userIp ||
              element.user_email !== getUserEmailForIf
          );
        });
      }
    } else if (buttonType === 'dislike') {
      setDislike(!isDislike);
      setLike(false);
      setDislikeCount(dislikeCount =>
        isDislike ? dislikeCount - 1 : dislikeCount + 1
      );
      if (isLike) {
        setLikeCount(likeCount => likeCount - 1);
      }
      console.log('status 2002');

      const fetchStatus = await updateCommentReaction(commentData, 'dislike');
      console.log(fetchStatus, 'fetch status');

      if (fetchStatus.status == 201) {
        console.log('status 2001');

        setDisLikeReaction(prev => {
          return [
            ...prev,
            {
              action: 'dislike',
              comment_id: commentData.comentID,
              page_url: commentData.pageUrl,
              ip_address: commentData.userIp,
              user_email: getUserEmailForIf,
              real_user_name: userData?.real_user_name
                ? userData.real_user_name
                : '-',
              username: userData?.username ? userData.username : '-',
              user_image: fetchStatus?.data?.user?.user_image
                ? fetchStatus?.data?.user?.user_image
                : NEXT_USER_DEFAULT_URL,
            },
          ];
        });
        setLikeReaction(prev => {
          return prev.filter(
            element =>
              element.ip_address !== commentData.userIp ||
              element.user_email !== getUserEmailForIf
          );
        });
      } else if (fetchStatus.status == 200) {
        setDisLikeReaction(prev => {
          return prev.filter(element => {
            return (
              element.ip_address !== commentData.userIp ||
              element.user_email !== getUserEmailForIf
            );
          });
        });
      }
    }
  };

  return (
    <>
      <div
        className="comment-footer_menu_reaction_block_button"
        itemProp="interactionStatistic"
        itemType="https://schema.org/InteractionCounter"
        itemScope
      >
        <button
          itemProp="interactionType"
          content="https://schema.org/LikeAction"
          name="like button"
          data-type="like"
          onClick={e => onClick(e)}
          className={
            isLike
              ? 'comment-footer_menu_reaction_button active'
              : 'comment-footer_menu_reaction_button'
          }
        >
          {/* <picture>
                        <Image 
                        src={isActive ? '/img/userLikeIcon-active.svg' : '/img/userLikeIcon-default.svg'}
                        alt="" width={16} height={16} />
                    </picture> */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 25 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.1993 9.91633C23.6708 9.20922 22.8945 8.74714 22.0134 8.61537C21.8377 8.58907 21.658 8.57698 21.4809 8.57825H15.9455V5.01388C15.9455 2.57119 13.9289 0.583984 11.4501 0.583984C11.0476 0.583984 10.6828 0.817571 10.5194 1.18006L5.88366 11.4585C5.82579 11.5868 5.7959 11.7257 5.7959 11.8661V24.4287C5.7959 24.9831 6.25195 25.4324 6.81448 25.4324H19.8816C19.8922 25.4325 19.9027 25.4326 19.9133 25.4326C20.7046 25.4326 21.4706 25.1554 22.0741 24.6499C22.6873 24.1363 23.0914 23.4217 23.2118 22.6393L24.8113 12.3594C24.9451 11.4912 24.7277 10.6235 24.1993 9.91633ZM22.7975 12.0567L21.1979 22.3367C21.1021 22.9595 20.5512 23.425 19.9133 23.425C19.9085 23.425 19.9035 23.425 19.8987 23.4249C19.8948 23.4249 19.891 23.4249 19.8872 23.4249H7.83311V12.0792L12.0763 2.67112C13.1295 2.94465 13.9083 3.89128 13.9083 5.01388V9.58209C13.9083 10.1364 14.3643 10.5858 14.9269 10.5858H21.4864C21.4902 10.5858 21.4941 10.5858 21.4979 10.5858C21.5678 10.5852 21.6384 10.5899 21.7077 10.6002C22.0508 10.6515 22.3531 10.8315 22.5589 11.1068C22.7647 11.3822 22.8493 11.72 22.7975 12.0567Z"
              fill="#2a2e2e"
            />
            <path
              d="M6.81324 23.4258H3.33647C2.62008 23.4258 2.03721 22.8514 2.03721 22.1454V14.1511C2.03721 13.4451 2.62008 12.8708 3.33647 12.8708H6.81324C7.37577 12.8708 7.83182 12.4214 7.83182 11.867C7.83182 11.3127 7.37577 10.8633 6.81324 10.8633H3.33647C1.49675 10.8633 0 12.3382 0 14.1512V22.1455C0 23.9584 1.49675 25.4333 3.33647 25.4333H6.81324C7.37582 25.4333 7.83182 24.984 7.83182 24.4296C7.83182 23.8751 7.37577 23.4258 6.81324 23.4258Z"
              fill="#2a2e2e"
            />
          </svg>
          <span itemProp="userInteractionCount">{likeCount}</span>
        </button>
        {likeCount > 0 && (
          <div className="comment-footer_menu_reaction_block">
            <div
              className="comment-footer_menu_reaction_scroll_block"
              style={{ overflowY: 'auto', maxHeight: 300, paddingBottom: 5 }}
            >
              <ul className="comment-footer_menu_reaction_list">
                {likeReaction.map((reaction, index) => {
                  if (reaction.real_user_name !== '-') {
                    return (
                      <li
                        itemProp="author"
                        itemScope
                        itemType="https://schema.org/Person"
                        key={index}
                        className="comment-footer_menu_reaction_user "
                        data-action="profile"
                        data-username="disqus_tQqF4HKdSD"
                      >
                        <div
                          className="comment-footer_menu_reaction_img "
                          style={{
                            backgroundImage: `url(${
                              NEXT_STRAPI_BASED_URL + reaction.user_image
                            })`,
                          }}
                        ></div>
                        <link
                          itemProp="url"
                          href={`${NEXT_FRONT_URL}/user/${reaction?.username}`}
                        />
                        <Link href={`/user/${reaction?.username}`}>
                          <h3
                            itemProp="name"
                            className="comment-footer_menu_reaction_user_name"
                          >
                            {shortText(reaction.real_user_name)}
                          </h3>
                        </Link>
                      </li>
                    );
                  }
                })}
                {anonimusLike > 0 && (
                  <li
                    className="comment-footer_menu_reaction_user "
                    data-action="profile"
                    data-username="disqus_tQqF4HKdSD"
                  >
                    <div
                      className="comment-footer_menu_reaction_img "
                      style={{
                        backgroundImage: `url(${NEXT_USER_DEFAULT_URL})`,
                      }}
                    ></div>
                    <h3 className="comment-footer_menu_reaction_user_name">
                      {shortText(
                        `${anonimusLike} - ${$t[locale].blog.blog_guests}`
                      )}
                    </h3>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div
        itemProp="interactionStatistic"
        itemType="https://schema.org/InteractionCounter"
        itemScope
        className="comment-footer_menu_reaction_block_button"
      >
        <button
          itemProp="interactionType"
          content="https://schema.org/DislikeAction"
          name="dislike button"
          data-type="dislike"
          onClick={e => onClick(e)}
          className={
            isDislike
              ? 'comment-footer_menu_reaction_button active'
              : 'comment-footer_menu_reaction_button'
          }
        >
          {/* <picture>
                        <Image src="/img/userDisLikeIcon.svg" alt="" width={16} height={16} />
                    </picture> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M1.14743 16.0153C1.67593 16.7224 2.4522 17.1845 3.33328 17.3163C3.509 17.3426 3.68871 17.3547 3.86576 17.3534L9.40117 17.3534L9.40117 20.9178C9.40117 23.3604 11.4178 25.3477 13.8965 25.3477C14.299 25.3477 14.6638 25.1141 14.8273 24.7516L19.463 14.4732C19.5209 14.3448 19.5508 14.206 19.5508 14.0655L19.5508 1.50294C19.5508 0.948557 19.0947 0.499195 18.5322 0.499195L5.46509 0.499194C5.45451 0.499097 5.44397 0.499049 5.43343 0.499049C4.64208 0.499049 3.87606 0.776217 3.27255 1.28178C2.65939 1.7953 2.25525 2.50994 2.13489 3.29233L0.535356 13.5722C0.401593 14.4405 0.618979 15.3081 1.14743 16.0153ZM2.54922 13.875L4.14875 3.59493C4.24459 2.97212 4.79545 2.50659 5.43343 2.50659C5.4382 2.50659 5.44323 2.50659 5.44801 2.50669C5.45185 2.50669 5.45564 2.50674 5.45948 2.50674L17.5136 2.50674L17.5136 13.8525L13.2704 23.2605C12.2172 22.987 11.4383 22.0404 11.4383 20.9178L11.4383 16.3495C11.4383 15.7952 10.9823 15.3458 10.4198 15.3458L3.8603 15.3458C3.85645 15.3458 3.85261 15.3458 3.84877 15.3458C3.77888 15.3465 3.70826 15.3418 3.63902 15.3314C3.29589 15.2801 2.9936 15.1002 2.78779 14.8248C2.58197 14.5494 2.49736 14.2116 2.54922 13.875Z"
              fill="#2a2e2e"
            />
            <path
              d="M18.5334 2.50588L22.0102 2.50588C22.7266 2.50588 23.3095 3.08026 23.3095 3.78622L23.3095 11.7805C23.3095 12.4865 22.7266 13.0609 22.0102 13.0609L18.5334 13.0609C17.9709 13.0609 17.5149 13.5103 17.5149 14.0646C17.5149 14.6189 17.9709 15.0684 18.5334 15.0684L22.0102 15.0684C23.8499 15.0684 25.3467 13.5934 25.3467 11.7805L25.3467 3.78617C25.3467 1.97324 23.8499 0.498291 22.0102 0.498291L18.5334 0.49829C17.9709 0.49829 17.5149 0.947653 17.5149 1.50204C17.5149 2.05652 17.9709 2.50588 18.5334 2.50588Z"
              fill="#2a2e2e"
            />
          </svg>
          <span itemProp="userInteractionCount">{dislikeCount}</span>
        </button>
        {dislikeCount > 0 && (
          <div className="comment-footer_menu_reaction_block">
            <div
              className="comment-footer_menu_reaction_scroll_block"
              style={{ overflowY: 'auto', maxHeight: 300, paddingBottom: 5 }}
            >
              <ul className="comment-footer_menu_reaction_list">
                {disLikeReaction.map((reaction, index) => {
                  if (reaction.real_user_name !== '-') {
                    return (
                      <li
                        itemProp="author"
                        itemScope
                        itemType="https://schema.org/Person"
                        key={index}
                        className="comment-footer_menu_reaction_user "
                        data-action="profile"
                        data-username="disqus_tQqF4HKdSD"
                      >
                        <div
                          className="comment-footer_menu_reaction_img "
                          style={{
                            backgroundImage: `url(${NEXT_STRAPI_BASED_URL}${reaction.user_image})`,
                          }}
                        ></div>
                        <link
                          itemProp="url"
                          href={`${NEXT_FRONT_URL}/user/${reaction?.username}`}
                        />
                        <Link href={`/user/${reaction?.username}`}>
                          <h3
                            itemProp="name"
                            className="comment-footer_menu_reaction_user_name"
                          >
                            {shortText(reaction.real_user_name)}
                          </h3>
                        </Link>
                      </li>
                    );
                  }
                })}
                {anonimusDisLike > 0 && (
                  <li
                    className="comment-footer_menu_reaction_user "
                    data-action="profile"
                    data-username="disqus_tQqF4HKdSD"
                  >
                    <div
                      className="comment-footer_menu_reaction_img "
                      style={{
                        backgroundImage: `url(${NEXT_USER_DEFAULT_URL})`,
                      }}
                    ></div>
                    <h3 className="comment-footer_menu_reaction_user_name">
                      {' '}
                      {shortText(
                        `${anonimusDisLike} - ${$t[locale].blog.blog_guests}`
                      )}
                    </h3>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CommentReactions;
