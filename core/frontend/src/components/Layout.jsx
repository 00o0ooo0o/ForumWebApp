import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <>
        <header>
            <Link to="/">Home</Link>
            <Link to="/login">Log In</Link>
            <Link to="/register">Sign Up</Link>
        </header>

        <Outlet />
            <footer>
                2025
            </footer>
        </>
    )
}

export {Layout}