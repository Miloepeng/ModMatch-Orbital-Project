import React from "react";
import logo from "../assets/Logo1.png";

export default function Header() {
  return (
    <header className="headerContainer">
      <div className="headerCenter">
        <img src = {logo} />
        <h1 className="headerTitle">CAP Calculator</h1>
        {/* Placeholder for future nav or login */}
        <div className="navBar">navBar test change</div>
      </div>
    </header>
  );
}