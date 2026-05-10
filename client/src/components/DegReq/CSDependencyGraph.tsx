import React from "react";
import { Module } from "../../types";
import "./CSDependencyGraph.css";

interface CSDependencyGraphProps {
  userModules: Module[];
}

type DependencyNode = {
  code: string;
  prerequisites: string[];
};

const dependencyGraph: DependencyNode[] = [
  {
    code: "CS1101S",
    prerequisites: [],
  },
  {
    code: "CS1231S",
    prerequisites: [],
  },
  {
    code: "MA1521",
    prerequisites: [],
  },
  {
    code: "CS2100",
    prerequisites: ["CS1101S"],
  },
  {
    code: "CS2030S",
    prerequisites: ["CS1101S"],
  },
  {
    code: "CS2040S",
    prerequisites: ["CS1101S", "CS1231S"],
  },
  {
    code: "ST2334",
    prerequisites: ["MA1521"],
  },
  {
    code: "CS2106",
    prerequisites: ["CS2100"],
  },
  {
    code: "CS2103T",
    prerequisites: ["CS2030S", "CS2040S"],
  },
  {
    code: "CS3230",
    prerequisites: ["CS2040S", "CS1231S"],
  },
  {
    code: "CS2109S",
    prerequisites: ["CS2040S", "CS1231S", "MA1521"],
  },
  
  
];

const getDependencyLabel = (prerequisites: string[]) => {
  if (prerequisites.length === 0) return "Starter";
  if (prerequisites.length === 1) return `Requires ${prerequisites[0]}`;
  return `Requires ${prerequisites.join(", ")}`;
};

const NODE_WIDTH = 278;
const NODE_HEIGHT = 80;
const LEVEL_GAP = 124;
const ROW_GAP = 28;

const getNodeLevel = (
  code: string,
  nodeLookup: Map<string, DependencyNode>,
  memo = new Map<string, number>()
): number => {
  if (memo.has(code)) return memo.get(code)!;

  const node = nodeLookup.get(code);
  if (!node || node.prerequisites.length === 0) {
    memo.set(code, 0);
    return 0;
  }

  const level = Math.max(
    ...node.prerequisites.map((prerequisite) => getNodeLevel(prerequisite, nodeLookup, memo))
  ) + 1;

  memo.set(code, level);
  return level;
};

export default function CSDependencyGraph({ userModules }: CSDependencyGraphProps) {
  const completedModules = new Set(userModules.map((mod) => mod.name));
  const nodeLookup = new Map(dependencyGraph.map((module) => [module.code, module]));
  const levelLookup = new Map(
    dependencyGraph.map((module) => [module.code, getNodeLevel(module.code, nodeLookup)])
  );
  const levels = dependencyGraph.reduce<DependencyNode[][]>((acc, module) => {
    const level = levelLookup.get(module.code) ?? 0;
    acc[level] = acc[level] ?? [];
    acc[level].push(module);
    return acc;
  }, []);
  const positionLookup = new Map<string, { level: number; row: number }>();

  levels.forEach((modules, level) => {
    modules.forEach((module, row) => {
      positionLookup.set(module.code, { level, row });
    });
  });

  const edges = dependencyGraph.flatMap((module) =>
    module.prerequisites.map((prerequisite) => ({
      from: prerequisite,
      to: module.code,
    }))
  );

  const levelCount = Math.max(levels.length, 1);
  const rowCount = Math.max(...levels.map((modules) => modules.length), 1);
  const canvasWidth = levelCount * NODE_WIDTH + (levelCount - 1) * LEVEL_GAP;
  const canvasHeight = rowCount * NODE_HEIGHT + (rowCount - 1) * ROW_GAP;

  return (
    <section className="cs-dependency-graph" aria-label="CS module dependency graph">
      <h2 className="cs-dependency-title">Core Module Dependencies</h2>
      <div className="cs-dependency-map" style={{ width: canvasWidth, height: canvasHeight }}>
        {edges.map((edge) => {
          const fromPosition = positionLookup.get(edge.from);
          const toPosition = positionLookup.get(edge.to);

          if (!fromPosition || !toPosition) return null;

          const x1 = fromPosition.level * (NODE_WIDTH + LEVEL_GAP) + NODE_WIDTH;
          const y1 = fromPosition.row * (NODE_HEIGHT + ROW_GAP) + NODE_HEIGHT / 2;
          const x2 = toPosition.level * (NODE_WIDTH + LEVEL_GAP);
          const y2 = toPosition.row * (NODE_HEIGHT + ROW_GAP) + NODE_HEIGHT / 2;
          const length = Math.hypot(x2 - x1, y2 - y1);
          const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

          return (
            <div
              key={`${edge.from}-${edge.to}`}
              className="cs-dependency-edge"
              style={{
                left: x1,
                top: y1,
                width: length,
                transform: `rotate(${angle}deg)`,
              }}
              aria-hidden="true"
            />
          );
        })}
        {dependencyGraph.map((module) => {
          const isCompleted = completedModules.has(module.code);
          const dependencyLabel = getDependencyLabel(module.prerequisites);
          const position = positionLookup.get(module.code) ?? { level: 0, row: 0 };

          return (
            <div
              key={module.code}
              className={`cs-dependency-node${isCompleted ? " completed" : ""}`}
              style={{
                left: position.level * (NODE_WIDTH + LEVEL_GAP),
                top: position.row * (NODE_HEIGHT + ROW_GAP),
                width: NODE_WIDTH,
              }}
              title={`${module.code}: ${dependencyLabel}`}
            >
              <span className="cs-dependency-code">{module.code}</span>
              <span className="cs-dependency-status">
                {isCompleted ? "Completed" : dependencyLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
