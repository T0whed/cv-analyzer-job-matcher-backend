import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class ParserService {
  // Extract text from PDF or DOCX
  async extractText(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
      return await this.parsePDF(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
      return await this.parseDOCX(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  private async parsePDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  private async parseDOCX(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  // Extract skills from text using keyword matching
  extractSkills(text: string): string[] {
    const skillKeywords = [
      // Programming Languages
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
      // Frontend
      'react', 'angular', 'vue', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery', 'webpack', 'vite',
      // Backend
      'node.js', 'express', 'nestjs', 'django', 'flask', 'spring', 'laravel', '.net', 'fastapi',
      // Databases
      'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'sqlite', 'oracle',
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible',
      // Other
      'git', 'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'jira', 'testing', 'jest', 'cypress'
    ];

    const textLower = text.toLowerCase();
    const foundSkills = new Set<string>();

    skillKeywords.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        foundSkills.add(skill);
      }
    });

    return Array.from(foundSkills);
  }

  // Extract education information
  extractEducation(text: string): string {
    const educationKeywords = [
      'bachelor', 'master', 'phd', 'doctorate', 'diploma', 'degree',
      'b.tech', 'm.tech', 'b.sc', 'm.sc', 'mba', 'bba', 'engineering'
    ];

    const lines = text.toLowerCase().split('\n');
    const educationLines: string[] = [];

    lines.forEach(line => {
      if (educationKeywords.some(keyword => line.includes(keyword))) {
        educationLines.push(line.trim());
      }
    });

    return educationLines.length > 0 
      ? educationLines.slice(0, 3).join(' | ') 
      : 'Not specified';
  }

  // Extract experience information
  extractExperience(text: string): string {
    const experienceRegex = /(\d+)\+?\s*(years?|yrs?)/gi;
    const matches = text.match(experienceRegex);

    if (matches && matches.length > 0) {
      return matches[0];
    }

    // Check for experience section
    const lines = text.toLowerCase().split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('experience') || lines[i].includes('work history')) {
        return lines.slice(i, i + 3).join(' ').substring(0, 100);
      }
    }

    return 'Not specified';
  }
}