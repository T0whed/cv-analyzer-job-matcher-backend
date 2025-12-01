import { Response, NextFunction } from 'express';
import { CVService } from '../services/cv.service';
import { AuthRequest } from '../middleware/auth.middleware';

const cvService = new CVService();

export class CVController {
  async uploadCV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user!.id;
      const cv = await cvService.uploadCV(userId, req.file);

      res.status(201).json({
        message: 'CV uploaded and processed successfully',
        cv
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyCV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cv = await cvService.getCV(userId);
      res.json(cv);
    } catch (error: any) {
      if (error.message === 'CV not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async getAllCVs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cvs = await cvService.getAllCVs();
      res.json(cvs);
    } catch (error) {
      next(error);
    }
  }

  async deleteCV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await cvService.deleteCV(userId);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'CV not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}