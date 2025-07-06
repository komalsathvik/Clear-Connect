import React from 'react';

function Navbar() {
    return (
        <>
         <nav className="navbar navbar-expand-lg bg-transparent" style={{width:"90vw",marginTop:"-20px"}}>
    <div className="container-fluid">
        <a className="navbar-brand text-black fw-bold" href="#">CLEAR - CONNECT</a>
        <div className="ms-auto d-flex align-items-center gap-3">
            <a className="nav-link text-black" href="/guest">Join as Guest</a>
            <a className="nav-link text-black" href="/register">Register</a>
            <a href="/login"><button className="btn btn-outline-black">Login</button></a>
        </div> 
    </div>
</nav>
            <div style={{ paddingTop: '80px' }}></div>
        </>
    );
}

export default Navbar;
