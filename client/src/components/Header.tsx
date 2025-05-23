import React from "react";
import logo from "../assets/Logo1.png";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    /*<header className="headerContainer">
      <div className="headerCenter">
        <img src = {logo} />
        <h1 className="headerTitle">CAP Calculator</h1>
        {/* Placeholder for future nav or login }
        <div className="navBar">navBar test change</div>
      </div>
    </header>*/
    <>
     


    <header>
      <div className = "container">
        <img src = {logo} width="50" />
        <div className="container right">
          <Link to ="./Home" className = "header-links"> Home </Link>
          <Link to= "./Search" className="header-links">Search</Link>
          <Link to ="./DegreeRequirement" className ="header-links">Degree Requirement</Link>
          <Link to ="./Timetable" className = "header-links">Timetable</Link>
          <div></div>
        </div>
      </div>
    </header>
    </>
  );
}