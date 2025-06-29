import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function UE({ userModules }: Props) {
  const MODULE_MC = 4;
  const MAX_MC = 40;

  // Calculate the total MCs based on the number of modules
  const totalMC = userModules.length * MODULE_MC;

  return (
    <CollapseSection
      title="UE Modules"
      headerExtra={`🎓 ${totalMC}/${MAX_MC} MC completed`}
    >
      <p className="deg-req-subtitle">UE modules</p>
      <ul className="deg-req-list">
        {userModules.map((mod) => (
          <li key={mod.id} className="deg-req-item">
            <strong>{mod.name}</strong>: ✅ Fulfilled
          </li>
        ))}
      </ul>
    </CollapseSection>
  );
}
