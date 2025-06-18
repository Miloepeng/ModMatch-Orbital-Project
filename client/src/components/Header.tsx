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
    <>
      <header>
        <div className = "container">
          <Link to ="./Home">
            <img className= "header-logo" src = {logo} width="70" height="70"/>
          </Link>
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