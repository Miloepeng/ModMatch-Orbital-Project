import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function CSFoundation({ userModules }: Props) {
  const REQUIRED_MODULES = [
    "CS1231S",
    "CS2030S",
    "CS2040S",
    "CS2100",
    "CS2101",
    "CS2103T",
    "CS2106",
    "CS2109S",
    "CS3230"
  ];
  const MC_PER_MODULE = 4;
  const MAX_MC = REQUIRED_MODULES.length * MC_PER_MODULE;

  const takenModules = new Set(userModules.map((mod) => mod.name.toUpperCase()));
  const completedCount = REQUIRED_MODULES.filter((mod) =>
    takenModules.has(mod)
  ).length;
  const completedMC = completedCount * MC_PER_MODULE;

  return (
    <CollapseSection
      title="Computer Science Foundation"
      headerExtra={`🎓 ${completedMC}/${MAX_MC} MC completed`}
    >
      <p className="deg-req-subtitle">Core CS foundation modules required</p>
      <ul className="deg-req-list">
        {REQUIRED_MODULES.map((mod) => (
          <li
            key={mod}
            className={`deg-req-item ${
              takenModules.has(mod) ? "fulfilled" : "not-fulfilled"
            }`}
          >
            <strong>{mod}</strong>:{" "}
            {takenModules.has(mod) ? "✅ Fulfilled" : "❌ Not fulfilled"}
          </li>
        ))}
      </ul>
    </CollapseSection>
  );
}
