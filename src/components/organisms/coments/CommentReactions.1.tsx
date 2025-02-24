// @ts-nocheck
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { IComentReaction } from '@/types/commentReactions';
import getConfig from 'next/config';
import $t from '@/locale/global';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LikeSvgIcon from '@/img/userLikeIcon.svg';
import DisLikeSvgIcon from '@/img/userDisLikeIcon.svg';
import { IComentData } from './commentReactions';

export const CommentReactions = ({
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
          <picture>
            <img src="@img/userDisLikeIcon.svg" alt="" />
            <LikeSvgIcon width={16} height={16} />
          </picture>
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
          <picture>
            <DisLikeSvgIcon width={16} height={16} />
          </picture>
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
