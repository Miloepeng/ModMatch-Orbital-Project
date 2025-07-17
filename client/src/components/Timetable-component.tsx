import React, { useState } from "react";
import "./timetable-component.css";
import moduleData from "../utils/Timetable.json";
import { useEffect } from "react";
import { supabase } from "../supabaseClient";

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

async function saveTimetable(userId: string, name: "A" | "B", lessons: Lesson[]) {
  if (!lessons.length) return; // Do not save empty data

  const { error } = await supabase
    .from("timetables")
    .upsert(
      lessons.map((lesson) => ({
        user_id: userId,
        timetable_name: name,
        module_code: lesson.moduleCode,
        class_no: lesson.classNo,
        day: lesson.day,
        start_time: lesson.startTime,
        end_time: lesson.endTime,
        venue: lesson.venue,
        lesson_type: lesson.lessonType,
        weeks: lesson.weeks,
        covid_zone: lesson.covidZone,
      })),
      {
        onConflict: "user_id, timetable_name, module_code, lesson_type"
      }
    );

  if (error) {
  console.error("Supabase upsert error:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  alert(`Save failed: ${error.message}`);
  throw error;
}
}

async function loadTimetable(userId: string, name: "A" | "B"): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("timetables")
    .select("*")
    .eq("user_id", userId)
    .eq("timetable_name", name);

  if (error) throw error;

  return data.map((row) => ({
    moduleCode: row.module_code,
    classNo: row.class_no,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue,
    lessonType: row.lesson_type,
    weeks: row.weeks,
    covidZone: row.covid_zone,
  }));
}

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

  const [userId, setUserId] = useState<string | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

useEffect(() => {
  const loadUserTimetables = async (userId: string) => {
    const [a, b] = await Promise.all([
      loadTimetable(userId, "A"),
      loadTimetable(userId, "B"),
    ]);
    setTimetableA(a);
    setTimetableB(b);
    
    setAddedModulesA(a.map((lesson) => lesson.moduleCode));  
    setAddedModulesB(b.map((lesson) => lesson.moduleCode));

    // Make sure to set selectedClass states after loading the modules
    setSelectedClassA((prev) => {
      const updatedClass = { ...prev };
      a.forEach((lesson) => {
        updatedClass[lesson.moduleCode] = lesson.classNo;
      });
      return updatedClass;
    });

    setSelectedClassB((prev) => {
      const updatedClass = { ...prev };
      b.forEach((lesson) => {
        updatedClass[lesson.moduleCode] = lesson.classNo;
      });
      return updatedClass;
    });

    setActiveModulesA(Array.from(new Set(a.map((l) => l.moduleCode))));
    setActiveModulesB(Array.from(new Set(b.map((l) => l.moduleCode))));

    setLoaded(true);
  };

  // Fetch data when the user is logged in
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      loadUserTimetables(user.id);
    }
  });
}, [userId]);

useEffect(() => {
  const autosaveTimetables = async () => {
    if (!userId || !loaded) return;  // Wait for load before autosaving

    try {
      await Promise.all([
        saveTimetable(userId, "A", timetableA),
        saveTimetable(userId, "B", timetableB),
      ]);
    } catch (error) {
      console.error("Autosave failed:", error);
    }
  };

  autosaveTimetables();
}, [timetableA, timetableB, userId, loaded]);

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

  async function addToA(mod: string) {
    const selected = MODULES[mod]?.find((l) => l.classNo === selectedClassA[mod]);
    if (selected) {
      const updated = [...timetableA.filter((l) => l.moduleCode !== mod), selected];
      setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
      setAddedModulesA((prev) => Array.from(new Set([...prev, mod])));

      if (syncedModules.includes(mod)) {
        setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
        setAddedModulesA((prev) => Array.from(new Set([...prev, mod])));
      }

      if (userId) {
      await saveTimetable(userId, "A", updated);
      }
    }
  }

  async function addToB(mod: string) {
    const selected = MODULES[mod]?.find((l) => l.classNo === selectedClassB[mod]);
    if (selected) {
      const updated = [...timetableB.filter((l) => l.moduleCode !== mod), selected];
      setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
      setAddedModulesB((prev) => Array.from(new Set([...prev, mod])));

      if (syncedModules.includes(mod)) {
        setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
        setAddedModulesB((prev) => Array.from(new Set([...prev, mod])));
      }

      if (userId) {
      await saveTimetable(userId, "B", updated);
      }
      
    }
  }

  function toggleSync(mod: string) {
    const isSynced = syncedModules.includes(mod);

    if (isSynced) {
      setSyncedModules((prev) => prev.filter((m) => m !== mod));
    } else {
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

  useEffect(() => {
  const loadUserTimetables = async (userId: string) => {
    const [a, b] = await Promise.all([
      loadTimetable(userId, "A"),
      loadTimetable(userId, "B"),
    ]);
    setTimetableA(a);
    setTimetableB(b);
  };

  // Immediately load if the user is already logged in
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      loadUserTimetables(user.id);
    }
  });

  // Listen for authentication changes (e.g., login)
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        loadUserTimetables(session.user.id);
      }
    }
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
}, []);


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
              key={mod}
              value={selectedClassA[mod] || ""}
              onChange={(e) => {
              const classNo = e.target.value;
              setSelectedClassA((prev) => ({ ...prev, [mod]: classNo }));

              if (addedModulesA.includes(mod)) {
                const selected = MODULES[mod]?.find((l) => l.classNo === classNo);
                if (selected) {
                 setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
                  if (syncedModules.includes(mod)) {
                    setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
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
              onClick={async () => {
              const updatedA = timetableA.filter((l) => l.moduleCode !== mod);
              setTimetableA(updatedA);
              setAddedModulesA((prev) => prev.filter((m) => m !== mod));

              if (userId) {
                await supabase
                  .from("timetables")
                  .delete()
                  .eq("user_id", userId)
                  .eq("timetable_name", "A")
                  .eq("module_code", mod);
              }

              if (syncedModules.includes(mod)) {
                const updatedB = timetableB.filter((l) => l.moduleCode !== mod);
                setTimetableB(updatedB);
                setAddedModulesB((prev) => prev.filter((m) => m !== mod));

                if (userId) {
                  await supabase
                    .from("timetables")
                    .delete()
                    .eq("user_id", userId)
                    .eq("timetable_name", "B")
                    .eq("module_code", mod);
                }

                setSyncedModules((prev) => prev.filter((m) => m !== mod));
              }
            }}
          >
            Remove {mod}
          </button>
          ) : (
          <button
            onClick={() => addToA(mod)}
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
                 setTimetableB((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
                  if (syncedModules.includes(mod)) {
                    setTimetableA((prev) => [...prev.filter((l) => l.moduleCode !== mod), selected]);
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
              onClick={async () => {
              const updatedB = timetableB.filter((l) => l.moduleCode !== mod);
              setTimetableB(updatedB);
              setAddedModulesB((prev) => prev.filter((m) => m !== mod));

              if (userId) {
                await supabase
                  .from("timetables")
                  .delete()
                  .eq("user_id", userId)
                  .eq("timetable_name", "B")
                  .eq("module_code", mod);
              }

              if (syncedModules.includes(mod)) {
                const updatedA = timetableA.filter((l) => l.moduleCode !== mod);
                setTimetableA(updatedA);
                setAddedModulesA((prev) => prev.filter((m) => m !== mod));

                if (userId) {
                  await supabase
                    .from("timetables")
                    .delete()
                    .eq("user_id", userId)
                    .eq("timetable_name", "A")
                    .eq("module_code", mod);
                }

                setSyncedModules((prev) => prev.filter((m) => m !== mod));
              }
            }}
          >
            Remove {mod}
          </button>
              ) : (
              <button
                onClick={() => addToB(mod)}
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
