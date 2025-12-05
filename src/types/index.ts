export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export interface MatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  cvId?: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
}