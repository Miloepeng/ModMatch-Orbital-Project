from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import csv
import sys
csv.field_size_limit(10_000_000)
from dotenv import load_dotenv
import os
import jwt

def get_user_id_from_token(token: str):
    try:
        # Decode the JWT token with audience validation disabled
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})

        #print(f"Decoded payload: {payload}")  # Log the decoded payload for debugging
        return payload["sub"]  # 'sub' contains the user_id
    except jwt.ExpiredSignatureError:
        #print("Token has expired.")
        return None
    except jwt.exceptions.PyJWTError as e:
        #print(f"JWT decoding error: {e}")
        return None

load_dotenv(dotenv_path="client/.env.backend")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

##print("SUPABASE_URL:", SUPABASE_URL)
##print("SUPABASE_KEY:", SUPABASE_KEY)

from supabase import create_client, Client

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

#import ModScrape

app = Flask(__name__)
CORS(app)

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

#modules = ["CS1101S", "CS2030S", "CS2040S", "CS2100", "CS1231S", "MA1521", "MA1522"]
module_info = []
indexing = {}

##for mod in modules:
##    entry = {}
##    entry["code"] = mod
##    entry["comments"] = ModScrape.moduleScrape(mod)
##    module_info.append(entry)

with open("Module_Data.csv", "r", newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)

    count = 0
    for row in reader:
        if row["code"] not in indexing and row["description"] != "":
            module_info.append(row)
            indexing[row["code"]] = count
            count += 1
        


@app.route("/api/recommend", methods=["POST"])
def recommend():
    # Extract JWT token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")  # Remove 'Bearer ' prefix

##    print(f"Received token: {token}")
##    token_parts = token.split(".")
##    print(f"Token parts: {len(token_parts)}") 

    # Decode the token to get the user_id
    user_id = get_user_id_from_token(token)

    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401  # Unauthorized if token is invalid
    
    data = request.get_json()
    module_descriptions = data.get("module_descriptions")
    #print(user_id)

    if not module_descriptions:
        return jsonify({"recommendation": "No input provided."})

    response = supabase.table("module_selections").select("*").eq("user_id", user_id).execute()
    if response.data is None:
        return jsonify({"error": response.error.message}), 500
    ##print(response.data[0]["modules_json"])
    db_list = []
    for entry in response.data[0]["modules_json"]:
        ##print(entry["name"])
        db_list.append(entry["name"])
    print(db_list)

    recommendations = []
    descriptions = [m["description"] for m in module_info]
    module_embeddings = model.encode(descriptions, convert_to_tensor=True)
        
    for user_input in module_descriptions:
        # Your existing recommendation logic for each user_input (module description)
        #user_embedding = model.encode(user_input, convert_to_tensor=True)
        mod_idx = indexing[user_input]

        similarities = util.pytorch_cos_sim(module_embeddings[mod_idx], module_embeddings)[0]

        input_module_code = user_input.strip().upper()
        exclude_idx = None
        for i in range(len(module_info)):
            if module_info[i]["code"].upper() == input_module_code:
                exclude_idx = i
                break

        filtered = [(i, similarities[i].item()) for i in range(len(module_info)) if i != exclude_idx]
        filtered.sort(key=lambda x: x[1], reverse=True)

        number_idx = -1
        for i in range(len(user_input)):
            if user_input[i].isnumeric():
                number_idx = i
                break

        for i in range(len(filtered)):
            #print(module_info[filtered[i][0]]["code"][:number_idx + 4])
            #print(user_input[:number_idx + 4])
            if module_info[filtered[i][0]]["code"] in db_list:
                #print(module_info[filtered[i][0]]["code"])
                continue
            #not a good fix, but if first 6/7 chars are same then skip
            elif module_info[filtered[i][0]]["code"][:number_idx + 4] == user_input[:number_idx + 4]:
                continue
            else:
                top_few = [filtered[i]]
                break
        recommendation = module_info[top_few[0][0]]["code"]

        recommendations.append({
            "recommended": recommendation,
            "basedOn": user_input
        })

    return jsonify({"recommendations": recommendations})  # Return all recommendations at once


if __name__ == "__main__":
    app.run(port=5051)
