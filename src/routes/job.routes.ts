import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { jobSchema } from '../utils/validator.util';

const router = Router();
const jobController = new JobController();

// Public/Job seeker routes
router.get('/', authenticate, jobController.getAllJobs.bind(jobController));
router.get('/:id', authenticate, jobController.getJob.bind(jobController));

// Recruiter routes
router.post('/', authenticate, authorizeRole('recruiter'), validate(jobSchema), jobController.createJob.bind(jobController));
router.put('/:id', authenticate, authorizeRole('recruiter'), jobController.updateJob.bind(jobController));
router.delete('/:id', authenticate, authorizeRole('recruiter'), jobController.deleteJob.bind(jobController));
router.get('/recruiter/my-jobs', authenticate, authorizeRole('recruiter'), jobController.getMyJobs.bind(jobController));

export default router;