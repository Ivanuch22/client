// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import formatDateTime from "@/utils/formateDateTime";
import TextArea from "./textArea";
import UpdateCommentTextArea from "./updateComment";
import ModalConfirm from '@/components/organisms/ModalConfirm';
import getConfig from 'next/config';

import $t from '@/locale/global';
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import CommentReactions from './commentReactions';
import Image from "next/image";
import Link from "next/link";

interface IComentData {
    comentID: number;
    userIp: string;
    pageUrl: string
}
const Comments = ({ blogImage, articleStrapi, seo_title, admin_date, pageUrl, globalUserIp, data, sendMessage, onDelete, updateComment, saveDraftComment, saveChanginDraftComment }) => {
    const [comments, setComments] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [User, setUser] = useState({ id: 0 });
    const [isShowConfirmModal, setShowConfirmModal] = useState(false);
    const [form, setForm] = useState(null)

    const { publicRuntimeConfig } = getConfig();
    const { NEXT_STRAPI_BASED_URL, NEXT_FRONT_URL } = publicRuntimeConfig;



    useEffect(() => {
        let getUserCookies = Cookies.get('user');
        if (getUserCookies) {
            setUser(JSON.parse(getUserCookies));
        }
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000);
        return () => clearInterval(interval);
    }, []);
    const [showedComent, setShowedComment] = useState(3);
    const [isButtonLoading, setIsButtonLoading] = useState(false)
    const commentCoutn = comments.length;


    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : router.locale;

    useEffect(() => {
        function transformCommentsData(data) {
            const commentMap = new Map(); // To store comments by ID
            const newArr = []; // To store the final transformed array

            data.forEach(comment => {
                const commentId = comment.id;
                commentMap.set(commentId, comment);
            });

            data.forEach(comment => {
                const fatherId = comment.attributes.father.data?.id;

                if (fatherId === undefined) {
                    newArr.push(comment);
                }
            });
            const reversednewArr = newArr.reverse();
            data.forEach(comment => {
                const fatherId = comment.attributes.father.data?.id;

                if (fatherId !== undefined) {
                    const fatherIndex = reversednewArr.findIndex(c => c.id === fatherId);
                    if (fatherIndex !== -1) {
                        reversednewArr.splice(fatherIndex + 1, 0, comment);
                    }
                }
            });
            return newArr;
        }
        setComments(transformCommentsData(data));
    }, [data]);

    const toggleReplyArea = (commentId) => {
        setReplyToCommentId(prevId => prevId === commentId ? null : commentId);
    };
    const toggleChangeArea = (commentId) => {
        setEditingCommentId(prevId => prevId === commentId ? null : commentId);
    };
    const onUpdate = (e, commentId) => {
        updateComment(e, commentId);
        setEditingCommentId(null);
    }

    const onSubmit = (e, fatherId) => {
        sendMessage(e, fatherId)
        toggleReplyArea(fatherId)
    }


    const showMoreComments = () => {
        setIsButtonLoading(true)
        setTimeout(() => {
            setShowedComment(commentCoutn)
            setIsButtonLoading(false)
        }, 300);
    }
    function replaceText(text) {
        if (text.includes("count")) {
            const newText = text.replace("count", (commentCoutn - showedComent))

            return newText.slice(0, -1);
        } else {

            return text;
        }
    }
    function sanitizeImageUrl(url) {
        return url.replace(/[^a-zA-Z0-9-_.~:/?#[\]@!$&'()*+,;=%]/g, '');
    }
    const nowDate = new Date().toDateString()
    return (
        <>
            <section>


                <div className="comments-tree">
                    <header className="comments-header">
                        <h4> {comments.length} {$t[locale].comment.comments}</h4>
                    </header>
                    <section>
                        <h3 className="notShowOnPage">{$t[locale].comment.placeholder}</h3>
                        <TextArea
                            saveDraft={saveDraftComment}
                            sendMessage={sendMessage} />
                    </section>

                </div>
                <aside>
                    <ModalConfirm
                        message={$t[locale].auth.confirm_text}
                        isVisible={isShowConfirmModal}
                        onClose={() => {
                            setShowConfirmModal(false)
                        }}
                        onSubmit={() => {
                            onUpdate(form, editingCommentId)
                            setShowConfirmModal(false)
                        }}
                    />
                </aside>
            </section >

            <section itemScope itemType="https://schema.org/DiscussionForumPosting">
                {articleStrapi&&(
                    <p className="notShowOnPage" itemProp="text">
                    {articleStrapi?.commentText}
                </p>
                )}
                
                {articleStrapi?.images.data.map((image) => {
                    return (
                        <Image loading="lazy"  className="notShowOnPage" width={10} height={10} itemProp="image" src={`${sanitizeImageUrl(NEXT_STRAPI_BASED_URL + image?.attributes.url)}`} alt={image?.attributes?.alternativeText|| "alt text"} key={image.id} />
                    )
                })}
                <h3 itemProp="headline" className="notShowOnPage">{$t[locale].comment.comments}</h3>
                <link itemProp="url" href={NEXT_FRONT_URL + pageUrl + "#comment"} />
                <meta itemProp="datePublished" content={admin_date || nowDate} />
                {articleStrapi && (
                    <>
                        <div
                            className="notShowOnPage"
                            itemProp="author" itemType="https://schema.org/Person" itemScope>
                            <span itemProp="name">{articleStrapi?.author?.data?.attributes?.real_user_name}</span>
                            {articleStrapi?.images.data.map((image) => {
                                return (
                                    <Image loading="lazy"  width={10} height={10} itemProp="image" src={`${sanitizeImageUrl(NEXT_STRAPI_BASED_URL + image?.attributes.url)}`} alt={image?.attributes?.alternativeText|| "alt text"} key={image.id} />
                                )
                            })}
                            <link itemProp="url" href={`${NEXT_FRONT_URL}/user/${articleStrapi?.author?.data?.attributes?.username}`} />
                        </div>

                    </>
                )}


                {comments.map((comment, index) => {
                    const commentId = comment?.id;
                    const {
                        Text,
                        admin_date,
                        father,
                        children,
                        user,
                        createdAt,
                        user_img,
                        user_name: real_user_name,
                    } = comment.attributes;

                    const { url } = user_img?.data?.attributes || {
                        url: `/uploads/avatardefaul_8e448093cc.png`,
                    };

                    const timeDifference = (currentTime - new Date(createdAt).getTime()) / (1000 * 60); // Різниця у хвилинах

                    const findFatherName = () => {
                        const name = comments.find((element) => {
                            return element.attributes.Text === father.data?.attributes.Text;
                        });
                        return name?.attributes?.user?.data?.attributes?.real_user_name;
                    };

                    const getCommentClass = (fatherData) => {
                        if (!fatherData) {
                            return "";
                        }
                        const grandFatherData = comments.find(
                            (element) => element.id === fatherData.id
                        )?.attributes.father.data;

                        if (!grandFatherData) {
                            return "post-children";
                        } else {
                            return "post-children-2";
                        }
                    };
                    const commentData: IComentData = {
                        userIp: globalUserIp,
                        comentID: commentId,
                        pageUrl: pageUrl
                    }
                    return (
                        <article
                            className={showedComent >= (index + 1) ? `${getCommentClass(father.data)} block` : `${getCommentClass(father.data)} none`}
                            id={`comment-id-${commentId}`}
                            key={commentId}
                            itemProp="comment"
                            itemScope
                            itemType="https://schema.org/Comment"
                        >
                            <link itemProp="url" href={`#comment-id-${commentId}`} />
                            <div className="post-content">
                                <div data-action="profile" className="user avatar">
                                    <Image loading="lazy" 
                                        src={`${NEXT_STRAPI_BASED_URL}${url}`}
                                        alt={`Аватар ${real_user_name}`}
                                        className="image-refresh"
                                        width="35"
                                        height="35"
                                    />
                                </div>
                                <div className="post-body">
                                    <header className="comment__header">
                                        <span
                                            itemProp="author"
                                            itemScope
                                            itemType="https://schema.org/Person">
                                            <link itemProp="url" href={`${NEXT_FRONT_URL}/user/${user.data.attributes.username}`} />
                                            <Link href={`/user/${user.data.attributes.username}`}>
                                                <span
                                                    itemProp="name"
                                                    className="author publisher-anchor-color">
                                                    {real_user_name}
                                                    {father.data !== null ? (
                                                        <span
                                                            style={{ color: "#494e58", fontSize: 12 }}
                                                            className="parent-link-container"
                                                        >
                                                            <Image loading="lazy" 
                                                                style={{ margin: "0 12px 0 10px" }}
                                                                width={15}
                                                                height={15}
                                                                src="https://cdn-icons-png.flaticon.com/512/591/591866.png"
                                                                alt="User icon"
                                                            />
                                                            {findFatherName()}
                                                        </span>
                                                    ) : (
                                                        ""
                                                    )}
                                                </span>
                                            </Link>
                                        </span>
                                        <span className="post-meta">
                                            <time className="time-ago" itemProp="dateCreated" dateTime={admin_date} title={formatDateTime(admin_date, true)}>
                                                {formatDateTime(admin_date, true)}
                                            </time>
                                        </span>
                                    </header>
                                    <div className="post-message">
                                        {editingCommentId === commentId ? (
                                            <UpdateCommentTextArea
                                                editingCommentId={editingCommentId}
                                                saveDraft={saveChanginDraftComment}
                                                commentId={commentId}
                                                defaultValue={Text}
                                                sendMessage={(e) => {
                                                    setForm(e);
                                                    setEditingCommentId(comment.id);
                                                    setShowConfirmModal(true);
                                                }}
                                                toggleChangeArea={() => toggleChangeArea(comment.id)}
                                            />
                                        ) : (
                                            <p itemProp="text">
                                                {Text.split("\n").map((line, lineIndex) => (
                                                    <React.Fragment key={lineIndex}>
                                                        {line.split(" ").map((word, wordIndex) => {
                                                            const newWord = word.replace(/^[ \t\r]+/, "");
                                                            if (
                                                                newWord.startsWith("http://") ||
                                                                newWord.startsWith("https://")
                                                            ) {
                                                                return (
                                                                    <a
                                                                        className="postLink"
                                                                        key={wordIndex}
                                                                        href={newWord}
                                                                        rel="nofollow noopener noreferrer"
                                                                        target="_blank"
                                                                    >
                                                                        {newWord}
                                                                    </a>
                                                                );
                                                            }
                                                            return ` ${newWord} `;
                                                        })}
                                                        <br />
                                                    </React.Fragment>
                                                ))}
                                            </p>
                                        )}
                                        {children.data.length === 0 &&
                                            User.id === user?.data?.id &&
                                            timeDifference <= 5 && (
                                                <>
                                                    {!editingCommentId && <button
                                                        onClick={() => toggleChangeArea(commentId)}
                                                        className="post-button-edit"
                                                    ></button>}
                                                    <button
                                                        style={editingCommentId ? { bottom: "50%" } : { bottom: "0%" }}
                                                        onClick={() => onDelete(commentId, user.data.id)}
                                                        className="post-button-delete"
                                                    ></button>
                                                </>
                                            )}
                                    </div>
                                    <footer className="comment__footer">
                                        <nav className="comment-footer__menu">
                                            <CommentReactions
                                                comments={comment}
                                                commentData={commentData}
                                                globalUserIp={globalUserIp}
                                                reactions={comment.reactions}
                                            />
                                            <button
                                                name="reply button"
                                                className="comment-footer__action"
                                                onClick={() => toggleReplyArea(commentId)}>
                                                <span className="text reply-button">{$t[locale].comment.reply}</span>
                                            </button>
                                        </nav>
                                    </footer>
                                    {replyToCommentId === commentId && (
                                        <TextArea
                                            saveDraft={saveDraftComment}
                                            sendMessage={(e) => onSubmit(e, comment.id)}
                                            fatherId={comment.id}
                                        />
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
                {/* </ul> */}
                <button style={{ borderRadius: "15px " }} className={(commentCoutn - showedComent) <= 0 ? "none" : "show_more_button"} onClick={showMoreComments}>
                    <span className={isButtonLoading ? "loading show_more_button_span " : "show_more_button_span"}>
                       <picture>
                        <Image src={"/img/loadMore.svg"} width="28" height="28" alt="load more icon"></Image>
                       </picture>
                    </span>
                    {replaceText(`${$t[locale].blog.showMore} ${commentCoutn - showedComent}`)}
                </button>
            </section>
        </>

    );
}


export default Comments;
