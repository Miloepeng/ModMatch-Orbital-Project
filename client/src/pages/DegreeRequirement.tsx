import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Module } from "../types";
import GEPillarStatus from "../components/DegReq/1_GEPillar";
import ComputingEthics from "../components/DegReq/2_ComputingEthics";
import CSFoundation from "../components/DegReq/4_CSFoundation";
import MathScience from "../components/DegReq/6_MathScience";
import CDID from "../components/DegReq/3_CDID"

export default function DegReqPage() {
  const [userModules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div>
      <h1>Degree Requirements</h1>
      <GEPillarStatus userModules={userModules} />
      <ComputingEthics userModules={userModules} /> 
      <CDID userModules={userModules}/>
      <CSFoundation userModules={userModules} />
      <MathScience userModules={userModules} />
    </div>
  );
}
