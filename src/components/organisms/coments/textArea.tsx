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
        }, 1500);


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
        setCommentText("")
    };

    const handleDraftSave = () => {
        const lastThreeDrafts = drafts.slice(-5);
        const longestDraft = lastThreeDrafts.reduce((a, b) => (a.length > b.length ? a : b), "");
        setLongestDraftText(longestDraft);
    };
    const onCancel = (e: any)=>{
        e.preventDefault();
        
        if (!isSubmittingRef.current) { // Only execute onBlur if the form is not being submitted
            if (draftIntervalRef.current) {
                clearInterval(draftIntervalRef.current);
            }
            console.log('blur');
            saveDraft(longestDraftText);
                setDrafts([]);
            setCommentText("")
        }
    }

    useEffect(() => {
        handleDraftSave();
        if (drafts.length >= 1) {
            isSubmittingRef.current = false;
        } else {
            isSubmittingRef.current = true; 
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
                            
                        }, 1000);

                    }}
                    onChange={(e) => {
                        setCommentText(e.target.value);
                    }}
                    value={commentText}
                    placeholder={$t[locale].comment.placeholder}
                ></textarea>
                <div className="row" style={{ width: "100%" }}>
               {commentText.length>0&&
                 <button 
                 type="cancel" onClick={onCancel} style={{ background: "red", marginRight: 10, border: "none"}} className="btn d-block btn-danger btn-submit-login pull-right" id="button-login-submit" >
                 {$t[locale].comment.cancel}
             </button>
               }
                    <button
                    disabled = {(commentText.length===0? true: false)}
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
