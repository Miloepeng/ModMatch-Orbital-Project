from ModScrape import moduleScrape
import spacy
import re
import json
import pandas as pd
#from sentence_transformers import SentenceTransformer, util

def preprocess_review(review):
    irrelevant_keywords = ["grade", "marks", "score", "gpa", "difficulty","lecture","workload"]
    # Remove irrelevant keywords and their surrounding context
    cleaned_review = ' '.join([word for word in review.split() if word.lower() not in irrelevant_keywords])
    return cleaned_review



#Spacy model
nlp = spacy.load("en_core_web_sm")
#process with spacy


group_keywords = ["mcq"]
negation = ['no', 'not', 'without', 'none']

def contains_negation(chunk):
    for word in chunk:
        if word.dep_ == "neg" or word.text.lower() in negation:
            return True
    return False

def extract_group(review):
    group_sentences = []
    for np in review.noun_chunks:
        if contains_negation(np):
            continue
        for keyword in group_keywords:
            if keyword in np.text.lower():
                return True
    return False

'''
moduleCode = "HSI1000"
review = preprocess_review(moduleScrape(moduleCode))
review = nlp(review)
print(extract_group(review))
'''

df = pd.read_csv('Module_Data.csv')

with open("ID.json", "r", encoding='utf-8') as f:
    modules = json.load(f)

module_list =[]

for mod in modules:
    code = mod['value']
    reviews = df[df['code'] == code]['comments'].dropna().tolist()
    reviews = "".join(reviews)
    reviews = preprocess_review(reviews)
    reviews = nlp(reviews)
    has_group_project = extract_group(reviews)        #uses reviews to catch keywords

    #create new list
    module_list.append({
        **mod,
        "hasMCQ" : str(has_group_project)
    })

#Stores into new / current json file
with open("ID.json", "w") as f:
    json.dump(module_list, f, indent=2)

print("modules saved to ID.json")
