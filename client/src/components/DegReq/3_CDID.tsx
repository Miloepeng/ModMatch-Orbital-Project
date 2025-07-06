// components/requirements/3_CDID.tsx
import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

// Dynamically require the JSON files
const CDData = require("./CD.json");
const IDData = require("./ID.json");

type Props = {
  userModules: Module[];
};

export default function CDIDStatus({ userModules }: Props) {
  // Extracting module names from CD and ID JSON data
  const CD_MODULES = CDData.map((mod: { value: string }) => mod.value);
  const ID_MODULES = IDData.map((mod: { value: string }) => mod.value);

  const MC_PER_MODULE = 4;
  const MAX_MC = 3 * MC_PER_MODULE; // 3 modules required

  // Find the modules that are selected by the user from the CD and ID modules
  const selectedCDModules = userModules.filter((mod) => CD_MODULES.includes(mod.name));
  const selectedIDModules = userModules.filter((mod) => ID_MODULES.includes(mod.name));

  // Total number of selected CD + ID modules
  const totalSelectedModules = selectedCDModules.length + selectedIDModules.length;

  // Check if the user has at least 2 ID modules and the total is 3
  const isIDCriteriaFulfilled = selectedIDModules.length >= 2;
  const isTotalCriteriaFulfilled = totalSelectedModules === 3;

  return (
    <CollapseSection
      title="CD-ID Modules"
      headerExtra={`${totalSelectedModules * MC_PER_MODULE}/${MAX_MC} MC completed`}
    >
      <p className="deg-req-subtitle">
        {/*{isIDCriteriaFulfilled && isTotalCriteriaFulfilled
          ? "✅ Completed"
          : "❌ Not Completed"}*/}
      </p>
      {/*<p className="deg-req-description">
        The requirement is to complete:
        <br />
        - At least 2 modules from ID.json
        <br />
        - A total of 3 modules (from ID.json and CD.json combined)
      </p>*/}

      <div className="deg-req-status">
        <ul>
          <li className={isIDCriteriaFulfilled ? "fulfilled" : "not-fulfilled"}>
            <strong className = "cdid">At least 2 ID modules</strong>:{" "}
            {isIDCriteriaFulfilled ? "✅ Fulfilled" : "❌ Not fulfilled"}
          </li>
          <li className={isTotalCriteriaFulfilled ? "fulfilled" : "not-fulfilled"}>
            <strong className = "cdid">Total of 3 modules</strong>:{" "}
            {isTotalCriteriaFulfilled ? "✅ Fulfilled" : "❌ Not fulfilled"}
          </li>
        </ul>
      </div>

      <div className="deg-req-modules">
        <h3>Modules Completed:</h3>
        <ul>
          {selectedIDModules.map((mod) => (
            <li key={mod.name}>
              <strong>{mod.name}</strong> (ID module)
            </li>
          ))}
          {selectedCDModules.map((mod) => (
            <li key={mod.name}>
              <strong>{mod.name}</strong> (CD module)
            </li>
          ))}
        </ul>
      </div>
    </CollapseSection>
  );
}
