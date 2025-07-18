import React from "react";
import { Module } from "../types";  //Import module interface, each module card contains a module object

//Initialize properties of component i.e. what inputs it expects to receive
type Props = {
    module: Module;
    onChange: (updated: Module) => void;
    onDelete: () => void;
    disableSU: boolean;
}

//List of grades to map to
const grades = [
  "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D+", "D", "F", "S", "U"
];


export default function ModuleCard({module, onChange, onDelete, disableSU} : Props) {
    //To edit the module
    const handleChange = (field: keyof Module, value: string | boolean | number) => {
        onChange({ ...module, [field]: value });
  };


    return (
    <div className="calc-button module-card">
     {/* Module name selector */}
      <label className="modSelectorContainer">
      Module:
      <input
        className="mod-selector"
        type="text"
        placeholder="Enter module code..."
        value={module.name}
        onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
      />
      </label>

      {/* Grade selector */}
      <label className="gradeSelectorContainer">
        Grade:
        <select
          value={module.grade}
          onChange={(e) => handleChange("grade", e.target.value)} // Update grade on change
          className="grade-selector"
        >
          <option value="">--</option>
          {grades.map((g) => (
            <option key={g} value={g}>{g}</option> // Render grade options
          ))}
        </select>
      </label>

      {/* Modular Credits input */}
      <div>
        <label>
          MCs:
          <input
            type="number"
            min={1}
            max={12}
            step={1}
            value={module.mc}
            onChange={(e) => handleChange("mc", Number(e.target.value))}
            className="mc-input"
          />
        </label>
      </div>

      {/* SU toggle */}
      <div className="toggle-row">
      <span className="toggle-desc">SU:  </span>
      <label className="switch">
        
        <input
          type="checkbox"
          checked={module.su}
          onChange={(e) => handleChange("su", e.target.checked)} // Update su on toggle
          className="SUToggle"
          disabled = {disableSU}
        />
        <span className ="slider"></span>
      </label>
      </div>

      {/* Remove button */}
      <div>
        <button onClick={onDelete} className="remove-button">
          Remove
        </button>
      </div>
    </div>
  );
}