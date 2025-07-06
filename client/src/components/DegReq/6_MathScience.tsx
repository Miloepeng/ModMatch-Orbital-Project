import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function MathScience({ userModules }: Props) {
  const REQUIRED_MODULES = ["MA1521", "MA1522", "ST2334"];
  const MC_PER_MODULE = 4;
  const MAX_MC = REQUIRED_MODULES.length * MC_PER_MODULE;

  const takenModules = new Set(userModules.map((mod) => mod.name.toUpperCase()));
  const completedCount = REQUIRED_MODULES.filter((mod) =>
    takenModules.has(mod)
  ).length;
  const completedMC = completedCount * MC_PER_MODULE;

  return (
    <CollapseSection
      title="Mathematics and Sciences"
      headerExtra={`${completedMC}/${MAX_MC} MC completed`}
    >
      <ul className="deg-req-list">
        {REQUIRED_MODULES.map((mod) => (
          <li
            key={mod}
            className={`deg-req-item ${
              takenModules.has(mod) ? "fulfilled" : "not-fulfilled"
            }`}
          >
            <strong className="math-sci">{mod}</strong>:{" "}
            {takenModules.has(mod) ? "✅ Fulfilled" : "❌ Not fulfilled"}
          </li>
        ))}
      </ul>
    </CollapseSection>
  );
}
