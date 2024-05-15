// @ts-nocheck
import React, { useState, useEffect } from "react";
import formatDateTime from "@/utils/formateDateTime";
import TextArea from "./textArea";

import $t from '@/locale/global';
import { useRouter } from "next/router";


const Comments = ({ data, sendMessage }) => {
    const [comments, setComments] = useState([]);
    const [replyToCommentId, setReplyToCommentId] = useState(null);

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

    const onSubmit= (e,fatherId)=>{
        sendMessage(e,fatherId)
        toggleReplyArea(fatherId)
    }
    return (
        <div id="comment">
            <div className="comments-tree">
                <header className="comments-header">
                    <h4> {comments.length} {$t[locale].comment.comments}</h4>
                </header>
                <TextArea sendMessage={sendMessage} />
            </div>

            <ul className="p-0">
                {comments.map(comment => {
                    console.log(comments)
                    const commentId = comment.id;
                    const { Text, admin_date, father, children, user } = comment.attributes;
                    const { imgLink, real_user_name } = user?.data?.attributes;
                    const findFatherName = ()=>{
                        const name = comments.find(element=>{
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
                                                {father.data !==null?<span style={{color: "#494e58",fontSize: 12}} className="parent-link-container">
                                                <img style={{margin: "0 12px 0 10px"}} width={15}  src="https://cdn-icons-png.flaticon.com/512/591/591866.png" alt="" />
                                                {findFatherName()}
                                        </span>: ""}
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
                                                <p>
    {Text.split(" ").map((word, index) => {
      // Check if the word contains "http://" or "https://"
      if (word.startsWith("http://") || word.startsWith("https://")) {
        return (
          <a className="postLink" key={index} href={word} rel="nofollow noopener noreferrer nofollow" target="_blank">
            {word}
          </a>
        );
      }
      return ` ${word} `;
    })}
  </p>
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

                                    {replyToCommentId === commentId && <TextArea sendMessage={(e)=>onSubmit(e,comment.id)} fatherId={comment.id} />}
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
