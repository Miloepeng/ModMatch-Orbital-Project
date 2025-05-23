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
          <Link to ="./Home" className = "links"> Home </Link>
          <Link to= "./Search" className="links">Search</Link>
          <Link to ="./DegreeRequirement" className ="links">Degree Requirement</Link>
          <Link to ="./Timetable" className = "links">Timtable</Link>
          <div className="box"></div>
        </div>
      </div>
    </header>
    </>
  );
}