// The Halloween look turns on by itself every October (browser's local date)
export function isHalloweenSeason(date = new Date()) {
  return date.getMonth() === 9;
}

function between(min, max, random) {
  return min + random() * (max - min);
}

// Random place and timing for each floating decoration (bat, ghost, pumpkin)
export function createParticles(
  count,
  { size, duration },
  random = Math.random
) {
  return Array.from({ length: count }, (_, index) => {
    const seconds = between(duration[0], duration[1], random);

    return {
      id: index,
      left: between(0, 95, random), // %
      top: between(5, 85, random), // %
      size: between(size[0], size[1], random), // px
      duration: seconds,
      // Negative delay: it starts at a random point of its path, so nothing
      // pops in on first paint
      delay: -random() * seconds,
      reverse: index % 2 === 1,
    };
  });
}

export function createHalloweenParticles(isSmallScreen, random = Math.random) {
  const amount = (count) => (isSmallScreen ? Math.ceil(count / 2) : count);

  return {
    bats: createParticles(
      amount(5),
      { size: [24, 38], duration: [9, 16] },
      random
    ),
    ghosts: createParticles(
      amount(4),
      { size: [30, 46], duration: [14, 22] },
      random
    ),
    pumpkins: createParticles(
      amount(7),
      { size: [20, 32], duration: [8, 15] },
      random
    ),
  };
}
