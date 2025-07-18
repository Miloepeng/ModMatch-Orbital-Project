import React, { useState, useEffect } from "react";
import ModuleCard from "./ModuleCard";
import { Module } from "../types";
import CAPDisplay from "./CAPDisplay";
import { supabase } from "../supabaseClient";

const isGuest = localStorage.getItem("guest") === "true";

export default function Calculator() {
  const [userModules, setModules] = useState<Module[]>([]);
  const [idCounter, setIdCounter] = useState(0);
  const [suLimit, setSuLimit] = useState<number>(0);

  // Load user data on mount
  useEffect(() => {
    if (isGuest) return;

    const checkUserAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in. Skipping load.");
        return;
      }

      const { data, error } = await supabase
        .from("module_selections")
        .select("modules_json, su_limit")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading data:", error.message);
        return;
      }

      if (data?.modules_json) {
        setModules(data.modules_json);

        const maxId = data.modules_json.reduce((max: number, mod: Module) => {
          const idNum = Number(mod.id);
          return !isNaN(idNum) && idNum > max ? idNum : max;
        }, -1);
        setIdCounter(maxId + 1);
      }

      if (typeof data?.su_limit === "number") {
        setSuLimit(data.su_limit);
      }
    };

    checkUserAndLoad();
  }, []);

  // Autosave modules and suLimit
  useEffect(() => {
    if (isGuest) return;

    const saveModules = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("module_selections")
        .upsert(
          [
            {
              user_id: user.id,
              modules_json: userModules,
              su_limit: suLimit,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Auto-save failed:", error.message);
      }
    };

    if (userModules.length > 0 || suLimit !== 0) {
      saveModules();
    }
  }, [userModules, suLimit]);

  const handleAddModule = () => {
    const newModule: Module = {
      id: String(idCounter),
      name: "",
      grade: "",
      su: false,
      mc: 4,
    };
    setModules((prev) => [newModule, ...prev]);
    setIdCounter((prev) => prev + 1);
  };

  const handleUpdateModule = (id: string, updated: Module) => {
    const updatedName = updated.name.toUpperCase().trim();
    const isDuplicate =
      updatedName &&
      userModules.some((mod) => mod.id !== id && mod.name === updated.name);

    if (isDuplicate) {
      alert("This module has already been selected.");
      return;
    }

    setModules((prev) =>
      prev.map((mod) => (mod.id === id ? updated : mod))
    );
  };

  const handleDeleteModule = (id: string) => {
    setModules((prev) => prev.filter((mod) => mod.id !== id));
  };

  const currentSUUsed = userModules.filter((m) => m.su).length;

  return (
    <>
      <div className="mid-section">
        <h1 className="mid-section-title">Home</h1>
        <p className="mid-section-content">
          Input your results and calculate your CAP
        </p>
      </div>

      <div className="calculator-container">
        <div>
          <h1 className="brand-label">ModMatch</h1>
        </div>

        <CAPDisplay modules={userModules} />

        <div className="calc-input-container grid-container">
          <div className="calc-button calc-input">
            <label className="num-su">Max SUs:</label>
            <input
              type="number"
              value={suLimit}
              onChange={(e) => setSuLimit(Number(e.target.value))}
              className="num-su-input"
              min={0}
            />
          </div>
          <div className="calc-button calc-input">
            {currentSUUsed} / {suLimit} SUs used
          </div>
        </div>

        <div className="grid-container">
          <button onClick={handleAddModule} id="addModButton">
            +
          </button>
          {userModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              onChange={(updated) => handleUpdateModule(mod.id, updated)}
              onDelete={() => handleDeleteModule(mod.id)}
              disableSU={!mod.su && currentSUUsed >= suLimit}
            />
          ))}
        </div>
      </div>
    </>
  );
}
