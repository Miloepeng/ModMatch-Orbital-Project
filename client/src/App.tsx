import React from 'react';
import logo from './logo.svg';
import './App.css';
import Header from "./components/Header";
import Calculator from "./components/Calculator";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Search from "./pages/Search"
import DegreeRequirement from "./pages/DegreeRequirement"
import Timetable from "./pages/Timetable"
import Home from "./pages/Home"


function App() {
  return (
    <>
    <Router>
      <Header />
      <Routes>
        <Route path="/Search" element={<Search />} />
        <Route path="/DegreeRequirement" element={<DegreeRequirement />} />
        <Route path="/Timetable" element={<Timetable />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
