// @ts-nocheck
import React from "react";
import $t from '@/locale/global';
import { useRouter } from "next/router";

interface TextArea {
    sendMessage:any
    fatherId? : number
}
const TextArea:React.FC<TextArea> = ({sendMessage,fatherId})=>{

    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : router.locale;


    const newFunc = (e:any)=>{
        if(fatherId){
            sendMessage(e,fatherId)
        }else{
            sendMessage(e)
        }
    }
    
    return (
        <div id="reply" className="reply">
        <form id="form_comment" onSubmit={(e) =>newFunc(e) } encType="multipart/form-data">
            <textarea name="comment_text" id="form_comment_text" className="new-editor" onChange={(e)=>console.log(e.target.value)} placeholder={$t[locale].comment.placeholder}></textarea>
            <div className="row" style={{ width: "100%" }}>
                <button type="submit" className="btn btn-success btn-submit-login pull-right" id="button-login-submit" >{$t[locale].comment.send_message}</button>
            </div>
        </form>
    </div>
    )
}

export default TextArea;


