from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import csv
import sys
csv.field_size_limit(10_000_000)
#import ModScrape

app = Flask(__name__)
CORS(app)

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

#modules = ["CS1101S", "CS2030S", "CS2040S", "CS2100", "CS1231S", "MA1521", "MA1522"]
module_info = []

##for mod in modules:
##    entry = {}
##    entry["code"] = mod
##    entry["comments"] = ModScrape.moduleScrape(mod)
##    module_info.append(entry)

with open("Module_Data.csv", "r", newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        module_info.append(row)


@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_input = data.get("module_description")

    if not user_input:
        return jsonify({"recommendation": "No input provided."})

    user_embedding = model.encode(user_input, convert_to_tensor=True)
    module_embeddings = model.encode([m["description"] for m in module_info], convert_to_tensor=True)

    similarities = util.pytorch_cos_sim(user_embedding, module_embeddings)[0]

    # Check if input exactly matches a module code, ignore case
    input_module_code = user_input.strip().upper()
    exclude_idx = None
    for idx, mod in enumerate(module_info):
        if mod["code"].upper() == input_module_code:
            exclude_idx = idx
            break

    # Create a list of (index, similarity) excluding the matched module itself
    filtered = [(i, similarities[i].item()) for i in range(len(module_info)) if i != exclude_idx]

    # Sort by similarity descending
    filtered.sort(key=lambda x: x[1], reverse=True)

    # Pick top 3
    top_3 = filtered[:3]

    recommendations = [module_info[i]["code"] for i, _ in top_3]

    return jsonify({"recommendation": ", ".join(recommendations)})


if __name__ == "__main__":
    app.run(port=5051)
