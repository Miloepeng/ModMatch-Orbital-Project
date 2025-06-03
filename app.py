##from flask import Flask, render_template
##
##app = Flask(__name__)
##
##@app.route("/")
##def home():
##    return render_template("index.html")
##
##if __name__ == "__main__":
##    app.run(port=5051, debug=True)

from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this

# Replace with your Hugging Face API key
HUGGINGFACE_API_KEY = "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"

# Choose an appropriate instruct model
HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"

headers = {
    "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
    "Content-Type": "application/json"
}


@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.json
    module_desc = data.get("module_description", "")
    mods = ["CS1101S", "CS1231S", "CS2030S", "CS2040S", "CS2100", "CS2101", "CS2103T", "CS2106", "CS2109S", "CS3230"]

    prompt = (f"Suggest 3 NUS modules that are similar to the following module that is not itself and from the list {mods} :\n\n{module_desc}\n\n"
              "Only list the module names only. They must be real modules you can find on https://nusmods.com/modules")

    try:
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": prompt}
        )

        print("Raw response:", response.text)  # Debug print

        if response.status_code != 200:
            return jsonify({"error": "Hugging Face API error", "details": response.text}), 500

        result = response.json()

        # Some models return list of dicts, others a string
        if isinstance(result, list) and "generated_text" in result[0]:
            reply = result[0]["generated_text"]
        else:
            reply = result

        return jsonify({"recommendation": reply})

    except Exception as e:
        print("Error during recommendation:", str(e))
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5051)

##import requests
##
##API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
##
##headers = {
##    "Authorization": f"Bearer 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"
##}
##
##payload = {
##    "inputs": "Explain the theory of relativity."
##}
##
##response = requests.post(API_URL, headers=headers, json=payload)
##
##print("Status Code:", response.status_code)
##print("Response:", response.text)

