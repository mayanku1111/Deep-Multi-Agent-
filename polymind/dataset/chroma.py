import os
import io
from datasets import load_dataset
from PIL import Image, UnidentifiedImageError
import torch
from sentence_transformers import SentenceTransformer
import chromadb
import numpy as np
import json

print("Loading dataset...")
# 1. Load Dataset
dataset = load_dataset("zhili312/multimodal-cultural-concepts", split="train")

# Print dataset info
print(f"Dataset size: {len(dataset)} items")
print(f"Dataset features: {dataset.features}")
print(f"Dataset column names: {dataset.column_names}")

# Print a sample of items to better understand the structure
print("\nExamining sample items:")
for i in range(min(5, len(dataset))):
    try:
        item = dataset[i]
        print(f"\nItem {i} keys: {list(item.keys())}")
        
        if "image" in item:
            print(f"  image type: {type(item['image'])}")
            print(f"  image size: {item['image'].size if hasattr(item['image'], 'size') else 'unknown'}")
    except Exception as e:
        print(f"Error examining item {i}: {e}")

# 2. Load SentenceTransformer with CLIP model for image embeddings
print("\nLoading CLIP model...")
model = SentenceTransformer("clip-ViT-B-32")

# 3. Setup ChromaDB
print("Setting up ChromaDB...")
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="cultural_images")

# 4. Process dataset and store image embeddings
print("\nProcessing dataset...")
successful_count = 0
error_count = 0
skipped_count = 0

# Define image preprocessing if needed
def preprocess_image(img):
    # Return the PIL image directly as SentenceTransformer can handle it
    return img

for i in range(len(dataset)):
    try:
        # Get item safely
        item = dataset[i]
        
        # Check if we have an image
        if "image" not in item or item["image"] is None:
            skipped_count += 1
            if skipped_count < 10:
                print(f"Skipping item {i}: No image available")
            continue
        
        # Get the PIL image
        img = item["image"]
        
        # If it's already a PIL image, use it directly
        if isinstance(img, Image.Image):
            processed_img = preprocess_image(img)
            
            # Generate embedding from image
            embedding = model.encode(processed_img, convert_to_numpy=True)
            
            # Create metadata with image dimensions
            metadata = {
                "source_id": i,
                "width": img.width,
                "height": img.height,
            }
            
            # Add to ChromaDB
            collection.add(
                ids=[f"image_{i}"],
                embeddings=[embedding.tolist()],
                metadatas=[metadata],
                documents=[f"Image {i}"]  # Placeholder text as documents are required
            )
            
            successful_count += 1
            if i % 100 == 0 and i > 0:
                print(f"Processed {i} items (successful: {successful_count}, errors: {error_count}, skipped: {skipped_count})")
        else:
            print(f"Unexpected image type for item {i}: {type(img)}")
            skipped_count += 1

    except Exception as e:
        error_count += 1
        print(f"Failed to process item {i}: {e}")
        if error_count < 5:  # Print detailed debug for first few failures
            import traceback
            traceback.print_exc()
        # Continue processing other items

print(f"\nProcessing complete!")
print(f"Successfully processed: {successful_count} items")
print(f"Errors: {error_count}")
print(f"Skipped: {skipped_count}")

# Note: With PersistentClient, changes are automatically persisted
