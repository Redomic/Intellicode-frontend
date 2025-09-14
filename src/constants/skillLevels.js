export const SKILL_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  PROFESSIONAL: 'PROFESSIONAL'
};

export const SKILL_LEVEL_CONFIG = {
  [SKILL_LEVELS.BEGINNER]: {
    id: SKILL_LEVELS.BEGINNER,
    label: 'Beginner',
    description: 'New to programming and DSA fundamentals',
    examples: ['Arrays', 'Basic Loops', 'Simple Functions', 'Variables']
  },
  [SKILL_LEVELS.INTERMEDIATE]: {
    id: SKILL_LEVELS.INTERMEDIATE,
    label: 'Intermediate',
    description: 'Comfortable with basic programming concepts',
    examples: ['Linked Lists', 'Recursion', 'Binary Search', 'Hash Tables']
  },
  [SKILL_LEVELS.PROFESSIONAL]: {
    id: SKILL_LEVELS.PROFESSIONAL,
    label: 'Professional',
    description: 'Experienced developer seeking advanced challenges',
    examples: ['Dynamic Programming', 'Graph Algorithms', 'System Design', 'Optimization']
  }
};

export const SKILL_LEVEL_ORDER = [
  SKILL_LEVELS.BEGINNER,
  SKILL_LEVELS.INTERMEDIATE,
  SKILL_LEVELS.PROFESSIONAL
];
