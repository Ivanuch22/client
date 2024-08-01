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

interface IComentData {
    comentID: number;
    userIp: string;
    pageUrl: string
}
const Comments = ({ pageUrl, globalUserIp, data, sendMessage, onDelete, updateComment, saveDraftComment, saveChanginDraftComment }) => {
    const [comments, setComments] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [User, setUser] = useState({ id: 0 });
    const [isShowConfirmModal, setShowConfirmModal] = useState(false);
    const [form, setForm] = useState(null)

    const { publicRuntimeConfig } = getConfig();
    const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;



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
        // Перевірка, чи містить текст слово "count"
        if (text.includes("count")) {
            const newText = text.replace("count", (commentCoutn - showedComent))

            return newText.slice(0, -1);
        } else {

            return text;
        }
    }


    return (
        <>
            <section>
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
            </section >

            <section itemProp="discussionUrl" itemScope itemType="https://schema.org/DiscussionForumPosting">
                <h3 className="notShowOnPage">{$t[locale].comment.comments}</h3>

                {/* <ul className="p-0"> */}
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
                            <div className="post-content">
                                <div data-action="profile" className="user avatar">
                                    <img
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
                                            itemProp="creator"
                                            itemScope
                                            itemType="https://schema.org/Person">
                                            <span
                                                itemProp="name"
                                                className="author publisher-anchor-color">
                                                {real_user_name}
                                                {father.data !== null ? (
                                                    <span
                                                        style={{ color: "#494e58", fontSize: 12 }}
                                                        className="parent-link-container"
                                                    >
                                                        <img
                                                            style={{ margin: "0 12px 0 10px" }}
                                                            width={15}
                                                            src="https://cdn-icons-png.flaticon.com/512/591/591866.png"
                                                            alt=""
                                                        />
                                                        {findFatherName()}
                                                    </span>
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                        </span>
                                        <span className="post-meta">
                                            <time className="time-ago" itemprop="dateCreated" datetime={formatDateTime(admin_date, true)} title={formatDateTime(admin_date, true)}>
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
                                            <p itemprop="text">
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
                                                comment={comment}
                                                commentData={commentData}
                                                globalUserIp={globalUserIp}
                                                reactions={comment.reactions}
                                            />
                                            <button
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
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.5083 4.5C22.0609 4.5 22.5088 4.94772 22.5088 5.5V9C22.5088 9.55228 22.0609 10 21.5083 10H18.0066C17.4541 10 17.0061 9.55228 17.0061 9C17.0061 8.44772 17.4541 8 18.0066 8H19.2991C17.8875 6.75451 16.0341 6 14.0047 6C9.88553 6 6.49196 9.11098 6.04969 13.1099C5.98898 13.6588 5.49454 14.0546 4.94533 13.9939C4.39613 13.9333 4.00012 13.4391 4.06083 12.8901C4.61393 7.88912 8.85423 4 14.0047 4C16.4879 4 18.7596 4.90468 20.5078 6.40058V5.5C20.5078 4.94772 20.9558 4.5 21.5083 4.5Z" fill="#109BFF" />
                            <path d="M23.064 14.0061C23.6132 14.0667 24.0093 14.5609 23.9485 15.1099C23.3954 20.1109 19.1551 24 14.0047 24C11.5215 24 9.24982 23.0953 7.50152 21.5994V22.5C7.50152 23.0523 7.05359 23.5 6.50103 23.5C5.94848 23.5 5.50055 23.0523 5.50055 22.5V19C5.50055 18.4477 5.94848 18 6.50103 18H10.0027C10.5553 18 11.0032 18.4477 11.0032 19C11.0032 19.5523 10.5553 20 10.0027 20H8.71027C10.1219 21.2455 11.9752 22 14.0047 22C18.1238 22 21.5174 18.889 21.9597 14.8901C22.0204 14.3412 22.5148 13.9454 23.064 14.0061Z" fill="#109BFF" />
                        </svg>
                    </span>
                    {replaceText(`${$t[locale].blog.showMore} ${commentCoutn - showedComent}`)}
                </button>
            </section>
        </>

    );
}


export default Comments;
