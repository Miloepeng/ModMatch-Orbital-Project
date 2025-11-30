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
import BzaElective from "./5_BzaElective";
import MathScience from "./6_MathScience";
import UE from "./7_UE";
import "../../pages/DegreeRequirement.css";

interface BusinessAnalyticsDegreeProps {
  userModules: Module[];
}

export default function BusinessAnalyticsDegree({
  userModules: initialModules,
}: BusinessAnalyticsDegreeProps) {
  // this lets us keep using the exact name `userModules` and mutate it like before
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

  const Mods_BzaCore: Module[] = [];
  const Mods_MathScience: Module[] = [];
  const Mods_GEPillar: Module[] = [];
  const Mods_CDID: Module[] = [];
  const Mods_BzaElective: Module[] = [];
  const Mods_UE: Module[] = [];
  
  const BzaCoreMods: string[] = ["BT2101", "BT2102", "CS2030", "CS2040", "IS2101", "BT3103", "IS3103", "BT4103"];
  const IndustryExp: string[] = ["BT4101", "IS4010", "CP3880"]
  const MathModList: string[] = ["MA1521", "MA1522", "ST2334"];
  const FinSpecList: string[] = ["BT3102", "BT4012", "BT4013", "BT4016", "BT4221", "IS4226", "IS4228", "IS4234", "IS4302", "IS4303"];
  const MLSpecList: string[] = ["BT3017", "BT4012", "BT4014", "BT4221", "BT4222", "BT4240", "BT4241", "BT4301", "CS3243", "CS4248", "IS4246"];
  const MktSpecList: string[] = ["BT3017", "BT4014", "BT4015", "BT4211", "BT4212", "BT4222", "IS3150", "IS4241", "IS4262"];
  const BzaSpecList = new Set(FinSpecList.concat(MLSpecList).concat(MktSpecList));

  // Dynamically require the JSON files
  const CDData = require("./CD.json");
  const IDData = require("./ID.json");
  const CD_MODULES = CDData.map((mod: { value: string }) => mod.value);
  const ID_MODULES = IDData.map((mod: { value: string }) => mod.value);

  function getFirstDigit(name: string): number {
    const match = name.match(/\d/);
    return parseInt(match![0], 10); 
  }
  
  const compareByFirstDigitDesc = (a: Module, b: Module): number => {
    return getFirstDigit(b.name) - getFirstDigit(a.name);
  };

  // Deal with industry experience first
  let filteredIE: Module[] = userModules.filter(mod => IndustryExp.includes(mod.name));
  for (let i = 0; i < filteredIE.length; i++) {
    if (i == 0) {
      Mods_BzaCore.push(filteredIE[i])
    } else {
      Mods_UE.push(filteredIE[i])
    }
  }
  userModules = userModules.filter(mod => !IndustryExp.includes(mod.name));

  // Deal with electives
  let ElectiveMods: Module[] = userModules.filter(mod => BzaSpecList.has(mod.name));
  ElectiveMods.sort(compareByFirstDigitDesc);
  if (ElectiveMods.length <= 5) {
    ElectiveMods.forEach(mod => Mods_BzaElective.push(mod));
    userModules = userModules.filter(mod => !ElectiveMods.includes(mod));
  } else {
    const counts = [0, 0, 0];
    const ModList: Module[][] = [];
    const ModNameList: string[][] = [FinSpecList, MLSpecList, MktSpecList];
    counts[0] = ElectiveMods.filter(mod => FinSpecList.includes(mod.name)).length;
    counts[1] = ElectiveMods.filter(mod => MLSpecList.includes(mod.name)).length;
    counts[2] = ElectiveMods.filter(mod => MktSpecList.includes(mod.name)).length;
    ModList.push(ElectiveMods.filter(mod => FinSpecList.includes(mod.name)));
    ModList.push(ElectiveMods.filter(mod => MLSpecList.includes(mod.name)));
    ModList.push(ElectiveMods.filter(mod => MktSpecList.includes(mod.name)));

    let completed = false;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] >= 5) {   
        ModList[i].slice(0, 5)
            .filter(mod => !Mods_BzaElective.includes(mod))
            .forEach(mod => Mods_BzaElective.push(mod));
        completed = true;
      }
    }
    
    if (completed) {
      for (let i = 0; i < counts.length; i++) {
        if (counts[i] >= 5) {
          userModules = userModules.filter(mod => !ModList[i].slice(0, 5).includes(mod));
          break;
        }
      }
    } else {
      // If no specialization completed
      let maxIndex = 0;
      if (counts[1] > counts[0]) {
        maxIndex = 1;
        if (counts[2] > counts[1]) {
          maxIndex = 2;
        }
      } else if (counts[2] > counts[0]) {
        maxIndex = 2;
      }

      ModList[maxIndex].forEach(mod => Mods_BzaElective.push(mod));
      userModules = userModules.filter(mod => !ModList[maxIndex].includes(mod));
      ElectiveMods = ElectiveMods.filter(mod => !ModNameList[maxIndex].includes(mod.name));
      const needed = 5 - Mods_BzaElective.length;
      for (let i = 0; i < needed; i++) {
        Mods_BzaElective.push(ElectiveMods[0]);
        userModules = userModules.filter(mod => mod != ElectiveMods[0]);
        ElectiveMods.splice(0, 1);
      }
      ElectiveMods.forEach(mod => Mods_UE.push(mod));
    }

    
    }
    const temp1 = Mods_BzaElective.filter(mod => {
          const match = mod.name.match(/\d/);
          return match !== null && match[0] === "4";
    }).length;
  if (temp1 < 3) {
    ElectiveMods.filter(mod => {
            const match = mod.name.match(/\d/);
            return match !== null && match[0] === "4";
      })
      .filter(mod => !Mods_BzaElective.includes(mod))
      .forEach(mod => Mods_BzaElective.push(mod));
    }
    
    if (Mods_BzaElective.filter(mod => mod.name.startsWith("BT")).length < 3) {
      ElectiveMods.filter(mod => mod.name.startsWith("BT"))
          .filter(mod => !Mods_BzaElective.includes(mod))
          .forEach(mod => Mods_BzaElective.push(mod));
    }

  Mods_BzaElective.sort(compareByFirstDigitDesc);

  // Easy fix to sort modules so that it auto balances between modules that can count towards GE or CD/ID
  const tempA = userModules.filter(module => GEPILLARS.includes(GELookup[module.name]) && !(ID_MODULES.includes(module.name)|| CD_MODULES.includes(module.name)));
  const tempB = userModules.filter(module => !(GEPILLARS.includes(GELookup[module.name]) && !(ID_MODULES.includes(module.name)|| CD_MODULES.includes(module.name))));
  userModules = tempA.concat(tempB);

  for (let i = 0; i < userModules.length; i++) {
    const module = userModules[i];

    if (BzaCoreMods.includes(module.name)) {
      Mods_BzaCore.push(module);
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
    } else if (module.name != "IS1108") {
      Mods_UE.push(module);
    }
  }

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
      <BzaCore userModules={Mods_BzaCore}/>
      <BzaElective userModules={Mods_BzaElective}/>
      <MathScience userModules={Mods_MathScience} />
      <UE userModules={Mods_UE}/>
    </div>
  );
}
