import { useEffect, useState } from "react";

export type ConfirmModalProps = {
    isVisible: boolean;
    message?: string;
    description: string;
    onClose: () => {};
    onSubmit: (password: string) => {}
}

const PasswordModal: React.FC<ConfirmModalProps> = ({
    isVisible = false,
    onClose,
    message,
    onSubmit,
    description
}) => {
    const [password, setPassword] = useState("")

    return (
        <div id="ConfirmModal" className="modal fade show" style={{ padding: "0 10px", background: 'rgba(0, 0, 0, .3)', display: isVisible ? 'block' : 'none' }}>
            <div className="modal-dialog modal-confirm">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-header">
                        <div className="icon-box" style={{ top: -120 }}>
                            <i className="fas fa-check"></i>
                        </div>
                        <h4 className="modal-title w-100">{message}</h4>
                    </div>
                    <div className="modal-header">
                        <p className="modal-title text-center w-100">{description}</p>
                    </div>
                    <div className="modal-body">
                        <div id="confirmPassBlock" className="input-group">
                            <input tabIndex={1} id="confirmPass" type="password" name="confirmPass" onChange={(e) => setPassword(e.target.value)} className="form-control" placeholder="Password" required={true} value={password} />
                        </div>
                    </div>
                    <div className='modal-body d-flex justify-content-between'>
                        <button className="btn btn-success" data-dismiss="modal" onClick={()=>onSubmit(password)} style={{ width: '48%' }}>OK</button>
                        <button className="btn-danger" data-dismiss="modal" onClick={onClose} style={{ width: '48%' }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PasswordModal;