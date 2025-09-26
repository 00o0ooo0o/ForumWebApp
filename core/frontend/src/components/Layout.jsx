import React, { useState, useEffect} from 'react';
import { Link, Outlet } from 'react-router-dom';
import Modal from '../Modal';
import '../css/Layout.css'
import { Login } from '../pages/Login'
import { Signup } from '../pages/Register'
import { GuestHomePage } from '../pages/GuestHomePage';
import { MemberHomePage } from '../pages/MemberHomePage';
import axios from 'axios';

const Layout = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/api/check-auth/', { withCredentials: true })
        .then(res => {
            setIsAuthenticated(true);
            setUsername(res.data.username);
        })
        .catch(() => {
            setIsAuthenticated(false);
        });
    }, []);


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

    const handleSignOut = () => {
        axios.post('http://localhost:8000/api/logout/', {}, {
            withCredentials: true
        })
        .then(() => setIsAuthenticated(false))
        .catch(err => console.error(err));
    };

    return (
        <>
            <header className="layout-header">
                <div className="nav-left">
                    <Link to="/" className="home-link">
                        <img src="/MainPageLogo.png" className="logo" />
                    </Link>
                </div>

                <div className="nav-right">
                    {isAuthenticated ? ( 
                        <div className="signOutButton">
                            <button onClick={handleSignOut}>Sign Out</button>
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
            {modalType === 'login' && 
                <Login 
                closeModal={closeModal}
                onLoginSuccess={(username) => {
                    setIsAuthenticated(true);
                    setUsername(username);
                }}
                />
            }
            {modalType === 'signup' && <Signup onSwitchToLogin={onSwitchToLogin} />}
            </Modal>
            
            <main>
                {isAuthenticated === null ? ( //still loading?
                    <p>Loading...</p>
                ) : isAuthenticated ? ( //if not loading, is user logged in?
                    <MemberHomePage username={username} />
                ) : ( //if not loading and user is not logged in
                    <GuestHomePage />
                )}
            </main>


            <footer>
                2025
            </footer>
        </>
    );
};

export { Layout };
