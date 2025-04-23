import { NextResponse } from 'next/server';
import { load_dataset } from 'datasets';
import fs from 'fs';
import path from 'path';

// Cache for dataset to avoid reloading
let datasetCache: any = null;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;
    
    // Extract numeric index from image ID (format: image_X)
    const index = parseInt(imageId.replace('image_', ''));
    
    if (isNaN(index)) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 }
      );
    }
    
    // Check if we have a local cache of images
    const cacheDir = path.join(process.cwd(), 'public', 'cache', 'cultural-images');
    const cachedImagePath = path.join(cacheDir, `${imageId}.jpg`);
    
    // If image is cached, serve it directly
    if (fs.existsSync(cachedImagePath)) {
      const imageBuffer = fs.readFileSync(cachedImagePath);
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    
    // Load dataset if not cached
    if (!datasetCache) {
      try {
        datasetCache = await load_dataset("zhili312/multimodal-cultural-concepts", { split: "train" });
      } catch (error) {
        console.error('Error loading dataset:', error);
        return NextResponse.json(
          { error: 'Failed to load cultural dataset' },
          { status: 500 }
        );
      }
    }
    
    // Get image from dataset
    if (index >= datasetCache.length) {
      return NextResponse.json(
        { error: 'Image ID out of range' },
        { status: 404 }
      );
    }
    
    const item = datasetCache[index];
    
    if (!item || !item.image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Convert PIL image to buffer
    const imageBuffer = await new Promise((resolve, reject) => {
      try {
        const img = item.image;
        
        // Ensure directory exists
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        // Save to cache for future requests
        img.save(cachedImagePath, 'JPEG', (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Read the saved file
          const buffer = fs.readFileSync(cachedImagePath);
          resolve(buffer);
        });
      } catch (error) {
        reject(error);
      }
    });
    
    // Serve the image
    return new NextResponse(imageBuffer as Buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
    
  } catch (error) {
    console.error('Error serving cultural image:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving the image' },
      { status: 500 }
    );
  }
} 