import React, { useState } from "react";
import ModuleCard from "./ModuleCard";
import { Module } from "../types";
import { calculateCAP } from "../utils/grades";
import CAPDisplay from "./CAPDisplay";
import { useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";


export default function Calculator() {
  const [userModules, setModules] = useState<Module[]>([]);
  const [idCounter, setIdCounter] = useState(0); //counter state
  const [suLimit, setSuLimit] = useState<number>(0);; 

  //retrieve user data
  useEffect(() => {
  const checkUserAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("No user logged in. Skipping load.");
      return;
    }

    const { data, error } = await supabase
      .from("module_selections")
      .select("modules_json")
      .eq("user_id", user.id)
      .single();

    if (data?.modules_json) {
      setModules(data.modules_json);
      setIdCounter(data.modules_json.length);
    }

    if (error) {
      console.warn("Error loading modules:", error.message);
    }
  };

  checkUserAndLoad();
}, []);


//autosave
useEffect(() => {
  const saveModules = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { error } = await supabase
      .from("module_selections")
      .upsert([
        {
          user_id: user.data.user.id,
          modules_json: userModules,
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: "user_id" });

    if (error) {
      console.error("Auto-save failed:", error.message);
    }
  };

  // Avoid saving on first render with empty modules array
  if (userModules.length > 0) {
    saveModules();
  }
}, [userModules]);

    
//Adds a new modulecard
  const handleAddModule = () => {
    const newModule: Module = {
      id: String(idCounter), //use counter as ID
      name: "",
      grade: "",
      su: false,
      is2MC: false,
    };
    setModules((prev) => [...prev, newModule]);
    setIdCounter((prev) => prev + 1); //increment for next use
  };

  //handles selecting module name in modulecard
  const handleUpdateModule = (id: string, updated: Module) => {
  const isDuplicate = userModules.some(
    (mod) => mod.id !== id && mod.name === updated.name
  );

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
    <div className="calculatorContainer">
      <h1 className="CAPCalculator">GPA / CAP Calculator</h1>

      {/*Display CAP */}
      <CAPDisplay modules={userModules} />

      {/*User input no. of SU */}
      <div className="numSUContainer">
        <label className="numSU">Max SUs allowed:</label>
        <input
          type="number"
          value={suLimit}
          onChange={(e) => setSuLimit(Number(e.target.value))}
          className="numSUInput"
          min={0}
        />
      </div>

      {/*No. of SU used */}
      <div className="SUUsedContainer">
        {currentSUUsed} / {suLimit} SUs used
      </div>

      <div className="moduleCardContainer">
        {userModules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            onChange={(updated) => handleUpdateModule(mod.id, updated)}
            onDelete={() => handleDeleteModule(mod.id)}
            disableSU = {!mod.su && currentSUUsed >= suLimit}
          />
        ))}
        <button
        onClick={handleAddModule}
        className="addModButton"
        >
          + Add Module
        </button>
      </div>


    </div>
  );
}