import ModScrape
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

vectorizer = TfidfVectorizer(stop_words="english")
module_comments = []

modules = ["CS1101S", "CS2030S", "CS2040S", "CS2100", "CS1231S", "MA1521", "MA1522", "MA2001", "MA2002"]

for module in modules:
    print("Adding " + module + "...")
    module_comments.append(ModScrape.moduleScrape(module))

tfidf_matrix = vectorizer.fit_transform(module_comments)

cosine_sim = cosine_similarity(tfidf_matrix)

print(cosine_sim)

##for word in vectorizer.get_feature_names_out():
##    print(word)
##print(tfidf_matrix.toarray())
