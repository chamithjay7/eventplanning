import type { PropsWithChildren } from "react";

export default function Modal({
                                  title,
                                  onClose,
                                  children,
                                  footer,
                              }: PropsWithChildren<{ title: string; onClose: () => void; footer?: React.ReactNode }>) {
    return (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }} aria-modal>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">{children}</div>
                    {footer && <div className="modal-footer">{footer}</div>}
                </div>
            </div>
        </div>
    );
}
