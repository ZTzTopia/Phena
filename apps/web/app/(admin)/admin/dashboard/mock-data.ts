interface MockChallenge {
  id: number;
  name: string;
  category: string;
  releaseRound: number;
}

export const mockChallenges: { challenges: MockChallenge[] } = {
  challenges: [
    { id: 1, name: "SQL Injection", category: "web", releaseRound: 1 },
    { id: 2, name: "XSS Challenge", category: "web", releaseRound: 1 },
    { id: 3, name: "AES ECB Attack", category: "crypto", releaseRound: 2 },
    { id: 4, name: "Buffer Overflow", category: "pwn", releaseRound: 2 },
    { id: 5, name: "Malware Reversing", category: "reverse", releaseRound: 3 },
  ],
};
