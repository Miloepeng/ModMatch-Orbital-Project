import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function BzaCore({ userModules }: Props) {
  const REQUIRED_MODULES = [
    "BT2101", 
    "BT2102", 
    "CS2030", 
    "CS2040", 
    "IS2101", 
    "BT3103", 
    "IS3103",
    "BT4103"
  ];
  const MC_PER_MODULE = 4;
  const MAX_MC = REQUIRED_MODULES.length * MC_PER_MODULE + 16;

  const takenModules = new Set(userModules.map((mod) => mod.name.toUpperCase()));
  const completedCount = REQUIRED_MODULES.filter((mod) =>
    takenModules.has(mod)
  ).length;
  const completedMC = userModules.reduce((a, b) => a + b.mc, 0);
  const completed = completedMC == MAX_MC;

  const internMod = userModules.filter(mod => ["BT4101", "IS4010", "CP3880"].includes(mod.name));
  const internFulfilled = internMod.length == 1;

  return (
    <CollapseSection
      title="Business Analytics Core Courses"
      headerExtra={`${completedMC}/${MAX_MC} MC completed`}
      completed={completed}
    >
      <ul className="deg-req-list">
        {REQUIRED_MODULES.map((mod) => (
          <li
            key={mod}
            className={`deg-req-item ${
              takenModules.has(mod) ? "fulfilled" : "not-fulfilled"
            }`}
          >
            <strong className = "cs-foundation">{mod}</strong>:{" "}
            {takenModules.has(mod) ? "✅ Fulfilled" : "❌ Not fulfilled"}
          </li>
        ))}
          <li>
          <strong>Industry Experience</strong>: {" "}
          {internFulfilled ? "✅ Fulfilled by " + internMod[0].name  : "❌ Not fulfilled"}
        </li>
      </ul>
    </CollapseSection>
  );
}
