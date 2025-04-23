import os
import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np
import matplotlib.pyplot as plt
from datasets import load_dataset

def query_image_database(query_text, num_results=5):
    """
    Query the ChromaDB database with text to find relevant images.
    
    Args:
        query_text (str): The text query to search for similar images
        num_results (int): Number of results to return
        
    Returns:
        List of tuples containing (image_id, distance, metadata)
    """
    print(f"Querying database with: '{query_text}'")
    
    # 1. Load the same CLIP model used for encoding
    model = SentenceTransformer("clip-ViT-B-32")
    
    # 2. Connect to the existing ChromaDB
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_collection(name="cultural_images")
    
    # 3. Encode the query text
    query_embedding = model.encode(query_text, convert_to_numpy=True)
    
    # 4. Query the database
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=num_results,
        include=["documents", "metadatas", "distances"]
    )
    
    # 5. Format the results
    formatted_results = []
    if results and len(results["ids"]) > 0:
        for i in range(len(results["ids"][0])):
            image_id = results["ids"][0][i]
            metadata = results["metadatas"][0][i]
            distance = results["distances"][0][i] if "distances" in results else None
            formatted_results.append((image_id, distance, metadata))
    
    return formatted_results

def display_results(results, dataset=None):
    """
    Display the query results in a readable format and show images if dataset is provided.
    
    Args:
        results: List of tuples containing (image_id, distance, metadata)
        dataset: The original dataset containing the images
    """
    if not results:
        print("No results found.")
        return
        
    print(f"\nFound {len(results)} relevant images:")
    print("=" * 50)
    
    # Prepare figure for displaying images if dataset is available
    if dataset:
        plt.figure(figsize=(15, 5 * len(results)))
    
    for i, (image_id, distance, metadata) in enumerate(results):
        # Extract the numeric index from the image_id (format: "image_X")
        try:
            image_index = int(image_id.split('_')[1])
            
            print(f"Result #{i+1}:")
            print(f"  Image ID: {image_id} (Index: {image_index})")
            print(f"  Similarity Score: {1 - distance:.4f}" if distance is not None else "  Similarity Score: N/A")
            print(f"  Metadata: {metadata}")
            
            # Display the image if dataset is provided
            if dataset:
                # Access the image from the dataset
                try:
                    image = dataset[image_index]["image"]
                    
                    # Create subplot
                    plt.subplot(len(results), 1, i+1)
                    plt.imshow(image)
                    title = f"Result #{i+1} - Similarity: {1 - distance:.4f}" if distance is not None else f"Result #{i+1}"
                    plt.title(title)
                    plt.axis('off')
                except Exception as e:
                    print(f"  Error displaying image: {e}")
            
            print("-" * 50)
        except Exception as e:
            print(f"Error processing result {i}: {e}")
    
    # Show all images if dataset was provided
    if dataset:
        plt.tight_layout()
        plt.show()

def main():
    """
    Main function to demonstrate querying the image database.
    """
    # Load the original dataset to display images
    print("Loading the original dataset...")
    dataset = load_dataset("zhili312/multimodal-cultural-concepts", split="train")
    
    # Example queries
    example_queries = [
        "a picture of a traditional cultural festival",
        "traditional clothing",
        "ancient architecture",
        "cultural food",
        "musical instruments"
    ]
    
    # Query with each example and display results
    for query in example_queries:
        print("\n" + "=" * 70)
        results = query_image_database(query, num_results=3)
        display_results(results, dataset)
        
        # Only wait for input if there are more queries
        if query != example_queries[-1]:
            input("Press Enter to see the next query results...")

if __name__ == "__main__":
    main() 