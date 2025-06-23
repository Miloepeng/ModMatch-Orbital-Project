// components/requirements/1_GEPillar.tsx
import React from "react";
import {
  GEN, GEC, GEI, GEA, GEX, GESS
} from "../../utils/modules";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function GEPillarStatus({ userModules }: Props) {
  const GEPILLARS = ["GEA", "GEC", "GEI", "GEN", "GESS", "GEX"];
  const MC_PER_MODULE = 4;
  const MAX_MC = GEPILLARS.length * MC_PER_MODULE;

  const buildGELookup = () => {
    const lookup: Record<string, string> = {};
    const addToLookup = (mods: { value: string }[], pillar: string) => {
      for (const mod of mods) lookup[mod.value] = pillar;
    };
    addToLookup(GEA, "GEA");
    addToLookup(GEC, "GEC");
    addToLookup(GEI, "GEI");
    addToLookup(GEN, "GEN");
    addToLookup(GESS, "GESS");
    addToLookup(GEX, "GEX");
    return lookup;
  };

  const GELookup = buildGELookup();

  const enrichedModules = userModules.map((mod) => ({
    ...mod,
    GEPillar: GELookup[mod.name] ?? "NIL",
  }));

  const fulfilled = new Set(
    enrichedModules.map((mod) => mod.GEPillar).filter((x) => x !== "NIL")
  );

  const completedMC = fulfilled.size * MC_PER_MODULE;

  return (
    <CollapseSection
      title="General Education Pillars"
      headerExtra={`🎓 ${completedMC}/${MAX_MC} MC completed`}
    >
      <p className="deg-req-subtitle">GE Pillar Fulfilment Status</p>
      <ul className="deg-req-list">
        {GEPILLARS.map((pillar) => (
          <li
            key={pillar}
            className={`deg-req-item ${
              fulfilled.has(pillar) ? "fulfilled" : "not-fulfilled"
            }`}
          >
            <strong>{pillar}</strong>:{" "}
            {fulfilled.has(pillar) ? "✅ Fulfilled" : "❌ Not fulfilled"}
          </li>
        ))}
      </ul>
    </CollapseSection>
  );
}
