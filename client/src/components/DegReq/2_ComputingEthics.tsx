import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function ComputingEthics({ userModules }: Props) {
  const REQUIRED_MODULE = "IS1108";
  const MC = 4;

  const taken = userModules.some(
    (mod) => mod.name.toUpperCase() === REQUIRED_MODULE
  );

  return (
    <CollapseSection
      title="Computing Ethics"
      headerExtra={`${taken ? MC : 0}/${MC} MC completed`} 
    >
      <ul className="deg-req-list">
        <li
          className={`deg-req-item ${
            taken ? "fulfilled" : "not-fulfilled"
          }`}
        >
          <strong>{REQUIRED_MODULE}</strong>:{" "}
          {taken ? "✅ Fulfilled" : "❌ Not fulfilled"}
        </li>
      </ul>
    </CollapseSection>
  );
}
