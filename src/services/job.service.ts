import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class JobService {
  async createJob(recruiterId: number, data: {
    title: string;
    description: string;
    requiredSkills: string[];
    experience: string;
    education: string;
  }) {
    const job = await prisma.job.create({
      data: {
        recruiterId,
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills,
        experience: data.experience,
        education: data.education
      },
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

    return job;
  }

  async updateJob(jobId: number, recruiterId: number, data: Partial<{
    title: string;
    description: string;
    requiredSkills: string[];
    experience: string;
    education: string;
  }>) {
    // Verify ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.recruiterId !== recruiterId) {
      throw new Error('Unauthorized to update this job');
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data,
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

    return updatedJob;
  }

  async deleteJob(jobId: number, recruiterId: number) {
    // Verify ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.recruiterId !== recruiterId) {
      throw new Error('Unauthorized to delete this job');
    }

    await prisma.job.delete({
      where: { id: jobId }
    });

    return { message: 'Job deleted successfully' };
  }

  async getJob(jobId: number) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
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

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  async getAllJobs() {
    const jobs = await prisma.job.findMany({
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return jobs;
  }

  async getRecruiterJobs(recruiterId: number) {
    const jobs = await prisma.job.findMany({
      where: { recruiterId },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return jobs;
  }
}
