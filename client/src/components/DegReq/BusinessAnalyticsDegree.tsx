import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { Module } from "../../types";
import {
  GEN, GEC, GEI, GEA, GEX, GESS
} from "../../utils/modules";

import GEPillarStatus from "./1_GEPillar";
import ComputingEthics from "./2_ComputingEthics";
import CDID from "./3_CDID";
import BzaCore from "./4_BzaCore";
import CSBreadthDepth from "./5_CSBreadthDepth";
import MathScience from "./6_MathScience";
import UE from "./7_UE";
import "../../pages/DegreeRequirement.css";

interface BusinessAnalyticsDegreeProps {
  userModules: Module[];
}

export default function BusinessAnalyticsDegree({
  userModules: initialModules,
}: BusinessAnalyticsDegreeProps) {
  // 👇 this lets us keep using the exact name `userModules` and mutate it like before
  let userModules = initialModules;

  const totalMC = userModules.map(mod => mod.mc).reduce((a, b) => a + b, 0);
  const colour = totalMC < 40 ? "#9B1313"
                   : totalMC < 80 ? "#EC9706"
                   : totalMC < 120 ? "#EFBF04"
                   : "#4CAF50";

  const GEPILLARS = ["GEA", "GEC", "GEI", "GEN", "GESS", "GEX"];
  const ReqState: number[] = [0, 0, 0, 0, 0, 0, 0, 0];  //gea, gec, gei, gen, gess, gex, id, cd
  const CSBDState: number[] = [0, 8]; //cp, max

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

  //const Mods_CSFoundation: Module[] = [];
  const Mods_MathScience: Module[] = [];
  const Mods_GEPillar: Module[] = [];
  const Mods_CDID: Module[] = [];
  //let Mods_BzaElective: Module[] = [];
  const Mods_UE: Module[] = [];
  
  const BzaCoreMods: string[] = ["BT2101", "BT2102", "CS2030", "CS2040", "IS2101", "BT3103", "IS3103"];
  //const CSFoundationList: string[] = ["CS1231S", "CS2030S", "CS2040S", "CS2100", "CS2101", "CS2103T", "CS2106", "CS2109S", "CS3230"];
  const MathModList: string[] = ["MA1521", "MA1522", "ST2334"];
  

  // Dynamically require the JSON files
  const CDData = require("./CD.json");
  const IDData = require("./ID.json");
  const CD_MODULES = CDData.map((mod: { value: string }) => mod.value);
  const ID_MODULES = IDData.map((mod: { value: string }) => mod.value);

  /*const FYPCode = "CP4101";
  const ATAPCode = "CP3880";
  const SIP = ["CP3200", "CP3202"];
  const hasFYP = userModules.map(mod => mod.name).includes(FYPCode);
  const hasATAP = userModules.map(mod => mod.name).includes(ATAPCode);
  // Instantly push FYP or ATAP. If neither present, push SIP if present
  if (hasFYP || hasATAP) {
    CSBDState[1] = 6;
    if (hasFYP) {
      Mods_BzaElective.push(userModules.filter(mod => mod.name == FYPCode)[0]);
    } else {
      Mods_BzaElective.push(userModules.filter(mod => mod.name == ATAPCode)[0]);
    }
  } else {
    Mods_BzaElective = userModules.filter(mod => SIP.includes(mod.name));
    if (Mods_BzaElective.length == 2) {
      CSBDState[1] = 7;
    }
  }*/

  // Easy fix to sort modules so that it auto balances between modules that can count towards GE or CD/ID
  const tempA = userModules.filter(module => GEPILLARS.includes(GELookup[module.name]) && !(ID_MODULES.includes(module.name)|| CD_MODULES.includes(module.name)));
  const tempB = userModules.filter(module => !(GEPILLARS.includes(GELookup[module.name]) && !(ID_MODULES.includes(module.name)|| CD_MODULES.includes(module.name))));
  userModules = tempA.concat(tempB);

  for (let i = 0; i < userModules.length; i++) {
    const module = userModules[i];

    // If there is FYP, all internship modules go to UE
    // If there is no FYP, if there is ATAP, the other internship modules go to UE
    /*if (module.name == FYPCode) continue;
    else if (hasFYP) {
      if (module.name == ATAPCode || SIP.includes(module.name)) {
        Mods_UE.push(module);
        continue;
      } 
    } else if (hasATAP) {
      if (module.name == ATAPCode) continue;
      else if (SIP.includes(module.name)) {
        Mods_UE.push(module);
        continue;
      }
    } else {
      if (SIP.includes(module.name)) continue;
    }*/

    if (BzaCoreMods.includes(module.name)) {
      //Mods_CSFoundation.push(module);
      //Mods_BzaElective.push(module);
    } else if (MathModList.includes(module.name)) {
      Mods_MathScience.push(module);
    } else if (GELookup[module.name] && GEPILLARS.includes(GELookup[module.name]) && ReqState[GEPILLARS.indexOf(GELookup[module.name])] == 0) {
      Mods_GEPillar.push(module);
      ReqState[GEPILLARS.indexOf(GELookup[module.name])] = 1;
    } else if (ReqState[6] + ReqState[7] < 3 && (ID_MODULES.includes(module.name)|| CD_MODULES.includes(module.name))) {
        if (ID_MODULES.includes(module.name)) {
          Mods_CDID.push(module);
          ReqState[6]++;
        } else if (ReqState[7] == 0) {
          Mods_CDID.push(module);
          ReqState[7] = 1;
        } else {
          Mods_UE.push(module);
        }
    //} else if (module.name.substring(0, 2) == "CS" || module.name.substring(0, 3)  == "IFS") {
      //Mods_BzaElective.push(module);
    //} else if (module.name.substring(0, 2) == "CP" && CSBDState[0] < 3) {
      //Mods_BzaElective.push(module);
      //CSBDState[0]++;
    } else if (module.name != "IS1108") {
      Mods_UE.push(module);
    }
  }

  function getFirstDigit(name: string): number {
    const match = name.match(/\d/);
    return parseInt(match![0], 10); 
  }

  const compareByFirstDigitDesc = (a: Module, b: Module): number => {
    return getFirstDigit(b.name) - getFirstDigit(a.name);
  };

  /*let ToSort: Module[] = Mods_BzaElective;
  let kept: Module[] = [];
  if (Mods_BzaElective.length >= 1 && (Mods_BzaElective[0].name == FYPCode || Mods_BzaElective[0].name == ATAPCode || SIP.includes(Mods_BzaElective[0].name))) {
    ToSort = Mods_BzaElective.slice(1, Mods_BzaElective.length);
    kept = Mods_BzaElective.slice(0, 1);
    if (Mods_BzaElective.length >= 2 && SIP.includes(Mods_BzaElective[1].name)) {
      ToSort = Mods_BzaElective.slice(2, Mods_BzaElective.length);
      kept = Mods_BzaElective.slice(0, 2);
    }
  }

  ToSort = [...ToSort].sort(compareByFirstDigitDesc);
  Mods_BzaElective = kept.concat(ToSort);

  const leftoverCSBD = Mods_BzaElective.filter(mod => !BzaCore.includes(mod.name));
  for (let i = CSBDState[1]; i < leftoverCSBD.length; i++) {
    Mods_UE.push(leftoverCSBD[i]);
  }*/

  const excluded = ["CFG1002", "CFG1004", "CFG1500", "CFG1600", "ES1103"];
  const mod1k = userModules.filter(mod => mod.name.charAt(mod.name.search(/\d/)) === "1" && !excluded.includes(mod.name)).length;

  return (
    <div>
      <div className="dashboard container">
        <CircularProgressbar 
          value={totalMC/160 * 100}
          strokeWidth={15}
          styles={buildStyles({
            pathColor: colour,
          })}
        />
        <div className="dashboard-mc"><strong>{totalMC}/160 MC completed</strong></div>
      </div>
      <div className="deg-req-card">Count of 1k modules: {mod1k}/15</div>
      <GEPillarStatus userModules={Mods_GEPillar} />
      <ComputingEthics userModules={userModules} /> 
      <CDID userModules={Mods_CDID}/>
      <BzaCore userModules={userModules}/>
      <MathScience userModules={Mods_MathScience} />
      <UE userModules={Mods_UE}/>
    </div>
  );
}
