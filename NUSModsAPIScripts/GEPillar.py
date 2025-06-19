import requests #library to call api via https
import json #python's json library
import time
import random

#INSTRUCTIONS: OPEN UP THE JSON FILE YOU WISH TO APPEND THE NEW ATTRIBUTES BELOW, AND STORE INTO NEW JSON FILE 
#ALL THE WAY AT THE BOTTOM

#load the json file
with open("Modules.json", "r", encoding='utf-8') as f:
    modules = json.load(f)

module_list = []

for mod in modules:
    module_list.append({
        **mod,
        "GEPillar": "NIL"
    })

#Stores into new / current json file
with open("Modules.json", "w") as f:
    json.dump(module_list, f, indent=2)

print("modules saved to Modules.json")