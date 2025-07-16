import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function UE({ userModules }: Props) {
  const MAX_MC = 40;

  // Calculate the total MCs based on the number of modules
  const totalMC = userModules.map(mod => mod.mc).reduce((a, b) => a + b, 0);

  return (
    <CollapseSection
      title="UE Modules"
      headerExtra={`${totalMC}/${MAX_MC} MC completed`}
    >
      <ul className="deg-req-list">
        {userModules.map((mod) => (
          <li key={mod.id} className="deg-req-item">
            <strong>{mod.name}</strong>
          </li>
        ))}
      </ul>
    </CollapseSection>
  );
}
