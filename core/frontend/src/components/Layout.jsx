import React, { useContext, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Modal from '../Modal';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Register';
import { AuthContext } from '../AuthContext';
import '../css/Layout.css';
import { SearchBar } from './SearchBar';

export const Layout = () => {
    const { isAuthenticated, username, logout } = useContext(AuthContext);
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

    const onSwitchToLogin = () => setModalType('login');

    return (
        <>
            <header className="layout-header">
                <div className="nav-left" style={{display: 'flex'}}>
                    {isAuthenticated ? ( 
                        <Link to="/member" className="home-link">
                            <img src="/MainPageLogo.png" className="logo" />
                        </Link>
                    ) : (
                        <Link to="/" className="home-link">
                            <img src="/MainPageLogo.png" className="logo" />
                        </Link>              
                    )}
                    <SearchBar/>
                </div>

                <div className="nav-right">
                    {isAuthenticated ? ( 
                        <div className="signOutButton">
                            <button onClick={logout}>Sign Out</button>
                        </div>
                    ) : (
                        <div className="GuestRightNavButtons">
                            <div className="logInButton">
                                <button onClick={() => openModal('login')}>Log In</button>
                            </div>

                            <div className="signUpButton">
                                <button onClick={() => openModal('signup')}>Sign Up</button>
                            </div>
                        </div>               
                    )}
                </div>
            </header>

            <Modal open={isOpen} onClose={closeModal}>
                {modalType === 'login' && <Login closeModal={closeModal} />}
                {modalType === 'signup' && <Signup onSwitchToLogin={onSwitchToLogin} />}
            </Modal>
            
            <main>
                <Outlet/>
            </main>


            <footer className="footer">2026</footer>
        </>
    );
};