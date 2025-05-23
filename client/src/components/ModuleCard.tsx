import React from "react";
import Select from "react-select";
import { Module } from "../types";  //Import module interface, each module card contains a module object
import { modules } from "../utils/modules";

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
    const handleChange = (field: keyof Module, value: string | boolean) => {
        onChange({ ...module, [field]: value });
  };

    return (
    <div className="moduleCard">
     {/* Module name selector */}
      <label className="modSelectorContainer">
      Module:
      <Select
          className="modSelector"
          options={modules}
          value={modules.find((opt) => opt.value === module.name)}
          onChange={(selected) =>
          handleChange("name", selected ? selected.value : "")
          }
          isClearable
          placeholder="Select module..."
      />
      </label>

      {/* Grade selector */}
      <label className="gradeSelectorContainer">
        Grade:
        <select
          value={module.grade}
          onChange={(e) => handleChange("grade", e.target.value)} // Update grade on change
          className="gradeSelector"
        >
          <option value="">--</option>
          {grades.map((g) => (
            <option key={g} value={g}>{g}</option> // Render grade options
          ))}
        </select>
      </label>

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

      {/* 2MC toggle */}
      <div className="toggle-row">
      <span className="toggle-desc">2MC:  </span>
      <label className="switch">
        <input
          type="checkbox"
          checked={module.is2MC}
          onChange={(e) => handleChange("is2MC", e.target.checked)} // Update is2MC on toggle
          className="mcSelector"
        />
        <span className ="slider"></span>
      </label>
      </div>

      {/* Remove button */}
      <button onClick={onDelete} className="removeButton">
        Remove
      </button>
    </div>
  );
}