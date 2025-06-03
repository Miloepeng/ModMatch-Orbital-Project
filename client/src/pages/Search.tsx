import React, {useState} from "react";
import axios from "axios";

export default function Search() {
    const [moduleDesc, setModuleDesc] = useState("");
    const [recommendation, setRecommendation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRecommend = async () => {
    setLoading(true);
    setRecommendation("");

    try {
      const response = await axios.post("http://127.0.0.1:5051/api/recommend", {
        module_description: moduleDesc,
      });

      setRecommendation(response.data.recommendation);
    } catch (error) {
      setRecommendation("Error fetching recommendation.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>NUS Module Recommender</h2>

      <textarea
        rows={6}
        cols={60}
        placeholder="Enter a module description (e.g., CS3243 covers AI, search, ML...)"
        value={moduleDesc}
        onChange={(e) => setModuleDesc(e.target.value)}
        style={{ padding: "0.5rem", marginBottom: "1rem" }}
      />

      <br />

      <button onClick={handleRecommend} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
        {loading ? "Loading..." : "Recommend Similar Modules"}
      </button>

      <div style={{ marginTop: "1.5rem", whiteSpace: "pre-wrap" }}>
        {recommendation && (
          <>
            <h4>Recommendation:</h4>
            <p>{recommendation}</p>
          </>
        )}
      </div>
    </div>
  );
}