import React from "react";
import { Module } from "../../types";
import CollapseSection from "./CollapseSection";
import "../../App.css";

type Props = {
  userModules: Module[];
};

export default function BzaElective({ userModules }: Props) {
  const MODULE_MC = 4;
  const MAX_MC = 20;

  const FinSpecList: string[] = ["BT3102", "BT4012", "BT4013", "BT4016", "BT4221", "IS4226", "IS4228", "IS4234", "IS4302", "IS4303"];
  const MLSpecList: string[] = ["BT3017", "BT4012", "BT4014", "BT4221", "BT4222", "BT4240", "BT4241", "BT4301", "CS3243", "CS4248", "IS4246"];
  const MktSpecList: string[] = ["BT3017", "BT4014", "BT4015", "BT4211", "BT4212", "BT4222", "IS3150", "IS4241", "IS4262"];
  const SpecDescription: string[] = ["Financial Analytics", "Machine Learning-based Analytics", "Marketing Analytics"];
  const CombinedList: string[][] = [FinSpecList, MLSpecList, MktSpecList];

  const is3x4kFulfilled = userModules.filter(mod => {
          const match = mod.name.match(/\d/);
          return match !== null && match[0] === "4";
          })
      .length >= 3;
  
  const is3xBTFulfilled = userModules.filter(mod => mod.name.startsWith("BT")).length >= 3;

  const counts = CombinedList.map(list => userModules.filter(mod => list.includes(mod.name)).length);
  let output = "";

  if (counts.filter(n => n >= 5).length >= 1) {
    output = "Specialisation(s) completed: ";
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] >= 5) {
        output += SpecDescription[i] + ", "
      }
    }
    output = output.slice(0, output.length - 2);

    let maxIndex = 0;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] >= 5) {
        maxIndex = i;
        break
      }
    }

    userModules = userModules.filter(mod => CombinedList[maxIndex].includes(mod.name)).slice(0, 5);

  } else if (userModules.length <= 5) {
    let maxIndex = 0;
    if (counts[1] > counts[0]) {
      maxIndex = 1;
      if (counts[2] > counts[1]) {
        maxIndex = 2;
      }
    } else if (counts[2] > counts[0]) {
      maxIndex = 2;
    }

    output = "Specialisation in progress: " + SpecDescription[maxIndex] + " (" + counts[maxIndex] + "/5 modules completed)";
    if (counts[0] === 0 && counts[1] === 0 && counts[2] === 0) {
      output = "No specialisation in progress"
    }

    if (userModules.length > 5) {
      const temp = userModules.filter(mod => CombinedList[maxIndex].includes(mod.name));
      const excess = userModules.filter(mod => CombinedList[maxIndex].includes(mod.name));
      userModules = temp;
      const currLength = userModules.length;
      for (let i = 0; i < 5 - currLength; i++) {
        userModules.push(excess[i]);
      }
    }
  }

  // Calculate the total MCs based on the number of modules
  let totalMC = userModules.length * MODULE_MC;
  const completed = totalMC >= MAX_MC && is3x4kFulfilled && is3xBTFulfilled;

  return (
    <CollapseSection
      title="Programme Electives"
      headerExtra={`${totalMC}/${MAX_MC} MC completed`}
      completed={completed}
    >
      <p>{output}</p>
      <ul>
        <li>
          <strong>At least 3 modules at level-4k or above</strong>: {" "}
          {is3x4kFulfilled ? "✅ Fulfilled" : "❌ Not fulfilled"}
        </li>
        <li>
          <strong>At least 3 courses are BT coded courses</strong>: {" "}
          {is3xBTFulfilled ? "✅ Fulfilled" : "❌ Not fulfilled"}
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
