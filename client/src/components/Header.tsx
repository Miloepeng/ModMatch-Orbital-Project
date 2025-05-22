import React from "react";
import logo from "../assets/Logo1.png";

export default function Header() {
  return (
    /*<header className="headerContainer">
      <div className="headerCenter">
        <img src = {logo} />
        <h1 className="headerTitle">CAP Calculator</h1>
        {/* Placeholder for future nav or login }
        
      </div>
    </header>*/

    <header className="headerContainer">
      <div className="headerCenter">
        <img src = {logo} width="50" />
        <div className="box">Home</div>
        <div className="box">Search</div>
        <div className="box">Degree Requirement</div>
        <div className="box">Timetable</div>
        <div className="box"></div>
      </div>
    </header>
  );
}