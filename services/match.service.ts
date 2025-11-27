import { PrismaClient } from '@prisma/client';
import { MatchResult } from '../types';

const prisma = new PrismaClient();

export class MatchService {
  // Calculate match percentage between CV skills and job required skills
  calculateMatch(cvSkills: string[], requiredSkills: string[]): MatchResult {
    const cvSkillsLower = cvSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkillsLower.forEach((skill, index) => {
      if (cvSkillsLower.includes(skill)) {
        matchedSkills.push(requiredSkills[index]); // Use original case
      } else {
        missingSkills.push(requiredSkills[index]);
      }
    });

    const matchPercentage = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    return {
      matchPercentage,
      matchedSkills,
      missingSkills
    };
  }

  // Match user's CV with a specific job
  async matchCVWithJob(userId: number, jobId: number): Promise<MatchResult> {
    const cv = await prisma.cV.findUnique({
      where: { userId }
    });

    if (!cv) {
      throw new Error('CV not found for this user');
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return this.calculateMatch(cv.extractedSkills, job.requiredSkills);
  }

  // Get all jobs with match percentages for a job seeker
  async getJobMatchesForSeeker(userId: number) {
    const cv = await prisma.cV.findUnique({
      where: { userId }
    });

    if (!cv) {
      throw new Error('CV not found. Please upload your CV first');
    }

    const jobs = await prisma.job.findMany({
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      }
    });

    const jobsWithMatches = jobs.map((job: any) => {
      const matchResult = this.calculateMatch(cv.extractedSkills, job.requiredSkills);
      return {
        ...job,
        ...matchResult
      };
    });

    // Sort by match percentage (descending)
    jobsWithMatches.sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);

    return jobsWithMatches;
  }

  // Get all CVs with match percentages for a specific job (recruiter view)
  async getCVMatchesForJob(jobId: number) {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const cvs = await prisma.cV.findMany({
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

    const cvsWithMatches = cvs.map((cv: any) => {
      const matchResult = this.calculateMatch(cv.extractedSkills, job.requiredSkills);
      return {
        cvId: cv.id,
        userId: cv.userId,
        userName: cv.user.name,
        userEmail: cv.user.email,
        extractedSkills: cv.extractedSkills,
        education: cv.education,
        experience: cv.experience,
        ...matchResult
      };
    });

    // Sort by match percentage (descending)
    cvsWithMatches.sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);

    return cvsWithMatches;
  }

  // Get all CVs with their best job matches (recruiter dashboard)
  async getAllCVsWithMatches(recruiterId: number) {
    const recruiterJobs = await prisma.job.findMany({
      where: { recruiterId }
    });

    if (recruiterJobs.length === 0) {
      return [];
    }

    const cvs = await prisma.cV.findMany({
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

    const cvsWithBestMatches = cvs.map((cv: any) => {
      let bestMatch = { matchPercentage: 0, jobId: 0, jobTitle: '' };

      recruiterJobs.forEach((job: any) => {
        const matchResult = this.calculateMatch(cv.extractedSkills, job.requiredSkills);
        if (matchResult.matchPercentage > bestMatch.matchPercentage) {
          bestMatch = {
            matchPercentage: matchResult.matchPercentage,
            jobId: job.id,
            jobTitle: job.title
          };
        }
      });

      return {
        cvId: cv.id,
        userId: cv.userId,
        userName: cv.user.name,
        userEmail: cv.user.email,
        extractedSkills: cv.extractedSkills,
        education: cv.education,
        experience: cv.experience,
        bestMatch
      };
    });

    // Sort by best match percentage (descending)
    cvsWithBestMatches.sort((a: any, b: any) => b.bestMatch.matchPercentage - a.bestMatch.matchPercentage);

    return cvsWithBestMatches;
  }
}