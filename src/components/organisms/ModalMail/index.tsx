import { useRouter } from "next/router";

export type MailModalProps = {
    isVisible: boolean;
    message?: string;
    onClose: () => {}
}

const MailModal: React.FC<MailModalProps> = ({
    isVisible = false,
    onClose,
    message
}) => {
    const router = useRouter();
    const locale = router.locale === 'ua' ? 'uk' : (router.locale);
    const body = {
        title: {
            ru: 'Спасибо, ваш запрос отправлен.',
            uk: 'Дякуємо, ваш запит надіслано.',
            en: 'Thank you, your request has been sent.',
        },
        text: {
            ru: 'Мы свяжемся с вами в ближайшее время.',
            uk: `Ми зв'яжемося з вами найближчим часом.`,
            en: 'We will contact you soon.',
        }
    }

    // @ts-ignore
    const title =  message? message :body.title?.[locale];
    // @ts-ignore
    const text = message? "" :body.text?.[locale];

    return (
        <div id="mailModal" className="modal fade show" style={{background: 'rgba(0, 0, 0, .3)', display: isVisible ? 'block' : 'none'}}>
            <div className="modal-dialog modal-confirm">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="icon-box">
                        <i className="fas fa-check"></i>
                        </div>
                        <h4 className="modal-title w-100">{title}</h4>
                    </div>
                    <div className="modal-body">
                        <p className="text-center">{text}</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-success btn-block" data-dismiss="modal" onClick={onClose} style={{width: '100%'}}>OK</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MailModal;