import React, { useState } from "react";
import "./timetable-component.css";

type Lesson = {
  moduleCode: string;
  classNo: string;
  day: string;
  startTime: string;
  endTime: string;
  venue: string;
  lessonType: string;
};

type ModuleCode = "CS1101S" | "CS2030S";

const MODULES: Record<ModuleCode, Lesson[]> = {
  CS1101S: [
    {
      moduleCode: "CS1101S",
      classNo: "L1",
      day: "Monday",
      startTime: "10:00",
      endTime: "12:00",
      venue: "LT19",
      lessonType: "Lecture",
    },
  ],
  CS2030S: [
    {
      moduleCode: "CS2030S",
      classNo: "T01",
      day: "Tuesday",
      startTime: "14:00",
      endTime: "16:00",
      venue: "COM1-0208",
      lessonType: "Tutorial",
    },
    {
      moduleCode: "CS2030S",
      classNo: "T02",
      day: "Wednesday",
      startTime: "10:00",
      endTime: "12:00",
      venue: "COM1-0209",
      lessonType: "Tutorial",
    },
  ],
};

function Timetable({ lessons }: { lessons: Lesson[] }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return (
    <div className="timetable">
      {days.map((day) => (
        <div key={day} className="day-column">
          <h4>{day}</h4>
          {lessons
            .filter((l) => l.day === day)
            .map((lesson, idx) => (
              <div key={idx} className="lesson-block">
                <strong>{lesson.moduleCode}</strong> ({lesson.lessonType})<br />
                {lesson.classNo}<br />
                {lesson.startTime} – {lesson.endTime}<br />
                {lesson.venue}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export function TimetableComponent() {
  const [timetableA, setTimetableA] = useState<Lesson[]>([]);
  const [timetableB, setTimetableB] = useState<Lesson[]>([]);

  const [selectedClassA, setSelectedClassA] = useState<Record<ModuleCode, string>>({
    CS1101S: "L1",
    CS2030S: "T01",
  });

  const [selectedClassB, setSelectedClassB] = useState<Record<ModuleCode, string>>({
    CS1101S: "L1",
    CS2030S: "T01",
  });

  function addToA(mod: ModuleCode) {
    const selected = MODULES[mod].find((l) => l.classNo === selectedClassA[mod]);
    if (selected) {
      setTimetableA((prev) => [...prev, selected]);
    }
  }

  function addToB(mod: ModuleCode) {
    const selected = MODULES[mod].find((l) => l.classNo === selectedClassB[mod]);
    if (selected) {
      setTimetableB((prev) => [...prev, selected]);
    }
  }

  function syncModuleBothWays(mod: ModuleCode) {
    const aHas = timetableA.some((l) => l.moduleCode === mod);
    const bHas = timetableB.some((l) => l.moduleCode === mod);

    if (aHas && !bHas) {
      const toAdd = timetableA.filter((l) => l.moduleCode === mod);
      setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), ...toAdd]);
    } else if (!aHas && bHas) {
      const toAdd = timetableB.filter((l) => l.moduleCode === mod);
      setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), ...toAdd]);
    } else if (aHas && bHas) {
      const source = timetableA.filter((l) => l.moduleCode === mod);
      setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), ...source]);
    } else {
      alert(`Module ${mod} not found in either timetable.`);
    }
  }

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
      {/* Timetable A */}
      <div>
        <h2>Timetable A</h2>
        <Timetable lessons={timetableA} />
        {(["CS1101S", "CS2030S"] as ModuleCode[]).map((mod) => (
          <div key={mod}>
            <select
              value={selectedClassA[mod]}
              onChange={(e) => setSelectedClassA((prev) => ({ ...prev, [mod]: e.target.value }))}
            >
              {MODULES[mod].map((l) => (
                <option key={l.classNo} value={l.classNo}>
                  {mod} {l.classNo} ({l.day} {l.startTime}–{l.endTime})
                </option>
              ))}
            </select>
            <button onClick={() => addToA(mod)}>Add {mod}</button>
          </div>
        ))}
      </div>

      {/* Timetable B */}
      <div>
        <h2>Timetable B</h2>
        <Timetable lessons={timetableB} />
        {(["CS1101S", "CS2030S"] as ModuleCode[]).map((mod) => (
          <div key={mod}>
            <select
              value={selectedClassB[mod]}
              onChange={(e) => setSelectedClassB((prev) => ({ ...prev, [mod]: e.target.value }))}
            >
              {MODULES[mod].map((l) => (
                <option key={l.classNo} value={l.classNo}>
                  {mod} {l.classNo} ({l.day} {l.startTime}–{l.endTime})
                </option>
              ))}
            </select>
            <button onClick={() => addToB(mod)}>Add {mod}</button>
          </div>
        ))}
      </div>

      {/* Sync */}
      <div>
        <h2>Sync</h2>
        {(["CS1101S", "CS2030S"] as ModuleCode[]).map((mod) => (
          <button key={mod} onClick={() => syncModuleBothWays(mod)}>
            Sync {mod}
          </button>
        ))}
      </div>
    </div>
  );
}
