import { PrismaClient } from '@prisma/client';
import { ParserService } from './parser.service';
import fs from 'fs';

const prisma = new PrismaClient();
const parserService = new ParserService();

export class CVService {
  async uploadCV(userId: number, file: Express.Multer.File) {
  try {
    // Extract text from CV
    const rawText = await parserService.extractText(file.path);

    // Sanitize function to remove null bytes and other problematic characters
    const sanitizeText = (text: string | string[] | null | undefined): string | string[] => {
      if (!text) return '';
      
      if (Array.isArray(text)) {
        return text.map(item => 
          typeof item === 'string' 
            ? item.replace(/\0/g, '').trim() 
            : ''
        ).filter(item => item.length > 0);
      }
      
      return text.replace(/\0/g, '').trim();
    };

    // Extract structured data and sanitize
    const extractedSkills = sanitizeText(parserService.extractSkills(rawText)) as string[];
    const education = sanitizeText(parserService.extractEducation(rawText)) as string;
    const experience = sanitizeText(parserService.extractExperience(rawText)) as string;
    const sanitizedRawText = sanitizeText(rawText) as string;

    // Check if CV already exists
    const existingCV = await prisma.cV.findUnique({
      where: { userId }
    });

    let cv;
    if (existingCV) {
      // Delete old file
      if (fs.existsSync(existingCV.filePath)) {
        fs.unlinkSync(existingCV.filePath);
      }

      // Update existing CV
      cv = await prisma.cV.update({
        where: { userId },
        data: {
          fileName: file.filename,
          filePath: file.path,
          extractedSkills,
          education,
          experience,
          rawText: sanitizedRawText
        }
      });
    } else {
      // Create new CV
      cv = await prisma.cV.create({
        data: {
          userId,
          fileName: file.filename,
          filePath: file.path,
          extractedSkills,
          education,
          experience,
          rawText: sanitizedRawText
        }
      });
    }

    return cv;
  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
}

  async getCV(userId: number) {
    const cv = await prisma.cV.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!cv) {
      throw new Error('CV not found');
    }

    return cv;
  }

  async getAllCVs() {
    const cvs = await prisma.cV.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return cvs;
  }

  async deleteCV(userId: number) {
    const cv = await prisma.cV.findUnique({
      where: { userId }
    });

    if (!cv) {
      throw new Error('CV not found');
    }

    // Delete file
    if (fs.existsSync(cv.filePath)) {
      fs.unlinkSync(cv.filePath);
    }

    // Delete from database
    await prisma.cV.delete({
      where: { userId }
    });

    return { message: 'CV deleted successfully' };
  }
}