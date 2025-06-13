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


group_keywords = ["group project", "group work", "team project", "group assignment"]
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
moduleCode = "ES2660"
review = preprocess_review(moduleScrape(moduleCode))
review = nlp(review)
print(extract_group(review))
'''

df = pd.read_csv('Module_Data.csv')

with open("Modules.json", "r", encoding='utf-8') as f:
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
        "hasGroupProject" : str(has_group_project)
    })

#Stores into new / current json file
with open("Modules.json", "w") as f:
    json.dump(module_list, f, indent=2)

print("modules saved to Modules.json")

'''
#Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

def check_semantic_similarity(review, key_phrase) :
    review_embedding = model.encode(str(review), convert_to_tensor=True)
    key_phrase_embedding = model.encode(key_phrase, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(review_embedding, key_phrase_embedding)
    return similarity.item()

def has_group_work(review):
    key_phrases = extract_group(review)

    if not key_phrases:
        return False
    
    for key_phrase in key_phrases:
        for group_keyword in group_keywords:
            similarity = check_semantic_similarity(key_phrase, group_keyword)
            print(key_phrase, similarity)
            if similarity > 0.7:
                return True
    return False
'''
#print(moduleCode + " has Group Project: ")
#print(has_group_work(review))