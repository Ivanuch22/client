//@ts-nocheck
import { useRouter } from "next/router";
import $t from '@/locale/global';

export type MailModalProps = {
    isVisible: boolean;
    message?: string;
    onClose: () => {}
    sendMessage: ()=>{}
}

const NotConfirmedModal: React.FC<MailModalProps> = ({
    isVisible = false,
    onClose,
    sendMessage,
    message
}) => {

    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : router.locale;

    return (
<div id="mailModal" className="modal fade show" style={{padding: "0 10px", background: 'rgba(0, 0, 0, .3)', display: isVisible ? 'block' : 'none' }}>
    <div className="modal-dialog modal-confirm">
        <div className="modal-content">
            <div className="modal-header">
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                <div className="icon-box" style={{top:"-120px"}}>
                    <i className="fas fa-check"></i>
                </div>
                <p className="text-center">{message}</p>
            </div>
            <div className="modal-footer">
                <button className="btn btn-success btn-block" onClick={() => {
                    sendMessage();
                    onClose();
                }} style={{ width: '100%' }}>
                    {$t[locale].auth.getConfirmetionLink}
                </button>
            </div>
        </div>
    </div>
</div>
    )
}

export default NotConfirmedModal;