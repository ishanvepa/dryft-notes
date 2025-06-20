#implement logic for note clustering
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer


# takes in a NoteList object and clusters the notes based on their text content
def cluster_notes(notelist, n_clusters=5):
    if not notelist:
        return []

    #process notes to extract text
    notes = [note.text for note in notelist.notes if note.text] 

    # Convert notes to TF-IDF vectors
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(notes)

    # Perform KMeans clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    kmeans.fit(X)

    labels = kmeans.labels_

    # Output
    for i, note in enumerate(notes):
        print(f"Cluster {labels[i]}: {note}")

    # print(kmeans.labels_.tolist())
    return kmeans.labels_.tolist()