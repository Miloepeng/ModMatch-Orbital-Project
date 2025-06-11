import requests #library to call api via https
import json #python's json library
import time
import random

#INSTRUCTIONS: OPEN UP THE JSON FILE YOU WISH TO APPEND THE NEW ATTRIBUTES BELOW, AND STORE INTO NEW JSON FILE 
#ALL THE WAY AT THE BOTTOM

#load the json file
with open("GEN.json", "r", encoding='utf-8') as f:
    modules = json.load(f)

base_url = f"https://api.nusmods.com/v2/2024-2025/modules"

module_list = []


#check if each mod can be SU'ed
for mod in modules:
    code = mod["value"]
    url = f"{base_url}/{code}.json" 
       
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data.get("gradingBasisDescription") == 'Graded':
                isPassFail = False
            else :
                isPassFail = True
        else:
            print(f"{code} not found (status {response.status_code})")
            isPassFail = False
    except Exception as e:
        print(f"Error fetching {code}: {e}")
        isPassFail = False
#creates a new list i.e. JSON
    module_list.append({
        **mod,
        "passFail": str(isPassFail)
    })

    time.sleep(0.2) #don't ddos the API

#Stores into new / current json file
with open("GEN.json", "w") as f:
    json.dump(module_list, f, indent=2)

print("modules saved to GEN.json")