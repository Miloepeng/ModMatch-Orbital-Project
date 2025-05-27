import React, { useState } from "react";
import ModuleCard from "./ModuleCard";
import { Module } from "../types";
import { calculateCAP } from "../utils/grades";
import CAPDisplay from "./CAPDisplay";

export default function Calculator() {
  const [userModules, setModules] = useState<Module[]>([]);
  const [idCounter, setIdCounter] = useState(0); //counter state
  const [suLimit, setSuLimit] = useState<number>(0);; 

    
//Adds a new modulecard
  const handleAddModule = () => {
    const newModule: Module = {
      id: String(idCounter), //use counter as ID
      name: "",
      grade: "",
      su: false,
      is2MC: false,
    };
    setModules((prev) => [...prev, newModule]);
    setIdCounter((prev) => prev + 1); //increment for next use
  };

  //handles selecting module name in modulecard
  const handleUpdateModule = (id: string, updated: Module) => {
  const isDuplicate = userModules.some(
    (mod) => mod.id !== id && mod.name === updated.name
  );

  if (isDuplicate) {
    alert("This module has already been selected.");
    return;
  }

  setModules((prev) =>
    prev.map((mod) => (mod.id === id ? updated : mod))
  );
};


  const handleDeleteModule = (id: string) => {
    setModules((prev) => prev.filter((mod) => mod.id !== id));
  };

  const currentSUUsed = userModules.filter((m) => m.su).length;

  return (
    <div className="calculatorContainer">
      {/*<h1 className="CAPCalculator">GPA / CAP Calculator</h1>*/}

      {/*Display CAP */}
      <CAPDisplay modules={userModules} />

      {/*User input no. of SU */}
      <div className="calc-input-container container gridContainer">
        <div className="moduleCard">
          <label className="numSU">Max SUs:</label>
          <input
            type="number"
            value={suLimit}
            onChange={(e) => setSuLimit(Number(e.target.value))}
            className="numSUInput"
            min={0}
          />
        </div>
        <div className="moduleCard">
          {currentSUUsed} / {suLimit} SUs used
        </div>
      </div>

      {/*No. of SU used 
      <div className="SUUsedContainer">
        {currentSUUsed} / {suLimit} SUs used
      </div>*/}

      <div className="gridContainer">
        {userModules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            onChange={(updated) => handleUpdateModule(mod.id, updated)}
            onDelete={() => handleDeleteModule(mod.id)}
            disableSU = {!mod.su && currentSUUsed >= suLimit}
          />
        ))}
        <button
        onClick={handleAddModule} 
        id="addModButton"
        >
          +
        </button>
      </div>


    </div>
  );
}