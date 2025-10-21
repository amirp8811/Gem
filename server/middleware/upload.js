const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const sharp = require('sharp');
const { promisify } = require('util');

// File type validation
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB for images
  document: 10 * 1024 * 1024, // 10MB for documents
  avatar: 2 * 1024 * 1024 // 2MB for avatars
};

// Secure filename generator
const generateSecureFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}_${randomBytes}${ext}`;
};

// Virus scanning simulation (replace with actual antivirus in production)
const scanForViruses = async (filePath) => {
  // In production, integrate with ClamAV or similar
  // For now, we'll do basic checks
  try {
    const stats = await fs.stat(filePath);
    
    // Check for suspiciously large files
    if (stats.size > 50 * 1024 * 1024) { // 50MB
      throw new Error('File too large for security scan');
    }
    
    // Check file headers for common malicious patterns
    const buffer = Buffer.alloc(1024);
    const fileHandle = await fs.open(filePath, 'r');
    await fileHandle.read(buffer, 0, 1024, 0);
    await fileHandle.close();
    
    // Basic header validation
    const header = buffer.toString('hex', 0, 10);
    const maliciousPatterns = [
      '4d5a', // PE executable
      '7f454c46', // ELF executable
      'cafebabe', // Java class file
    ];
    
    for (const pattern of maliciousPatterns) {
      if (header.toLowerCase().includes(pattern)) {
        throw new Error('Potentially malicious file detected');
      }
    }
    
    return true;
  } catch (error) {
    throw new Error(`Virus scan failed: ${error.message}`);
  }
};

// Image processing and validation
const processImage = async (filePath, options = {}) => {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 85,
      format = 'jpeg'
    } = options;

    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Validate image
    if (!metadata.format || !['jpeg', 'png', 'webp', 'gif'].includes(metadata.format)) {
      throw new Error('Invalid image format');
    }
    
    // Check for EXIF data and remove it for privacy
    const processedImage = image
      .resize(maxWidth, maxHeight, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .rotate() // Auto-rotate based on EXIF
      .removeExif(); // Remove EXIF data for privacy
    
    // Convert to specified format
    if (format === 'jpeg') {
      processedImage.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      processedImage.png({ compressionLevel: 9 });
    } else if (format === 'webp') {
      processedImage.webp({ quality });
    }
    
    // Generate processed filename
    const ext = format === 'jpeg' ? '.jpg' : `.${format}`;
    const processedPath = filePath.replace(path.extname(filePath), `_processed${ext}`);
    
    await processedImage.toFile(processedPath);
    
    // Remove original file
    await fs.unlink(filePath);
    
    return processedPath;
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

// Storage configuration
const createStorage = (uploadPath, fileType = 'image') => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        // Create directory if it doesn't exist
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    }
  });
};

// File filter
const createFileFilter = (allowedTypes, maxSize) => {
  return (req, file, cb) => {
    // Check file type
    if (!allowedTypes[file.mimetype]) {
      return cb(new Error(`Invalid file type. Allowed types: ${Object.keys(allowedTypes).join(', ')}`), false);
    }
    
    // Check file extension matches MIME type
    const expectedExt = allowedTypes[file.mimetype];
    const actualExt = path.extname(file.originalname).toLowerCase();
    
    if (actualExt !== expectedExt) {
      return cb(new Error('File extension does not match MIME type'), false);
    }
    
    // Additional security checks
    const filename = file.originalname.toLowerCase();
    
    // Check for dangerous filenames
    const dangerousPatterns = [
      /\.php$/i, /\.asp$/i, /\.jsp$/i, /\.exe$/i, /\.bat$/i, /\.cmd$/i,
      /\.scr$/i, /\.com$/i, /\.pif$/i, /\.vbs$/i, /\.js$/i, /\.jar$/i,
      /\.htaccess$/i, /\.htpasswd$/i, /\.ini$/i, /\.conf$/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(filename)) {
        return cb(new Error('Potentially dangerous file type'), false);
      }
    }
    
    // Check for null bytes and path traversal
    if (filename.includes('\0') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return cb(new Error('Invalid filename'), false);
    }
    
    cb(null, true);
  };
};

// Create upload middleware
const createUploadMiddleware = (options = {}) => {
  const {
    uploadPath = './uploads',
    fileType = 'image',
    maxFiles = 5,
    fieldName = 'files'
  } = options;
  
  const allowedTypes = fileType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
  const maxSize = FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.image;
  
  const upload = multer({
    storage: createStorage(uploadPath, fileType),
    fileFilter: createFileFilter(allowedTypes, maxSize),
    limits: {
      fileSize: maxSize,
      files: maxFiles,
      fields: 10,
      fieldNameSize: 100,
      fieldSize: 1024 * 1024 // 1MB for field values
    }
  });
  
  return upload.array(fieldName, maxFiles);
};

// Post-upload processing middleware
const postUploadProcessing = (options = {}) => {
  return async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    const {
      processImages = true,
      scanViruses = true,
      imageOptions = {}
    } = options;
    
    try {
      const processedFiles = [];
      
      for (const file of req.files) {
        const filePath = file.path;
        
        // Virus scanning
        if (scanViruses) {
          await scanForViruses(filePath);
        }
        
        // Image processing
        if (processImages && file.mimetype.startsWith('image/')) {
          const processedPath = await processImage(filePath, imageOptions);
          
          // Update file info
          file.path = processedPath;
          file.filename = path.basename(processedPath);
        }
        
        processedFiles.push({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/${path.relative('./uploads', file.path)}`
        });
      }
      
      req.processedFiles = processedFiles;
      next();
    } catch (error) {
      // Clean up uploaded files on error
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }
      
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
};

// File cleanup utility
const cleanupOldFiles = async (directory, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
};

// Upload middleware configurations
const uploadConfigs = {
  // Product images
  productImages: {
    middleware: createUploadMiddleware({
      uploadPath: './uploads/products',
      fileType: 'image',
      maxFiles: 5,
      fieldName: 'images'
    }),
    processing: postUploadProcessing({
      processImages: true,
      scanViruses: true,
      imageOptions: { maxWidth: 1200, maxHeight: 1200, quality: 90 }
    })
  },
  
  // User avatars
  avatars: {
    middleware: createUploadMiddleware({
      uploadPath: './uploads/avatars',
      fileType: 'image',
      maxFiles: 1,
      fieldName: 'avatar'
    }),
    processing: postUploadProcessing({
      processImages: true,
      scanViruses: true,
      imageOptions: { maxWidth: 400, maxHeight: 400, quality: 85 }
    })
  },
  
  // Documents
  documents: {
    middleware: createUploadMiddleware({
      uploadPath: './uploads/documents',
      fileType: 'document',
      maxFiles: 3,
      fieldName: 'documents'
    }),
    processing: postUploadProcessing({
      processImages: false,
      scanViruses: true
    })
  }
};

module.exports = {
  uploadConfigs,
  createUploadMiddleware,
  postUploadProcessing,
  cleanupOldFiles,
  processImage,
  scanForViruses
};
