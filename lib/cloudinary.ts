import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `gensyn-art/${folder}`,
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve(result.secure_url)
        } else {
          reject(new Error('Upload failed: No result'))
        }
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
    const urlMatch = imageUrl.match(/\/upload\/(?:v\d+\/)?([^/]+\/[^/]+\/[^.]+)/)
    if (urlMatch && urlMatch[1]) {
      const publicId = urlMatch[1]
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      })
    } else {
      // Fallback: try to extract from URL path
      const urlParts = imageUrl.split('/')
      const lastPart = urlParts[urlParts.length - 1]
      const publicIdWithoutExt = lastPart.split('.')[0]
      // Try with folder prefix
      const possiblePublicId = `gensyn-art/${publicIdWithoutExt}`
      await cloudinary.uploader.destroy(possiblePublicId, {
        resource_type: 'image',
      })
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    // Don't throw - allow deletion to continue even if Cloudinary deletion fails
  }
}

export { cloudinary }

