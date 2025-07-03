import { useState } from 'react'
import {BrowserRouter,Route,Routes} from 'react-router-dom';
import './App.css'
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Guest from './pages/Guest';

function App() {
  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path='/' element={<LandingPage/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/guest' element={<Guest/>}/>
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
