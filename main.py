from ModScrape import moduleScrape, descScrape
import csv

modules = ["CS1101S", "CS2030S", "CS2040S", "CS2100", "CS2101", "CS2103T", "CS2106", "CS2109S", "CS3230", "CS1231S", "MA1521", "MA1522", "ST2334"]
output = []

for mod in modules:
    print("Scraping " + mod + "...")
    entry = {}
    entry["code"] = mod
    entry["description"] = descScrape(mod)
    entry["comments"] = moduleScrape(mod)
    output.append(entry)
    print(mod + " done.")

with open("Module_Data.csv", "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["code", "description", "comments"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for entry in output:
        writer.writerow(entry)

print("End of Program")
