// @ts-nocheck
import React, { useState, useEffect } from "react";
import formatDateTime from "@/utils/formateDateTime";
import TextArea from "./textArea";
import UpdateCommentTextArea from "./updateComment";
import ModalConfirm from '@/components/organisms/ModalConfirm';

import $t from '@/locale/global';
import { useRouter } from "next/router";
import Cookies from "js-cookie";


const Comments = ({ data, sendMessage, onDelete,updateComment}) => {
    const [comments, setComments] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [User, setUser] = useState({ id: 0 });
    const [isShowConfirmModal, setShowConfirmModal] = useState(false);
    const [form, setForm] = useState(null)

    useEffect(() => {
        let getUserCookies = Cookies.get('user');
        setUser(JSON.parse(getUserCookies));
    }, [comments])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000); 
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        console.log(User)
    }, [User])

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
    const onUpdate =(e, commentId)=>{
        updateComment(e,commentId);
        setEditingCommentId(null);
    }

    const onSubmit = (e, fatherId) => {
        sendMessage(e, fatherId)
        toggleReplyArea(fatherId)
    }
    return (
        <div>
            <ModalConfirm
                message={$t[locale].auth.confirm_text}
                isVisible={isShowConfirmModal}
                onClose={() => {
                  setShowConfirmModal(false)
                }}
                onSubmit={()=>{
                    onUpdate(form, editingCommentId)
                  setShowConfirmModal(false)
                }}
              />
            <div className="comments-tree">
                <header className="comments-header">
                    <h4> {comments.length} {$t[locale].comment.comments}</h4>
                </header>
                <TextArea sendMessage={sendMessage} />
            </div>

            <ul className="p-0">
                {comments.map(comment => {
                    const commentId = comment.id;
                    const { Text, admin_date, father, children, user, createdAt } = comment.attributes;
                    const { imgLink, real_user_name } = user?.data?.attributes;
                    console.log(children)
                    const timeDifference = (currentTime - new Date(createdAt).getTime()) / (1000 * 60); // Різниця у хвилинах

                    const findFatherName = () => {
                        const name = comments.find(element => {
                            return element.attributes.Text === father.data?.attributes.Text
                        }
                        )
                        return name.attributes.user.data.attributes.real_user_name;
                    }
                    return (
                        <li className={father.data === null ? "" : "post-children"} id={`comment-id-${commentId}`} key={commentId}>
                            <div className="post-content">
                                <div className="avatar hovercard">
                                    <a data-action="profile" className="user">
                                        <img src={imgLink} alt="Аватар" className="image-refresh" />
                                    </a>
                                </div>
                                <div className="post-body">
                                    <header className="comment__header">
                                        <span className="post-byline">
                                            <span className="author publisher-anchor-color">
                                                {real_user_name}
                                                {father.data !== null ? <span style={{ color: "#494e58", fontSize: 12 }} className="parent-link-container">
                                                    <img style={{ margin: "0 12px 0 10px" }} width={15} src="https://cdn-icons-png.flaticon.com/512/591/591866.png" alt="" />
                                                    {findFatherName()}
                                                </span> : ""}
                                            </span>
                                        </span>
                                        <span className="post-meta">
                                            <span className="time-ago" title={formatDateTime(admin_date, true)}>
                                                {formatDateTime(admin_date, true)}
                                            </span>
                                        </span>

                                    </header>
                                    <div className="post-body-inner">
                                        <div className="post-message-container">
                                            <div className="publisher-anchor-color">
                                                <div className="post-message">
                                                    {editingCommentId === commentId ? (
                                                        <UpdateCommentTextArea defaultValue={Text} sendMessage={(e) => {
                                                            setForm(e);
                                                            setEditingCommentId(comment.id)
                                                            setShowConfirmModal(true)
                                                        }} />
                                                    ) : (
                                                        <p>
                                                            {Text.split(" ").map((word, index) => {
                                                                const newWord = word.replace(/^[ \t\n\r]+/, "");
                                                                if (newWord.startsWith("http://") || newWord.startsWith("http://") || newWord.startsWith("https://") || newWord.startsWith("https://")) {
                                                                    return (
                                                                        <a className="postLink" key={index} href={word} rel="nofollow noopener noreferrer nofollow" target="_blank">
                                                                            {word}
                                                                        </a>
                                                                    );
                                                                }
                                                                return ` ${word} `;
                                                            })}
                                                        </p>
                                                    )}
                                                    {(children.data.length ===0 && User.id == user.data.id && timeDifference <= 5) && (
                                                        <>
                                                            <button onClick={() => toggleChangeArea(commentId)} className="post-button-edit"></button>
                                                            <button onClick={() => onDelete(commentId, user.data.id)} className="post-button-delete"></button>
                                                        </>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <footer className="comment__footer">
                                        <menu className="comment-footer__menu">
                                            <button className="comment-footer__action" onClick={() => toggleReplyArea(commentId)}>
                                                <span className="text reply-button">{$t[locale].comment.reply}</span>
                                            </button>
                                        </menu>
                                    </footer>

                                    {replyToCommentId === commentId && <TextArea sendMessage={(e) => onSubmit(e, comment.id)} fatherId={comment.id} />}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Comments;
