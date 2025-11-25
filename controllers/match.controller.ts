import { Response, NextFunction } from 'express';
import { MatchService } from '../services/match.service';
import { AuthRequest } from '../middleware/auth.middleware';

const matchService = new MatchService();

export class MatchController {
  // Job seeker: Get match with a specific job
  async getJobMatch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const jobId = parseInt(req.params.jobId);
      const match = await matchService.matchCVWithJob(userId, jobId);
      res.json(match);
    } catch (error: any) {
      if (error.message === 'CV not found for this user' || error.message === 'Job not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // Job seeker: Get all jobs with match percentages
  async getMyJobMatches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const matches = await matchService.getJobMatchesForSeeker(userId);
      res.json(matches);
    } catch (error: any) {
      if (error.message.includes('CV not found')) {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // Recruiter: Get all CVs matched with a specific job
  async getCVMatchesForJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.jobId);
      const matches = await matchService.getCVMatchesForJob(jobId);
      res.json(matches);
    } catch (error: any) {
      if (error.message === 'Job not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // Recruiter: Get all CVs with their best matches
  async getAllCVMatches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recruiterId = req.user!.id;
      const matches = await matchService.getAllCVsWithMatches(recruiterId);
      res.json(matches);
    } catch (error) {
      next(error);
    }
  }
}