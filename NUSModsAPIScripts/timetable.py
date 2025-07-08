import requests #library to call api via https
import json #python's json library
import time
import glob
import os

#get all json files in directory
script_dir = os.path.dirname(os.path.abspath(__file__))

json_files = glob.glob(os.path.join(script_dir, '*.json'))
base_url = f"https://api.nusmods.com/v2/2024-2025/modules"

module_list = []
for json_file in json_files:
    with open(json_file, 'r', encoding='utf-8') as file:
        modules = json.load(file)


    for mod in modules:
        code = mod["value"]
        url = f"{base_url}/{code}.json" 

        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                module_list.append(data)
                print(f"Fetched data for {code}")
            else:
                print(f"{code} not found (status {response.status_code})")
        except Exception as e:
            print(f"Error fetching {code}: {e}")
        time.sleep(0.1)


with open("Timetable.json", "w") as f:
    json.dump(module_list, f, indent=2)

print("modules saved to GEN.json")
        