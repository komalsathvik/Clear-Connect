import React from 'react';

function Navbar() {
    return (
        <>
         <nav className="navbar navbar-expand-lg bg-transparent shadow-sm fixed-top">
    <div className="container">
        <a className="navbar-brand text-white fw-bold" href="#">CLEAR - CONNECT</a>
        <div className="ms-auto d-flex align-items-center gap-3">
            <a className="nav-link text-white" href="/guest">Join as Guest</a>
            <a className="nav-link text-white" href="/register">Register</a>
            <a href="/login"><button className="btn btn-outline-light">Login</button></a>
        </div> 
    </div>
</nav>
            <div style={{ paddingTop: '80px' }}></div>
        </>
    );
}

export default Navbar;
