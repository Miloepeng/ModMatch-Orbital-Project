import React, {useState} from "react";
import axios from "axios";

export default function Search() {
  const [moduleDesc, setModuleDesc] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    setRecommendation('');

    try {
      const response = await axios.post('http://127.0.0.1:5051/api/recommend', {
        module_description: moduleDesc,
      });

      setRecommendation(response.data.recommendation || 'No recommendation returned.');
    } catch (error) {
      setRecommendation('Error fetching recommendation.');
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Module Recommender</h2>
      <textarea
        rows={4}
        cols={50}
        placeholder="Enter module description..."
        value={moduleDesc}
        onChange={(e) => setModuleDesc(e.target.value)}
      />
      <br />
      <button onClick={handleRecommend} disabled={loading}>
        {loading ? 'Loading...' : 'Get Recommendation'}
      </button>
      <div style={{ marginTop: '20px' }}>
        <strong>Recommendation:</strong>
        <p>{recommendation}</p>
      </div>
    </div>
  );
}