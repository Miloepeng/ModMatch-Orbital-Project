import React, { useEffect, useState } from "react";
import 'react-circular-progressbar/dist/styles.css';
import { supabase } from "../supabaseClient";
import { Module } from "../types";
import ComputerScienceDegree from "../components/DegReq/ComputerScienceDegree";
import BusinessAnalyticsDegree from "../components/DegReq/BusinessAnalyticsDegree";
import '../pages/DegreeRequirement.css';

export default function DegReqPage() {
  let [userModules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDegree, setSelectedDegree] = useState<"CS" | "BZA">("CS");

  useEffect(() => {
    const fetchModules = async () => {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (!user) {
            console.error("No user logged in.");
            setModules([]);
            setLoading(false);
            return;
        }

        const { data: modData, error } = await supabase
            .from("module_selections")
            .select("modules_json")
            .eq("user_id", user.id)
            .single();

        if (error) {
            console.error("Error fetching modules:", error);
            setModules([]);
        } else {
            setModules(modData?.modules_json || []);
        }

        setLoading(false);
        };
    fetchModules();
  }, []);



  if (loading) return <p>Loading degree requirements...</p>;

  return (
    <>
      <div className="mid-section">
        <h1 className="mid-section-title">Degree Requirements</h1>

        <div className="deg-req-degree-select">
          <label htmlFor="degree-select" style={{ marginRight: "0.5rem" }}>
            Degree:
          </label>
          <select
            id="degree-select"
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value as "CS" | "BZA")}
          >
            <option value="CS">BComp (Computer Science)</option>
            <option value="BZA">BSc (Business Analytics)</option>
          </select>
        </div>

        <p className="mid-section-content">
          Check what modules you need to complete your degree
        </p>
      </div>
      {/* ⚠️ NEW: instead of all the CS logic + JSX here, delegate to CS component */}
      {selectedDegree === "CS" && (
        <ComputerScienceDegree userModules={userModules} />
      )}

      {selectedDegree == "BZA" && (
        <BusinessAnalyticsDegree userModules={userModules} />
      )}
    </>
  );
}
