//Maps string grade to numbers to calculate CAP
import { Module } from "../types";

export const gradePoints: Record<string, number> = {
  "A+": 5.0,
  "A": 5.0,
  "A-": 4.5,
  "B+": 4.0,
  "B": 3.5,
  "B-": 3.0,
  "C+": 2.5,
  "C": 2.0,
  "D+": 1.5,
  "D": 1.0,
  "F": 0.0,
  "S": NaN, 
  "U": NaN,
};

export function calculateCAP(modules: Module[]): string {
  let totalPoints = 0;
  let totalMCs = 0;

  for (const mod of modules) {
    const points = gradePoints[mod.grade];
    const mcs = mod.is2MC ? 2 : 4;

    if (!mod.su && points >= 0) {
      totalPoints += points * mcs;
      totalMCs += mcs;
    }
  }

  return totalMCs > 0 ? (totalPoints / totalMCs).toFixed(2) : "N/A";
}