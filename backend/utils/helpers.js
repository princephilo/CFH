const BADGE_DEFINITIONS = {
  FIRST_ISSUE: {
    name: 'First Issue',
    description: 'Submitted your first circuit issue',
    icon: '🔧'
  },
  FIRST_SOLUTION: {
    name: 'Problem Solver',
    description: 'Provided your first solution',
    icon: '💡'
  },
  TEN_SOLUTIONS: {
    name: 'Helpful Hand',
    description: 'Provided 10 solutions',
    icon: '🤝'
  },
  VERIFIED_SOLVER: {
    name: 'Verified Solver',
    description: 'Had a solution verified',
    icon: '✅'
  },
  FIFTY_SOLUTIONS: {
    name: 'Circuit Master',
    description: 'Provided 50 solutions',
    icon: '🏆'
  },
  HUNDRED_POINTS: {
    name: 'Rising Star',
    description: 'Earned 100 points',
    icon: '⭐'
  },
  THOUSAND_POINTS: {
    name: 'Expert',
    description: 'Earned 1000 points',
    icon: '🎖️'
  }
};

const POINTS = {
  SUBMIT_ISSUE: 5,
  PROVIDE_SOLUTION: 10,
  SOLUTION_ACCEPTED: 25,
  SOLUTION_VERIFIED: 50,
  SOLUTION_UPVOTED: 2,
  FORUM_POST: 3,
  FORUM_REPLY: 2
};

const checkAndAwardBadges = async (user) => {
  const newBadges = [];
  const existingBadgeNames = user.badges.map(b => b.name);

  if (user.issuesSubmitted >= 1 && !existingBadgeNames.includes('First Issue')) {
    newBadges.push(BADGE_DEFINITIONS.FIRST_ISSUE);
  }
  if (user.solutionsProvided >= 1 && !existingBadgeNames.includes('Problem Solver')) {
    newBadges.push(BADGE_DEFINITIONS.FIRST_SOLUTION);
  }
  if (user.solutionsProvided >= 10 && !existingBadgeNames.includes('Helpful Hand')) {
    newBadges.push(BADGE_DEFINITIONS.TEN_SOLUTIONS);
  }
  if (user.verifiedSolutions >= 1 && !existingBadgeNames.includes('Verified Solver')) {
    newBadges.push(BADGE_DEFINITIONS.VERIFIED_SOLVER);
  }
  if (user.solutionsProvided >= 50 && !existingBadgeNames.includes('Circuit Master')) {
    newBadges.push(BADGE_DEFINITIONS.FIFTY_SOLUTIONS);
  }
  if (user.points >= 100 && !existingBadgeNames.includes('Rising Star')) {
    newBadges.push(BADGE_DEFINITIONS.HUNDRED_POINTS);
  }
  if (user.points >= 1000 && !existingBadgeNames.includes('Expert')) {
    newBadges.push(BADGE_DEFINITIONS.THOUSAND_POINTS);
  }

  if (newBadges.length > 0) {
    user.badges.push(...newBadges.map(badge => ({
      ...badge,
      earnedAt: new Date()
    })));
    await user.save();
  }

  return newBadges;
};

module.exports = { BADGE_DEFINITIONS, POINTS, checkAndAwardBadges };