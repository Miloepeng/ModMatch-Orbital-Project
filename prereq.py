import requests

module_code = 'CS2040S'
url = f"https://api.nusmods.com/v2/2024-2025/modules/{module_code}.json"
response = requests.get(url)
data = response.json()
#the fetched .json file contains prerequisites, timetable information e.t.c e.t.c from NUSMods' API

print("Prerequisite (text):", data.get("prerequisite"))
print("Prerequisite Tree:", data.get("prerequisiteModuleTree"))