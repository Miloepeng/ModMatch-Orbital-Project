import React from "react";
import logo from "../assets/Logo1.png";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Header() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); 
    navigate("/Login")
  }
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
          <Link to ="./Login" className="header-links" onClick={handleLogout}>Logout</Link>
          <div></div>
        </div>
      </div>
    </header>
    </>
  );
}