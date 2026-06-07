import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'decorx-products',
      allowed_formats: ['jpg', 'png', 'jpeg'],
    };
  },
});