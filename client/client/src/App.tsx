import React from 'react';
import logo from './logo.svg';
import './App.css';
import Header from "./components/Header";
import Calculator from "./components/Calculator";


function App() {
  return (
    <div className="homePage">
      <Header />
      <Calculator />
    </div>
  );
}

export default App;
