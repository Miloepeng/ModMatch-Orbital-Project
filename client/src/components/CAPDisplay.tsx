import React from "react";
import { Module } from "../types";
import { calculateCAP } from "../utils/grades";

type Props = {
  modules: Module[];
};

export default function CAPDisplay({ modules }: Props) {
  const cap = calculateCAP(modules);

  const totalModules = modules.length;
  const totalSUUsed = modules.filter((m) => m.su).length;

  const totalMCs = modules.reduce((sum, mod) => {
    const mc = mod.is2MC ? 2 : 4;
    return sum + (mod.su ? 0 : mc); // count only non-SUed modules
  }, 0);

  return (
    <div className="CAPContainer">
      {/*<h2 className="CAPTitle">Summary</h2>*/}

      <div className="CAPValue">
        <p className="lcd-text"> <strong>CAP:</strong> {cap}</p>
        <p className="lcd-text"> <strong>Modules:</strong> {totalModules}</p>
        {/*<p> <strong>Total MCs (excluding SU):</strong> {totalMCs}</p>*/}
        {/*<p> <strong>SU Used:</strong> {totalSUUsed}</p>*/}
      </div>
    </div>
  );
}
