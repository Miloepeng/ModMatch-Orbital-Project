import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function CSBreadthDepth({ userModules }: Props) {
  const MODULE_MC = 4;
  const MAX_MC = 32;

  const FA1_Algo: string[] = ["CS3230", "CS3231", "CS3236", "CS4231", "CS4232", "CS4234"];
  const FA2_AI: string[] = ["CS2109S", "CS3243", "CS3244", "CS3263", "CS3264", "CS4243", "CS4244", "CS4246", "CS4248"];
  const FA3_GraphicsGames: string[] = ["CS3241", "CS3242", "CS3247", "CS4247", "CS4350"];
  const FA4_Sec: string[] = ["CS2107", "CS3235", "CS4236", "CS4230", "CS4238", "CS4239"];
  const FA5_Database: string[] = ["CS2102", "CS3223", "CS4221", "CS4224", "CS4225"];
  const FA6_Multimedia: string[] = ["CS2108", "CS3245", "CS4242", "CS4248", "CS4347"];
  const FA7_Network: string[] = ["CS2105", "CS3103", "CS4222", "CS4226", "CS4231"];
  const FA8_Parallel: string[] = ["CS3210", "CS3211", "CS4231", "CS4223"];
  const FA9_ProgLangs: string[] = ["CS2104", "CS3211", "CS4212", "CS4215"];
  const FA10_SWE: string[] = ["CS2103T", "CS3213", "CS3219", "CS4211", "CS4218", "CS4239"];
  const FAList: string[][] = [FA1_Algo, FA2_AI, FA3_GraphicsGames, FA4_Sec, FA5_Database, FA6_Multimedia, FA7_Network, FA8_Parallel, FA9_ProgLangs, FA10_SWE];
  const FADescription: string[] = ["Algorithms & Theory", "Artificial Intelligence", "Computer Graphics and Games", "Computer Security",
    "Database Systems", "Multimedia Information Retrieval", "Networking and Distributed Systems", "Parallel Computing", 
    "Programming Languages", "Software Engineering"];

  const FAProgress: number[][] = [];
  for (let i = 0; i < FAList.length; i++) {
    FAProgress.push([0, 0]);
  }

  for (let j = 0; j < userModules.length; j++) {
    const module = userModules[j];
    for (let k = 0; k < FAList.length; k++) {
      if (module && FAList[k].includes(module.name)) {
        FAProgress[k][0]++;
        if (module.name[2] == "4") {
          FAProgress[k][1] = 1;
        }
      }
    }
  }

  let output: string = "";
  // Check if any Focus Area(s) has been completed
  if (FAProgress.filter(arr => arr[0] >= 3 && arr[1] == 1).length != 0) {
    const idx_array = FAProgress.map((arr, idx) => (arr[0] >= 3 && arr[1] == 1 ? idx: -1)).filter(idx => idx != -1);
    output = idx_array.reduce((item, idx) => item + FADescription[idx] + ", ", "Focus Area(s) completed: ");
    output = output.slice(0, output.length - 2);
  } else {
    // Find Focus Areas that are close to completion
    const closest = FAProgress.reduce((item, arr) => arr[0] > item[0] ? arr: item, FAProgress[0])[0];
    if (closest != 0) {
      const idx_array = FAProgress.map((arr, idx) => arr[0] == closest ? idx : -1).filter(idx => idx != -1);
      output = idx_array.reduce((item, idx) => item + FADescription[idx] + ", ", "Focus Area(s) in progress: ");
      output = output.slice(0, output.length - 2);
      output += " (" + closest.toString() + "/3 modules completed)"
    } else {
      output = "No Focus Areas in progress.";
    }
  }

  //Remove core modules after filtering through FA
  const CSFoundationList: string[] = ["CS1231S", "CS2030S", "CS2040S", "CS2100", "CS2101", "CS2103T", "CS2106", "CS2109S", "CS3230"];
  userModules = userModules.filter(mod => !CSFoundationList.includes(mod.name));

  const is3x4kFulfilled = userModules.filter(mod => {
    const match = mod.name.match(/\d/);
    return match !== null && match[0] === "4";
  })
  .length >= 3;

  const internFulfilled = userModules.filter(mod => ["CP4101", "CP3880", "CP3200", "CP3202"].includes(mod.name)).length >= 1;

  if (userModules.length >= 1 && (userModules[0].name == "CP4101" || userModules[0].name == "CP3880")) {
    userModules = userModules.slice(0, 6);
  } else if (userModules.length >= 2 && ["CP3200", "CP3202"].includes(userModules[0].name) && ["CP3200", "CP3202"].includes(userModules[1].name)) {
    userModules = userModules.slice(0, 7);
  } else if (userModules.length >= 1 && ["CP3200", "CP3202"].includes(userModules[0].name)) {
    userModules = userModules.slice(0, 8);
  }
 


  // Calculate the total MCs based on the number of modules
  let totalMC = userModules.length * MODULE_MC;
  for (let i = 0; i < userModules.length; i++) {
    const module = userModules[i];
    if (module.name == "CP4101" || module.name == "CP3880") {
      totalMC += 8;
    } else if (module.name == "CP3200" || module.name == "CP3202") {
      totalMC += 2;
    }
  }

  return (
    <CollapseSection
      title="CS Breadth and Depth"
      headerExtra={`${totalMC}/${MAX_MC} MC completed`}
    >
      <p>{output}</p>
      <ul>
        <li>
          <strong>At least 3 modules at level-4k or above</strong>: {" "}
          {is3x4kFulfilled ? "✅ Fulfilled" : "❌ Not fulfilled"}
        </li>
        <li>
          <strong>Industry Experience</strong>: {" "}
          {internFulfilled ? "✅ Fulfilled" : "❌ Not fulfilled"}
        </li>
      </ul>
      
      <div className="deg-req-modules">
      <h3>Modules completed:</h3>
      <ul className="deg-req-list">
        {userModules.map((mod) => (
          <li key={mod.id} className="deg-req-item">
            <strong>{mod.name}</strong>
          </li>
        ))}
      </ul>
      </div>
    </CollapseSection>
  );
}
