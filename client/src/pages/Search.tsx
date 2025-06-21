import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import { Module } from "../types";
import Filter from "../components/Filter";
import "../App.css";
import "../components/Recommender.css";

export default function Search() {
  const [userModules, setModules] = useState<Module[]>([]);
  const [recommendations, setRecommendations] = useState<
    { recommended: string; basedOn: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [similarityMatrix, setSimilarityMatrix] = useState<[string, number][][]>([]);
  const [moduleList, setModuleList] = useState<string[]>([]);

  const gradeValue = (grade: string): number => {
    const gradeMap: Record<string, number> = {
      "A+": 5,
      A: 5,
      "A-": 4.5,
      "B+": 4,
      B: 3.5,
      "B-": 3,
      "C+": 2.5,
      C: 2,
      "D+": 1.5,
      D: 1,
      F: 0,
      "": 0,
    };
    return gradeMap[grade] ?? 0;
  };

  // Load similarity matrix from public
  useEffect(() => {
    const fetchSimilarityMatrix = async () => {
      const res = await fetch("/similarities.json");
      const data = await res.json();
      setSimilarityMatrix(data.similarities);
      setModuleList(data.modules);
    };
    fetchSimilarityMatrix();
  }, []);

  // Load user modules from Supabase
  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      setRecommendations([]);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("No user logged in");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("module_selections")
          .select("modules_json")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        if (!data?.modules_json || data.modules_json.length === 0) {
          setError("No modules found for user");
          setLoading(false);
          return;
        }

        const modules: Module[] = data.modules_json;
        setModules(modules);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch modules.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Local recommendation generation
  useEffect(() => {
    if (
      userModules.length > 0 &&
      similarityMatrix.length > 0 &&
      moduleList.length > 0
    ) {
      const top3 = [...userModules]
        .sort((a, b) => gradeValue(b.grade) - gradeValue(a.grade))
        .slice(0, 3)
        .map((mod) => mod.name);

      const takenSet = new Set(userModules.map((mod) => mod.name));
      const recs: { recommended: string; basedOn: string }[] = [];

      top3.forEach((topMod) => {
        const modIdx = moduleList.indexOf(topMod);
        if (modIdx === -1) return;

        const numberIdx = topMod.search(/\d/);
        const similarModules = similarityMatrix[modIdx];

        for (const [candidateCode, _] of similarModules) {
          const samePrefix =
            candidateCode.slice(0, numberIdx + 4) === topMod.slice(0, numberIdx + 4);
          if (!takenSet.has(candidateCode) && !samePrefix) {
            recs.push({
              recommended: candidateCode,
              basedOn: topMod,
            });
            break;
          }
        }
      });

      setRecommendations(recs);
    }
  }, [userModules, similarityMatrix, moduleList]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction * 265,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="mid-section">
        <h1 className="mid-section-title">Search</h1>
        <p className="mid-section-content">
          Filter for modules you like, or take a look at our recommendations
        </p>
      </div>
      <div className="container">
        <div className="search-container">
          <Filter />
        </div>

        <div className="right reco-container">
          <h2 className="reco-title">Recommendations</h2>
          {loading && <p>Loading recommendations...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && recommendations.length === 0 && (
            <p>No recommendations available.</p>
          )}

          {!loading && !error && recommendations.length > 0 && (
            <div className="horizontal-scroll-wrapper">
              <button className="scroll-btn left" onClick={() => scroll(-1)}>
                ◀
              </button>

              <div className="scrollable-container" ref={scrollRef}>
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    className="scroll-card"
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: false }}
                  >
                    <p className="recommend-text">
                      <strong>{rec.recommended}</strong> because you did well
                      in <em>{rec.basedOn}</em>.
                    </p>
                  </motion.div>
                ))}
              </div>

              <button className="scroll-btn right" onClick={() => scroll(1)}>
                ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
