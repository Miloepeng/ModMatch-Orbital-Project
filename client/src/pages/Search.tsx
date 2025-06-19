import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { Module } from "../types";
import '../components/Recommender.css';

export default function Search() {
  const [recommendations, setRecommendations] = useState<
    { recommended: string; basedOn: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adjust this grading scale to match your app's logic
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

  useEffect(() => {
    const fetchModulesAndRecommend = async () => {
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

        // Sort descending by grade value
        const sortedModules = [...modules].sort(
          (a, b) => gradeValue(b.grade) - gradeValue(a.grade)
        );

        // Take top 3 modules
        const top3Modules = sortedModules.slice(0, 3);

        const recs: { recommended: string; basedOn: string }[] = [];

        const { data: { session } } = await supabase.auth.getSession();

        if (!session || !session.access_token) {
          console.error("User is not logged in or session is expired.");
          return; // Stop further execution if no session or invalid session
        }

        const moduleDescriptions = top3Modules.map((mod) => mod.name);  // Collect all module names

        const response = await axios.post(
          "http://127.0.0.1:5051/api/recommend",  // Backend to handle all modules
          {
            module_descriptions: moduleDescriptions,  // Send the array of module names
          },
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            }
          }
        );

        const recommendations = response.data?.recommendations || [];  // Array of recommendations for all modules
        setRecommendations(recommendations);  // Set all recommendations at once



      } catch (err) {
        console.error(err);
        setError("Failed to fetch recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchModulesAndRecommend();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction * 460, // Adjust scroll distance
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className = "mid-section">
        <h1 className = "mid-section-title">Search</h1>
        <p className = "mid-section-content">Filter for modules you like, or take a look at our recommendations</p>
      </div>
      <div style={{ padding: "20px", maxWidth: "600px" }}>
        <h2>Recommended Modules Based on Your Best Modules</h2>
        {loading && <p>Loading recommendations...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && recommendations.length === 0 && (
          <p>No recommendations available.</p>
        )}

        {!loading && !error && recommendations.length > 0 && (
  <div className="horizontal-scroll-wrapper">
    <button className="scroll-btn left" onClick={() => scroll(-1)}>◀</button>

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
          Recommended <strong>{rec.recommended}</strong> because you did well in{" "}
          <em>{rec.basedOn}</em>.
        </motion.div>
      ))}
    </div>

    <button className="scroll-btn right" onClick={() => scroll(1)}>▶</button>
  </div>

)}

      </div>
    </>
  );
}
