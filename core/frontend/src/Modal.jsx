import React, { Children } from 'react'
import ReactDom from 'react-dom'
import './css/AuthPage.css'

const MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '330px',
    height: '350px',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    backgroundColor: '#FFF9F1',
    zIndex: 1000
}

const OVERLAY_STYLE = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, .3)',
    zIndex: 1000
}

export default function Modal({open, children, onClose}){
    if (!open) return null
    
    return ReactDom.createPortal(
        <>
        <div class="Auth">
        <div style={OVERLAY_STYLE} />
        <div style={MODAL_STYLES}>
            <button class="closeButton" onClick={onClose}>
                <img src="/closeButtonImg.png" alt="Close" />
            </button>
            {children}
        </div>
        </div>
        </>,
        document.getElementById('portal')
    )
}