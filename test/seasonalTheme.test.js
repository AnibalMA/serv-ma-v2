import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isHalloweenSeason,
  createParticles,
  createHalloweenParticles,
} from "src/utils/seasonalTheme";

describe("isHalloweenSeason", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is off on the last second of September", () => {
    expect(isHalloweenSeason(new Date(2026, 8, 30, 23, 59, 59))).toBe(false);
  });

  it("turns on at midnight of October 1st", () => {
    expect(isHalloweenSeason(new Date(2026, 9, 1, 0, 0, 0))).toBe(true);
  });

  it("is on in the middle of October", () => {
    expect(isHalloweenSeason(new Date(2026, 9, 24))).toBe(true);
  });

  it("is still on the last second of October 31st", () => {
    expect(isHalloweenSeason(new Date(2026, 9, 31, 23, 59, 59))).toBe(true);
  });

  it("turns off by itself on November 1st", () => {
    expect(isHalloweenSeason(new Date(2026, 10, 1, 0, 0, 0))).toBe(false);
  });

  it("comes back every October", () => {
    expect(isHalloweenSeason(new Date(2031, 9, 15))).toBe(true);
  });

  it("uses today's date when no date is given", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date(2026, 9, 10));
    expect(isHalloweenSeason()).toBe(true);

    vi.setSystemTime(new Date(2026, 11, 10));
    expect(isHalloweenSeason()).toBe(false);
  });
});

describe("createParticles", () => {
  const ranges = { size: [20, 40], duration: [10, 20] };

  it("creates the requested amount with unique ids", () => {
    const particles = createParticles(6, ranges);

    expect(particles).toHaveLength(6);
    expect(new Set(particles.map((p) => p.id)).size).toBe(6);
  });

  it("uses the random function to place and time each particle", () => {
    const [particle] = createParticles(1, ranges, () => 0.5);

    expect(particle).toEqual({
      id: 0,
      left: 47.5,
      top: 45,
      size: 30,
      duration: 15,
      delay: -7.5,
      reverse: false,
    });
  });

  it("keeps every value inside its range", () => {
    for (const random of [() => 0, () => 0.999]) {
      for (const p of createParticles(3, ranges, random)) {
        // Away from the right and bottom edges, so they are not cut off
        expect(p.left).toBeGreaterThanOrEqual(0);
        expect(p.left).toBeLessThanOrEqual(95);
        expect(p.top).toBeGreaterThanOrEqual(5);
        expect(p.top).toBeLessThanOrEqual(85);
        expect(p.size).toBeGreaterThanOrEqual(20);
        expect(p.size).toBeLessThanOrEqual(40);
        expect(p.duration).toBeGreaterThanOrEqual(10);
        expect(p.duration).toBeLessThanOrEqual(20);
        // Negative delay: the particle is already mid-way on first paint
        expect(p.delay).toBeLessThanOrEqual(0);
        expect(p.delay).toBeGreaterThanOrEqual(-p.duration);
      }
    }
  });

  it("sends every other particle in the opposite direction", () => {
    const particles = createParticles(4, ranges, () => 0.5);

    expect(particles.map((p) => p.reverse)).toEqual([false, true, false, true]);
  });
});

describe("createHalloweenParticles", () => {
  it("creates bats, ghosts and pumpkins on big screens", () => {
    const { bats, ghosts, pumpkins } = createHalloweenParticles(false);

    expect(bats).toHaveLength(5);
    expect(ghosts).toHaveLength(4);
    expect(pumpkins).toHaveLength(7);
  });

  it("creates about half of them on small screens", () => {
    const { bats, ghosts, pumpkins } = createHalloweenParticles(true);

    expect(bats).toHaveLength(3);
    expect(ghosts).toHaveLength(2);
    expect(pumpkins).toHaveLength(4);
  });
});
