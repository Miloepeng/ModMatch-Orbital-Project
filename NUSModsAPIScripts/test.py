import pandas as pd
import json

df = pd.read_csv('Module_Data.csv')

with open("Modules.json", "r", encoding='utf-8') as f:
    modules = json.load(f)

module_list =[]

for mod in modules:
    code = mod['value']
    desc = df[df['code'] == code]['description'].dropna().tolist()
    desc = "".join(desc)
    module_list.append({
        **mod,
        "desc" : desc
    })

with open("Modules.json", "w") as f:
    json.dump(module_list, f, indent=2)

print("modules saved to Modules.json")
