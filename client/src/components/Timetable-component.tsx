import React, { useState } from "react";
import "./timetable-component.css";
import moduleData from "../utils/Timetable.json";
import { useEffect } from "react";

type Lesson = {
  moduleCode: string;
  classNo: string;
  day: string;
  weeks: number[];
  startTime: string;
  endTime: string;
  venue: string;
  lessonType: string;
  covidZone: string;
};

//Format from timetable.json
type RawModule = {
  moduleCode: string;
  semesterData: {
    semester: number;
    timetable: Omit<Lesson, "moduleCode">[];
  }[];
};

//Only need sem data
const MODULES: Record<string, Lesson[]> = Object.fromEntries(
  (moduleData as RawModule[]).map((mod) => {
    const semester1 = mod.semesterData.find((s) => s.semester === 1);
    const lessons: Lesson[] = (semester1?.timetable || []).map((l) => ({
      ...l,
      moduleCode: mod.moduleCode,
      startTime: l.startTime.replace(/(\d{2})(\d{2})/, "$1:$2"),
      endTime: l.endTime.replace(/(\d{2})(\d{2})/, "$1:$2"),
    }));
    return [mod.moduleCode, lessons];
  })
);

type ModuleCode = keyof typeof MODULES;



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
                {lesson.venue}<br />
                Weeks: {lesson.weeks.join(", ")}<br />
                Zone: {lesson.covidZone}
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

  const [searchCodeA, setSearchCodeA] = useState("");
  const [searchCodeB, setSearchCodeB] = useState("");

  const [selectedClassA, setSelectedClassA] = useState<Record<string, string>>({});
  const [selectedClassB, setSelectedClassB] = useState<Record<string, string>>({});

  const [activeModulesA, setActiveModulesA] = useState<string[]>([]);
  const [activeModulesB, setActiveModulesB] = useState<string[]>([]);

  const [addedModulesA, setAddedModulesA] = useState<string[]>([]);
  const [addedModulesB, setAddedModulesB] = useState<string[]>([]);

  const [syncedModules, setSyncedModules] = useState<string[]>([]);

  const moduleCodes = Object.keys(MODULES);
  const filteredModuleCodesA = searchCodeA
    ? moduleCodes.filter((code) =>
      code.toLowerCase().includes(searchCodeA.toLowerCase())
    )
    .slice(0,3)
    : [];
  
  const filteredModuleCodesB = searchCodeB
    ? moduleCodes.filter((code) =>
      code.toLowerCase().includes(searchCodeB.toLowerCase())
    )
    .slice(0,3)
    : [];

  useEffect(() => {
  if (searchCodeA in MODULES && !selectedClassA[searchCodeA]) {
    setSelectedClassA((prev) => ({
      ...prev,
      [searchCodeA]: MODULES[searchCodeA][0]?.classNo ?? "",
    }));
  }
}, [searchCodeA]);

useEffect(() => {
  if (searchCodeB in MODULES && !selectedClassB[searchCodeB]) {
    setSelectedClassB((prev) => ({
      ...prev,
      [searchCodeB]: MODULES[searchCodeB][0]?.classNo ?? "",
    }));
  }
}, [searchCodeB]);

  function addToA(mod: string) {
    const selected = MODULES[mod]?.find((l) => l.classNo === selectedClassA[mod]);
    if (selected) {
      setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
      setAddedModulesA((prev) => Array.from(new Set([...prev, mod])));

      if (syncedModules.includes(mod)) {
        setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
        setAddedModulesA((prev) => Array.from(new Set([...prev, mod])));
      }
    }
  }

  function addToB(mod: string) {
    const selected = MODULES[mod]?.find((l) => l.classNo === selectedClassB[mod]);
    if (selected) {
      setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
      setAddedModulesB((prev) => Array.from(new Set([...prev, mod])));

      if (syncedModules.includes(mod)) {
        setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
        setAddedModulesB((prev) => Array.from(new Set([...prev, mod])));
      }
    }
  }

  function toggleSync(mod: string) {
    const isSynced = syncedModules.includes(mod);

    if (isSynced) {
      // UNSYNC: Remove from synced list only
      setSyncedModules((prev) => prev.filter((m) => m !== mod));
    } else {
      // SYNC: Copy data both ways and enable syncing
      const aHas = timetableA.some((l) => l.moduleCode === mod);
      const bHas = timetableB.some((l) => l.moduleCode === mod);

      if (aHas && !bHas) {
        const toAdd = timetableA.filter((l) => l.moduleCode === mod);
        setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), ...toAdd]);
      } else if (!aHas && bHas) {
        const toAdd = timetableB.filter((l) => l.moduleCode === mod);
        setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), ...toAdd]);
      }

      setSyncedModules((prev) => [...prev, mod]);
      setAddedModulesA((prev) => Array.from(new Set([...prev, mod])));
      setAddedModulesB((prev) => Array.from(new Set([...prev, mod])));
      setActiveModulesA((prev) => Array.from(new Set([...prev, mod])));
      setActiveModulesB((prev) => Array.from(new Set([...prev, mod])));
      setSelectedClassA((prev) => ({
        ...prev,
        [mod]: MODULES[mod][0]?.classNo ?? "",
      }));
      setSelectedClassB((prev) => ({
        ...prev,
        [mod]: MODULES[mod][0]?.classNo ?? "",
      }));
    }
  }




  const uniqueModuleCodes = Array.from(
  new Set([...timetableA, ...timetableB].map((l) => l.moduleCode))
  );

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
      {/* Timetable A */}
      <div>
        <h2>Timetable A</h2>
        <Timetable lessons={timetableA} />

        <input
          placeholder="Search module (e.g. CS2030S)"
          value={searchCodeA}
          onChange={(e) => setSearchCodeA(e.target.value)}
          style={{ marginBottom: "0.5rem" }}
        />
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {filteredModuleCodesA.map((code) => (
        <li key={code}>
        <button
          onClick={() => {
            if (!activeModulesA.includes(code)) {
              setActiveModulesA((prev) => [...prev, code]);
              setSelectedClassA((prev) => ({
                ...prev,
                [code]: MODULES[code][0]?.classNo ?? "",
             }));
            }
            setSearchCodeA(""); // clear after select
          }}
        >
         {code}
        </button>
      </li>
      ))}
      </ul>

        {activeModulesA.map((mod) => {
          const isAdded = addedModulesA.includes(mod);
          return (
            <div key={mod} style={{ marginTop: "0.5rem" }}>
            <select
              value={selectedClassA[mod] || ""}
              onChange={(e) => {
              const classNo = e.target.value;
              setSelectedClassA((prev) => ({ ...prev, [mod]: classNo }));

              if (addedModulesA.includes(mod)) {
                const selected = MODULES[mod]?.find((l) => l.classNo === classNo);
                if (selected) {
                  setTimetableA((prev) => [
                  ...prev.filter((l) => l.moduleCode !== mod),
                  selected,
                  ]);
                  if (syncedModules.includes(mod)) {
                    setTimetableB((prev) => [
                    ...prev.filter((l) => l.moduleCode !== mod),
                    selected,
                    ]);
                    setSelectedClassB((prev) => ({
                    ...prev,
                    [mod]: selected.classNo,
                }));
                }
                }
              }
              }}
              >
              {MODULES[mod].map((l) => (
              <option key={l.classNo} value={l.classNo}>
                {mod} {l.classNo} ({l.day} {l.startTime}–{l.endTime})
              </option>
              ))}
            </select>

          {isAdded ? (
            <button
              onClick={() => {
              setTimetableA((prev) => prev.filter((l) => l.moduleCode !== mod));
              setAddedModulesA((prev) => prev.filter((m) => m !== mod));

              if (syncedModules.includes(mod)) {
                setTimetableB((prev) => prev.filter((l) => l.moduleCode !== mod));
                setAddedModulesB((prev) => prev.filter((m) => m !== mod));
                }
              }}
            >
            Remove {mod}
            </button>
          ) : (
          <button
            onClick={() => {
            const selected = MODULES[mod]?.find((l) => l.classNo === selectedClassA[mod]);
            if (selected) {
              setTimetableA((prev) => [...prev, selected]);
              setAddedModulesA((prev) => [...prev, mod]);
            }
          }}
          >
            Add {mod}
          </button>
        )}
    </div>
  );
})}
      </div>

      {/* Timetable B */}
      <div>
        <h2>Timetable B</h2>
        <Timetable lessons={timetableB} />

        <input
          placeholder="Search module (e.g. CS2030S)"
          value={searchCodeB}
          onChange={(e) => setSearchCodeB(e.target.value)}
          style={{ marginBottom: "0.5rem" }}
        />
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {filteredModuleCodesB.map((code) => (
        <li key={code}>
        <button
          onClick={() => {
            if (!activeModulesB.includes(code)) {
              setActiveModulesB((prev) => [...prev, code]);
              setSelectedClassB((prev) => ({
                ...prev,
                [code]: MODULES[code][0]?.classNo ?? "",
             }));
            }
            setSearchCodeB(""); // clear after select
          }}
        >
         {code}
        </button>
      </li>
      ))}
      </ul>

        {activeModulesB.map((mod) => {
          const isAdded = addedModulesB.includes(mod);
          return (
            <div key={mod} style={{ marginTop: "0.5rem" }}>
              <select
              value={selectedClassB[mod] || ""}
              onChange={(e) => {
              const classNo = e.target.value;
              setSelectedClassB((prev) => ({ ...prev, [mod]: classNo }));

              if (addedModulesB.includes(mod)) {
                const selected = MODULES[mod]?.find((l) => l.classNo === classNo);
                if (selected) {
                  setTimetableB((prev) => [
                  ...prev.filter((l) => l.moduleCode !== mod),
                  selected,
                  ]);
                  if (syncedModules.includes(mod)) {
                    setTimetableA((prev) => [
                    ...prev.filter((l) => l.moduleCode !== mod),
                    selected,
                    ]);
                    setSelectedClassA((prev) => ({
                    ...prev,
                    [mod]: selected.classNo,
                }));
                }
                }
              }
              }}
              >
              {MODULES[mod].map((l) => (
              <option key={l.classNo} value={l.classNo}>
                {mod} {l.classNo} ({l.day} {l.startTime}–{l.endTime})
              </option>
              ))}
            </select>

            {isAdded ? (
              <button
                onClick={() => {
                setTimetableB((prev) => prev.filter((l) => l.moduleCode !== mod));
                setAddedModulesB((prev) => prev.filter((m) => m !== mod));

                if (syncedModules.includes(mod)) {
                  setTimetableA((prev) => prev.filter((l) => l.moduleCode !== mod));
                  setAddedModulesA((prev) => prev.filter((m) => m !== mod));
                }
              }}
              >
                Remove {mod}
              </button>
              ) : (
              <button
                onClick={() => {
                  const selected = MODULES[mod]?.find((l) => l.classNo === selectedClassB[mod]);
                  if (selected) {
                    setTimetableB((prev) => [...prev, selected]);
                    setAddedModulesB((prev) => [...prev, mod]);
                  }
                }}
                >
                Add {mod}
              </button>
                )}
        </div>
          );
          })}
      </div>

      {/* Sync */}
      <div>
        <h2>Sync</h2>
        {uniqueModuleCodes.map((mod: string) => (
      <button key={mod} onClick={() => toggleSync(mod)}>
        {syncedModules.includes(mod) ? `Unsync ${mod}` : `Sync ${mod}`}
      </button>
        ))}
      </div>
    </div>
  );
}
