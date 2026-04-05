export interface MockChallengePoints {
  challengeId: number;
  challengeName: string;
  attackPoints: number;
  defensePoints: number;
  slaPoints: number;
  totalPoints: number;
}

export interface MockScoreboardEntry {
  teamId: number;
  teamName: string;
  totalScore: number;
  attackPoints: number;
  defensePoints: number;
  slaPoints: number;
  challenges: MockChallengePoints[];
  rank: number;
}

export const mockScoreboard: MockScoreboardEntry[] = [
  {
    teamId: 1,
    teamName: "Team Alpha",
    totalScore: 5500,
    attackPoints: 3000,
    defensePoints: 2000,
    slaPoints: 500,
    rank: 1,
    challenges: [
      {
        challengeId: 1,
        challengeName: "SQL Injection",
        attackPoints: 1000,
        defensePoints: 800,
        slaPoints: 200,
        totalPoints: 2000,
      },
      {
        challengeId: 2,
        challengeName: "XSS Challenge",
        attackPoints: 1000,
        defensePoints: 600,
        slaPoints: 150,
        totalPoints: 1750,
      },
      {
        challengeId: 3,
        challengeName: "AES ECB Attack",
        attackPoints: 500,
        defensePoints: 400,
        slaPoints: 100,
        totalPoints: 1000,
      },
      {
        challengeId: 4,
        challengeName: "Buffer Overflow",
        attackPoints: 500,
        defensePoints: 200,
        slaPoints: 50,
        totalPoints: 750,
      },
    ],
  },
  {
    teamId: 2,
    teamName: "Team Beta",
    totalScore: 4200,
    attackPoints: 2200,
    defensePoints: 1500,
    slaPoints: 500,
    rank: 2,
    challenges: [
      {
        challengeId: 1,
        challengeName: "SQL Injection",
        attackPoints: 800,
        defensePoints: 600,
        slaPoints: 200,
        totalPoints: 1600,
      },
      {
        challengeId: 3,
        challengeName: "AES ECB Attack",
        attackPoints: 700,
        defensePoints: 500,
        slaPoints: 150,
        totalPoints: 1350,
      },
      {
        challengeId: 4,
        challengeName: "Buffer Overflow",
        attackPoints: 700,
        defensePoints: 400,
        slaPoints: 150,
        totalPoints: 1250,
      },
    ],
  },
  {
    teamId: 3,
    teamName: "Team Gamma",
    totalScore: 3800,
    attackPoints: 1800,
    defensePoints: 1500,
    slaPoints: 500,
    rank: 3,
    challenges: [
      {
        challengeId: 1,
        challengeName: "SQL Injection",
        attackPoints: 600,
        defensePoints: 500,
        slaPoints: 200,
        totalPoints: 1300,
      },
      {
        challengeId: 2,
        challengeName: "XSS Challenge",
        attackPoints: 600,
        defensePoints: 500,
        slaPoints: 200,
        totalPoints: 1300,
      },
      {
        challengeId: 5,
        challengeName: "Malware Reversing",
        attackPoints: 600,
        defensePoints: 500,
        slaPoints: 100,
        totalPoints: 1200,
      },
    ],
  },
  {
    teamId: 4,
    teamName: "Team Delta",
    totalScore: 2900,
    attackPoints: 1400,
    defensePoints: 1000,
    slaPoints: 500,
    rank: 4,
    challenges: [
      {
        challengeId: 1,
        challengeName: "SQL Injection",
        attackPoints: 500,
        defensePoints: 400,
        slaPoints: 200,
        totalPoints: 1100,
      },
      {
        challengeId: 2,
        challengeName: "XSS Challenge",
        attackPoints: 500,
        defensePoints: 400,
        slaPoints: 200,
        totalPoints: 1100,
      },
      {
        challengeId: 3,
        challengeName: "AES ECB Attack",
        attackPoints: 400,
        defensePoints: 200,
        slaPoints: 100,
        totalPoints: 700,
      },
    ],
  },
];

export const mockScoreboardResponse = { scoreboard: mockScoreboard };
