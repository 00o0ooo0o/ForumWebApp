import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Modal from '../Modal';
import '../css/Layout.css'
import { Login } from '../pages/Login'
import { Signup } from '../pages/Register'

const Layout = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null);

    const openModal = (type) => {
        setModalType(type);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalType(null);
    };

    const onSwitchToLogin = () => {
        setModalType('login');
    };

    return (
        <>
            <header className="layout-header">
                <div className="nav-left">
                    <Link to="/" className="home-link">
                        <img src="/MainPageLogo.png" className="logo" />
                    </Link>
                </div>

                <div className="logInButton">
                    <button onClick={() => openModal('login')}>Log In</button>
                </div>

                <div className="signUpButton">
                    <button onClick={() => openModal('signup')}>Sign Up</button>
                </div>

            </header>

            <Modal open={isOpen} onClose={closeModal}>
                {modalType === 'login' && <Login />}
                {modalType === 'signup' && <Signup onSwitchToLogin={onSwitchToLogin}/>}
            </Modal>

            <main>
                <Outlet />
            </main>

            <footer>
                2025
            </footer>
        </>
    );
};

export { Layout };
