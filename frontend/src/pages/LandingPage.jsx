import React from 'react';
import Navbar from './Navbar';

function LandingPage() {
    return ( <>
            <Navbar/>
            <div className="container">
                <div className="row">
                <div className="col-6">
                    <h1 style={{color:"orange"}}>Connect with your loved ones</h1>
                    <br></br>
                    <p style={{color:"white",fontSize:"large"}}>Cover a distance by clear-connect. A platform to connect talk and spend time !</p>
                    <br></br>
                    <button type='btn' style={{color:"white" ,backgroundColor:"orange"}}>Get Started</button>
                </div>
                <div className="col-6">
                    <img src="../images/mobile.png"></img>
                </div>
                </div>
            </div>
    </> );
}

export default LandingPage;