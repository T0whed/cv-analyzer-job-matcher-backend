import { Router } from 'express';
import { CVController } from '../controllers/cv.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';
import { upload } from '../config/multer.config';

const router = Router();
const cvController = new CVController();

// Job seeker routes
router.post('/upload', authenticate, authorizeRole('jobseeker'), upload.single('cv'), cvController.uploadCV.bind(cvController));
router.get('/my-cv', authenticate, authorizeRole('jobseeker'), cvController.getMyCV.bind(cvController));
router.delete('/my-cv', authenticate, authorizeRole('jobseeker'), cvController.deleteCV.bind(cvController));

// Recruiter routes
router.get('/all', authenticate, authorizeRole('recruiter'), cvController.getAllCVs.bind(cvController));

export default router;