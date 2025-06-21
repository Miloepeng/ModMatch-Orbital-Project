from sentence_transformers import SentenceTransformer, util
import numpy as np
import json
import csv
import sys
csv.field_size_limit(10_000_000)

modules = []
descriptions = []

with open("Module_Data.csv", "r", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row["description"]:
            modules.append(row["code"])
            descriptions.append(row["description"])

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
embeddings = model.encode(descriptions, convert_to_tensor=True)
cosine_sim = util.pytorch_cos_sim(embeddings, embeddings).cpu().numpy()

# Create structured similarity list
similarity_list = []

for i in range(len(modules)):
    row = []
    for j in range(len(modules)):
        row.append([modules[j], float(cosine_sim[i][j])])
    row.sort(key=lambda x: x[1], reverse=True)  # Sort by similarity score descending
    similarity_list.append(row)

# Save JSON
with open("similarities.json", "w") as f:
    json.dump({
        "modules": modules,
        "similarities": similarity_list
    }, f)
