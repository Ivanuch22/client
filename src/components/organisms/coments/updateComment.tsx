// @ts-nocheck
import React, { useState, useEffect } from "react";
import $t from '@/locale/global';
import { useRouter } from "next/router";

interface TextAreaProps {
    sendMessage: (e: React.FormEvent<HTMLFormElement>, fatherId?: number) => void;
    fatherId?: number;
    defaultValue?: string; 
}

const UpdateCommentTextArea: React.FC<TextAreaProps> = ({ sendMessage, fatherId, defaultValue }) => {
    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : router.locale;

    const [commentText, setCommentText] = useState(defaultValue || '');

    useEffect(() => {
        setCommentText(defaultValue || ''); 
    }, [defaultValue]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (fatherId) {
            sendMessage(e, fatherId);
        } else {
            sendMessage(e);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommentText(e.target.value); 
    };

    return (
        <div id="reply" className="reply">
            <form id="form_comment" onSubmit={handleFormSubmit} encType="multipart/form-data">
                <textarea
                    name="comment_text"
                    id="form_comment_text"
                    className="new-editor"
                    placeholder={$t[locale].comment.placeholder}
                    value={commentText} 
                    onChange={handleInputChange} 
                ></textarea>
                <div className="row" style={{ width: "100%" }}>
                    <button type="submit" className="btn btn-success btn-submit-login pull-right" id="button-login-submit" >
                        {$t[locale].comment.send_message}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateCommentTextArea;
