import React, { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { Module } from "../types";

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

        for (const mod of top3Modules) {
          const response = await axios.post(
            "http://127.0.0.1:5051/api/recommend",
            {
              module_description: mod.name,
            }
          );

          const recommendation =
            response.data?.recommendation || "No recommendation found";

          recs.push({
            recommended: recommendation,
            basedOn: mod.name,
          });
        }

        setRecommendations(recs);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchModulesAndRecommend();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Recommended Modules Based on Your Best Modules</h2>
      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && recommendations.length === 0 && (
        <p>No recommendations available.</p>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <ul>
          {recommendations.map((rec, idx) => (
            <li key={idx}>
              Recommended <strong>{rec.recommended}</strong> because you did
              well in <em>{rec.basedOn}</em>.
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
