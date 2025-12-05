import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();
const matchController = new MatchController();

// Job seeker routes
router.get('/job/:jobId', authenticate, authorizeRole('jobseeker'), matchController.getJobMatch.bind(matchController));
router.get('/my-matches', authenticate, authorizeRole('jobseeker'), matchController.getMyJobMatches.bind(matchController));

// Recruiter routes
router.get('/job/:jobId/candidates', authenticate, authorizeRole('recruiter'), matchController.getCVMatchesForJob.bind(matchController));
router.get('/all-candidates', authenticate, authorizeRole('recruiter'), matchController.getAllCVMatches.bind(matchController));

export default router;