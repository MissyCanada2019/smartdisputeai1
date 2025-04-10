import { Router } from 'express';
import { spawn } from 'child_process';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|tif|tiff|pdf)$/i)) {
      return cb(new Error('Only image and PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

const router = Router();

// Serve the OCR upload form
router.get('/ocr', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'templates/ocr_upload_form.html'));
});

// Handle OCR processing
router.post('/ocr-upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    
    // Use Python script for OCR processing
    const pythonProcess = spawn('python', ['test_ocr_directly.py', filePath]);
    
    let result = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0 || errorOutput) {
        console.error('OCR process error:', errorOutput);
        return res.status(500).json({
          status: 'error',
          message: 'Error processing image',
          error: errorOutput
        });
      }
      
      try {
        // Extract the JSON part of the output
        const jsonMatch = result.match(/OCR Results.*?(\{[\s\S]*\})/m);
        if (jsonMatch && jsonMatch[1]) {
          const jsonResult = JSON.parse(jsonMatch[1]);
          return res.json({
            status: 'success',
            fields: jsonResult,
            meta: {
              filename: req.file.originalname
            }
          });
        } else {
          throw new Error('Could not parse OCR output');
        }
      } catch (parseError) {
        console.error('Error parsing OCR output:', parseError);
        return res.status(500).json({
          status: 'error',
          message: 'Error parsing OCR results',
          error: parseError.message,
          rawOutput: result
        });
      }
    });
    
  } catch (error) {
    console.error('OCR upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error processing document',
      error: error.message
    });
  }
});

// Sample OCR response for testing
router.get('/ocr-sample', (req, res) => {
  const sampleResponse = {
    status: 'success',
    fields: {
      document_type: 'Eviction Notice (N4)',
      landlord_name: 'Sample Property Management',
      tenant_name: 'Jane Smith',
      date: 'March 15, 2025',
      issues: ['Signature potentially missing', 'Notice period not specified'],
      full_text: 'This is a Notice to End your Tenancy for Non-payment of Rent...'
    },
    meta: {
      filename: 'sample_n4.jpg',
      ocr_engine: 'tesseract'
    }
  };
  
  res.json(sampleResponse);
});

export default router;