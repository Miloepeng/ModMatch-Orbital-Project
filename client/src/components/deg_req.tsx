import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Module } from "../types";
import {
  GEN,
  GEC,
  GEI,
  GEA,
  GEX,
  GESS,
} from "../utils/modules";
import "../App.css";

type UserModule = Module & {
  GEPillar?: string;
};

export default function DegReq() {
  const [userModules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const GEPILLARS = ["GEA", "GEC", "GEI", "GEN", "GESS", "GEX"];
  const MC_PER_MODULE = 4;
  const MAX_GE_MODULES = 6;
  const MAX_MC = MAX_GE_MODULES * MC_PER_MODULE;

  // Build lookup table
  const buildGELookup = () => {
    const lookup: Record<string, string> = {};

    const addToLookup = (mods: { value: string }[], pillar: string) => {
      for (const mod of mods) {
        lookup[mod.value] = pillar;
      }
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

  const enrichWithGEPillar = (mods: any[]): UserModule[] => {
    return mods.map((mod) => ({
      ...mod,
      GEPillar: mod.GEPillar ?? GELookup[mod.name] ?? "NIL",
    }));
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { data, error } = await supabase
          .from("module_selections")
          .select("modules_json")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        const enriched = enrichWithGEPillar(data?.modules_json || []);
        setModules(enriched);
      } catch (err) {
        console.error(err);
        setError("Failed to load modules.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const fulfilledGEPillars = new Set(
    userModules
      .map((mod) => mod.GEPillar)
      .filter((pillar) => pillar && pillar !== "NIL")
  );

  const completedMC = fulfilledGEPillars.size * MC_PER_MODULE;

  return (
    <div className="deg-req-wrapper">
      <h1 className="deg-req-title">Degree Requirements</h1>
      <p className="deg-req-subtitle">Check your GE pillar fulfilment status:</p>

      <p className="deg-req-mc">🎓 {completedMC}/{MAX_MC} MC completed</p>

      <button
        className="deg-req-toggle"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        {isCollapsed ? "Show GE Pillars ▾" : "Hide GE Pillars ▴"}
      </button>

      {loading && <p>Loading modules...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && !isCollapsed && (
        <ul className="deg-req-list">
          {GEPILLARS.map((pillar) => (
            <li
              key={pillar}
              className={`deg-req-item ${
                fulfilledGEPillars.has(pillar) ? "fulfilled" : "not-fulfilled"
              }`}
            >
              <strong>{pillar}</strong>:{" "}
              {fulfilledGEPillars.has(pillar)
                ? "✅ Fulfilled"
                : "❌ Not fulfilled"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
