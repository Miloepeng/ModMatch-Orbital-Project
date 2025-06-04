import React from 'react';
import logo from './logo.svg';
import './App.css';
import './Header.css';
import './components/Calculator.css'
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Search from "./pages/Search"
import DegreeRequirement from "./pages/DegreeRequirement"
import Timetable from "./pages/Timetable"
import Home from "./pages/Home"
import Login from "./pages/Login"
import ResetPassword from './pages/ResetPassword';


function App() {  
  return (
    <>
      {!["/Login", "/ResetPassword"].includes(useLocation().pathname) && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace/>} />
        <Route path="/Search" element={<Search />} />
        <Route path="/DegreeRequirement" element={<DegreeRequirement />} />
        <Route path="/Timetable" element={<Timetable />} />
        <Route path="/Home" element={<Home />} />
        <Route path ="/Login" element={<Login />} />
        <Route path = "/ResetPassword" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;
