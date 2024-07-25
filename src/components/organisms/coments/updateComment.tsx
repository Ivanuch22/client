// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";

import $t from '@/locale/global';
import { useRouter } from "next/router";

interface TextAreaProps {
    sendMessage: (e: React.FormEvent<HTMLFormElement>, fatherId?: number) => void;
    fatherId?: number;
    defaultValue?: string;
    toggleChangeArea: () => {};
    saveDraft: (draft: string) => void;
    commentId: string;
    editingCommentId: any;

}

const UpdateCommentTextArea: React.FC<TextAreaProps> = ({ sendMessage, fatherId, defaultValue, toggleChangeArea, saveDraft, commentId, editingCommentId }) => {
    const [commentText, setCommentText] = useState(defaultValue || '');
    const [drafts, setDrafts] = useState<string[]>([]);
    const [longestDraftText, setLongestDraftText] = useState('');
    const isSubmittingRef = useRef(false);
    const draftIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : router.locale;

    useEffect(() => {
        draftIntervalRef.current = setInterval(() => {
            setDrafts(prevDrafts => [...prevDrafts, commentText]);
        }, 500);
        return () => {
            if (draftIntervalRef.current) {
                clearInterval(draftIntervalRef.current);
            }
        };
    }, [commentText]);


    useEffect(() => {
        setCommentText(defaultValue || '');
    }, [defaultValue]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearInterval(draftIntervalRef.current);
        setDrafts([]);

        if (fatherId) {
            sendMessage(e, fatherId);
        } else {
            sendMessage(e);
        }
        isSubmittingRef.current = true; // Set the ref to true on form submission
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommentText(e.target.value);
    };

    const handleDraftSave = () => {
        const lastThreeDrafts = drafts;
        const longestDraft = lastThreeDrafts.reduce((a, b) => (a.length > b.length ? a : b), "");
        setLongestDraftText(longestDraft);
    };
    const onCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (longestDraftText === defaultValue) {
            toggleChangeArea()
            setCommentText(defaultValue)

        } else {
            if (!isSubmittingRef.current) { // Only execute onBlur if the form is not being submitted

                clearInterval(draftIntervalRef.current);

            saveDraft(longestDraftText, commentId);
            setDrafts([]);
            toggleChangeArea()
            setCommentText(defaultValue)
        }
           
        }

    }

    useEffect(() => {
        handleDraftSave();
        if (drafts.length >= 1) {
            isSubmittingRef.current = false; // Set the ref to true on form submission
        } else {
            isSubmittingRef.current = true; // Set the ref to true on form submission
        }
    }, [drafts]);

    return (
        <div id="reply" className="reply">
            <form id="form_comment" encType="multipart/form-data"
                        onSubmit={handleFormSubmit}
                        >
                <textarea
                    name="comment_text"
                    id="form_comment_text"
                    className="new-editor"
                    placeholder={$t[locale].comment.placeholder}
                    value={commentText}
                    onChange={handleInputChange}
                    style={{ paddingRight: 25 }}
                ></textarea>
                <div className="row" style={{ width: "100%" }}>
                    {commentText.length > 0 &&
                        <button
                            type="cancel" onClick={onCancel} style={{ background: "red", marginRight: 10, border: "none" }} className="btn d-block btn-danger btn-submit-login pull-right" id="button-login-submit" >
                            {$t[locale].comment.cancel}
                        </button>
                    }
                    <button
                        type="submit" className="btn btn-success btn-submit-login pull-right" id="button-login-submit" >
                        {$t[locale].comment.send_message}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateCommentTextArea;
