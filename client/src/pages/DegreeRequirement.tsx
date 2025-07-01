import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Module } from "../types";
import {
  GEN, GEC, GEI, GEA, GEX, GESS
} from "../utils/modules";
import GEPillarStatus from "../components/DegReq/1_GEPillar";
import ComputingEthics from "../components/DegReq/2_ComputingEthics";
import CSFoundation from "../components/DegReq/4_CSFoundation";
import MathScience from "../components/DegReq/6_MathScience";
import CDID from "../components/DegReq/3_CDID"
import UE from "../components/DegReq/7_UE";

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

  const GEPILLARS = ["GEA", "GEC", "GEI", "GEN", "GESS", "GEX"];
  const ReqState: number[] = [0, 0, 0, 0, 0, 0, 0, 0];  //gea, gec, gei, gen, gess, gex, id, cd

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

  const Mods_CSFoundation: Module[] = [];
  const Mods_MathScience: Module[] = [];
  const Mods_GEPillar: Module[] = [];
  const Mods_CDID: Module[] = [];
  const Mods_UE: Module[] = [];
  
  const CSFoundationList: string[] = ["CS1231S", "CS2030S", "CS2040S", "CS2100", "CS2101", "CS2103T", "CS2106", "CS2109S", "CS3230"];
  const MathModList: string[] = ["MA1521", "MA1522", "ST2334"];

  // Dynamically require the JSON files
  const CDData = require("../components/DegReq/CD.json");
  const IDData = require("../components/DegReq/ID.json");
  const CD_MODULES = CDData.map((mod: { value: string }) => mod.value);
  const ID_MODULES = IDData.map((mod: { value: string }) => mod.value);

  for (let i = 0; i < userModules.length; i++) {
    const module = userModules[i]; 
    if (module && CSFoundationList.includes(module.name)) {
      Mods_CSFoundation.push(module);
    } else if (module && MathModList.includes(module.name)) {
      Mods_MathScience.push(module);
    } else if (module && GELookup[module.name] && GEPILLARS.includes(GELookup[module.name]) && ReqState[GEPILLARS.indexOf(GELookup[module.name])] == 0) {
      Mods_GEPillar.push(module);
      ReqState[GEPILLARS.indexOf(GELookup[module.name])] = 1;
    } else if (module && ReqState[6] + ReqState[7] < 3 && (ID_MODULES.includes(module.name)|| CD_MODULES.includes(module.name))) {
        if (ID_MODULES.includes(module.name)) {
          Mods_CDID.push(module);
          ReqState[6]++;
        } else if (ReqState[7] == 0) {
          Mods_CDID.push(module);
          ReqState[7] = 1;
        } else {
          Mods_UE.push(module);
        }
    } else if (module && module.name != "IS1108"){
      Mods_UE.push(module);
    }
  }


  if (loading) return <p>Loading degree requirements...</p>;

  return (
    <div>
      <h1>Degree Requirements</h1>
      <GEPillarStatus userModules={Mods_GEPillar} />
      <ComputingEthics userModules={userModules} /> 
      <CDID userModules={Mods_CDID}/>
      <CSFoundation userModules={Mods_CSFoundation} />
      <MathScience userModules={Mods_MathScience} />
      <UE userModules={Mods_UE}/>
    </div>
  );
}
