// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import $t from '@/locale/global';
import { useRouter } from "next/router";

interface TextAreaProps {
    sendMessage: any;
    fatherId?: number;
    saveDraft: (draft: string) => void;
}

const TextArea: React.FC<TextAreaProps> = ({ sendMessage, fatherId, saveDraft }) => {
    const [commentText, setCommentText] = useState<string>('');
    const [drafts, setDrafts] = useState<string[]>([]);
    const [longestDraftText, setLongestDraftText] = useState('');
    const isSubmittingRef = useRef(false);
    const draftIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : router.locale;

    useEffect(() => {
        draftIntervalRef.current = setInterval(() => {

            setDrafts(prevDrafts => [...prevDrafts, commentText]);
        }, 1000);


        return () => {
            if (draftIntervalRef.current) {
                clearInterval(draftIntervalRef.current);
            }
        };
    }, [commentText]);

    const handleSubmit = (e: any) => {
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

    const handleDraftSave = () => {
        const lastThreeDrafts = drafts.slice(-5);
        const longestDraft = lastThreeDrafts.reduce((a, b) => (a.length > b.length ? a : b), "");
        setLongestDraftText(longestDraft);
    };

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
            <form id="form_comment" onSubmit={handleSubmit} encType="multipart/form-data">
                <textarea
                    name="comment_text"
                    id="form_comment_text"
                    className="new-editor"
                    onBlur={() => {
                        setTimeout(() => {
                            console.log(isSubmittingRef.current, drafts)
                            if (!isSubmittingRef.current) { // Only execute onBlur if the form is not being submitted
                                if (draftIntervalRef.current) {
                                    clearInterval(draftIntervalRef.current);
                                }
                                console.log('blur');
                                saveDraft(longestDraftText);
                                setDrafts([]);
                            }
                        }, 1000);

                    }}
                    onChange={(e) => {
                        setCommentText(e.target.value);
                    }}
                    placeholder={$t[locale].comment.placeholder}
                ></textarea>
                <div className="row" style={{ width: "100%" }}>
                    <button
                        type="submit"
                        className="btn btn-success btn-submit-login pull-right"
                        id="button-login-submit"
                    >
                        {$t[locale].comment.send_message}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TextArea;
