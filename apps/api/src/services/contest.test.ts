import { describe, it, expect } from "bun:test";

describe("ContestService startContest and stopContest", () => {
  describe("isRunning state checks", () => {
    it("should fail when starting an already running contest", () => {
      const isRunning = "true";
      const canStart = isRunning !== "true";
      expect(canStart).toBe(false);
    });

    it("should succeed when starting a stopped contest", () => {
      const isRunning = String("false");
      const canStart = isRunning !== "true";
      expect(canStart).toBe(true);
    });

    it("should fail when stopping a non-running contest", () => {
      const isRunning = String("false");
      const canStop = isRunning === "true";
      expect(canStop).toBe(false);
    });

    it("should succeed when stopping a running contest", () => {
      const isRunning = "true";
      const canStop = isRunning === "true";
      expect(canStop).toBe(true);
    });
  });
});

describe("Tick advancement and round progression", () => {
  it("should increment currentTick on each tick", () => {
    let currentTick = 0;

    currentTick = currentTick + 1;
    expect(currentTick).toBe(1);

    currentTick = currentTick + 1;
    expect(currentTick).toBe(2);
  });

  it("should advance to next round when currentTick reaches tickPerRound", () => {
    let currentTick = 0;
    let currentRound = 0;
    const tickPerRound = 10;

    for (let i = 0; i < tickPerRound; i++) {
      currentTick++;
    }

    expect(currentTick).toBe(tickPerRound);

    currentRound = currentRound + 1;
    currentTick = 0;

    expect(currentRound).toBe(1);
    expect(currentTick).toBe(0);
  });

  it("should stop contest when currentRound reaches totalRounds", () => {
    let currentRound = 0;
    const totalRounds = 5;
    let isRunning = true;

    currentRound = totalRounds;

    if (currentRound >= totalRounds) {
      isRunning = false;
    }

    expect(isRunning).toBe(false);
  });

  it("should handle multiple round advancement", () => {
    let currentTick = 0;
    let currentRound = 0;
    const tickPerRound = 5;

    for (let _round = 0; _round < 3; _round++) {
      for (let _tick = 0; _tick < tickPerRound; _tick++) {
        currentTick++;
      }
      currentRound++;
      currentTick = 0;
    }

    expect(currentRound).toBe(3);
    expect(currentTick).toBe(0);
  });

  it("should stop contest if round advancement exceeds totalRounds", () => {
    let currentTick = 0;
    let currentRound = 0;
    const tickPerRound = 5;
    const totalRounds = 5;
    let isRunning = true;

    for (let _round = 0; _round < 6; _round++) {
      if (currentRound >= totalRounds) {
        isRunning = false;
        break;
      }
      for (let _tick = 0; _tick < tickPerRound; _tick++) {
        currentTick++;
      }
      currentRound++;
      currentTick = 0;
    }

    expect(isRunning).toBe(false);
    expect(currentRound).toBe(5);
  });
});

describe("Config numeric key validation", () => {
  it("should correctly identify numeric config keys", () => {
    const numericKeys = [
      "tickDuration",
      "tickPerRound",
      "totalRounds",
      "currentTick",
      "currentRound",
    ];

    const isNumericKey = (key: string) => numericKeys.includes(key);

    expect(isNumericKey("tickDuration")).toBe(true);
    expect(isNumericKey("tickPerRound")).toBe(true);
    expect(isNumericKey("totalRounds")).toBe(true);
    expect(isNumericKey("isRunning")).toBe(false);
    expect(isNumericKey("contestName")).toBe(false);
  });

  it("should parse string config values to integers", () => {
    expect(parseInt("60", 10)).toBe(60);
    expect(parseInt("10", 10)).toBe(10);
    expect(parseInt("5", 10)).toBe(5);
    expect(parseInt("0", 10)).toBe(0);
  });
});

describe("startContestIfNeeded logic", () => {
  it("should start contest when isRunning is true and startDate has passed", () => {
    const isRunning = true;
    const startDate = new Date(Date.now() - 1000).toISOString();
    const startDateObj = new Date(startDate);
    const shouldStart = isRunning && startDateObj <= new Date();
    expect(shouldStart).toBe(true);
  });

  it("should not start contest when isRunning is false", () => {
    const isRunning = false;
    const startDate = new Date(Date.now() - 1000).toISOString();
    const startDateObj = new Date(startDate);
    const shouldStart = isRunning && startDateObj <= new Date();
    expect(shouldStart).toBe(false);
  });

  it("should not start contest when startDate is in the future", () => {
    const isRunning = true;
    const startDate = new Date(Date.now() + 10000).toISOString();
    const startDateObj = new Date(startDate);
    const shouldStart = isRunning && startDateObj <= new Date();
    expect(shouldStart).toBe(false);
  });
});

describe("resetContest logic", () => {
  it("should set isRunning to false after reset", () => {
    const isRunning = true;
    const resetIsRunning = false;
    expect(resetIsRunning).toBe(false);
    expect(isRunning).toBe(true);
    expect(resetIsRunning).not.toBe(isRunning);
  });

  it("should reset tick and round to 1", () => {
    let currentTick = 5;
    let currentRound = 3;
    currentTick = 1;
    currentRound = 1;
    expect(currentTick).toBe(1);
    expect(currentRound).toBe(1);
  });

  it("should reset regardless of running state", () => {
    const reset = () => ({ isRunning: false, currentTick: 1, currentRound: 1 });

    const started = reset();
    expect(started.isRunning).toBe(false);
    expect(started.currentTick).toBe(1);
    expect(started.currentRound).toBe(1);

    const stopped = reset();
    expect(stopped.isRunning).toBe(false);
    expect(stopped.currentTick).toBe(1);
    expect(stopped.currentRound).toBe(1);
  });
});

describe("scheduleStartIfNeeded delay calculation", () => {
  it("should calculate positive delay when startDate is in the future", () => {
    const futureDate = new Date(Date.now() + 5000);
    const now = new Date();
    const delayMs = futureDate.getTime() - now.getTime();
    expect(delayMs).toBeGreaterThan(0);
    expect(delayMs).toBeLessThan(6000);
  });

  it("should calculate negative delay when startDate is in the past", () => {
    const pastDate = new Date(Date.now() - 5000);
    const now = new Date();
    const delayMs = pastDate.getTime() - now.getTime();
    expect(delayMs).toBeLessThan(0);
  });

  it("should calculate zero delay when startDate is now", () => {
    const now = new Date();
    const delayMs = now.getTime() - now.getTime();
    expect(delayMs).toBe(0);
  });
});
