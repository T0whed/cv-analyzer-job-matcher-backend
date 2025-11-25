import { Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';
import { AuthRequest } from '../middleware/auth.middleware';

const jobService = new JobService();

export class JobController {
  async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recruiterId = req.user!.id;
      const job = await jobService.createJob(recruiterId, req.body);
      res.status(201).json({
        message: 'Job created successfully',
        job
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.id);
      const recruiterId = req.user!.id;
      const job = await jobService.updateJob(jobId, recruiterId, req.body);
      res.json({
        message: 'Job updated successfully',
        job
      });
    } catch (error: any) {
      if (error.message === 'Job not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Unauthorized to update this job') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }

  async deleteJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.id);
      const recruiterId = req.user!.id;
      const result = await jobService.deleteJob(jobId, recruiterId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Job not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Unauthorized to delete this job') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }

  async getJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobId = parseInt(req.params.id);
      const job = await jobService.getJob(jobId);
      res.json(job);
    } catch (error: any) {
      if (error.message === 'Job not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async getAllJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobs = await jobService.getAllJobs();
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  }

  async getMyJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recruiterId = req.user!.id;
      const jobs = await jobService.getRecruiterJobs(recruiterId);
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  }
}