<template>
  <div class="halloween-effects" aria-hidden="true">
    <!-- Cobwebs in the top corners (the right one is mirrored) -->
    <svg
      v-for="side in ['left', 'right']"
      :key="side"
      :class="['cobweb', `cobweb--${side}`]"
      viewBox="0 0 100 100"
    >
      <path d="M0 0L95.1 30.9M0 0L80.9 58.8M0 0L58.8 80.9M0 0L30.9 95.1" />
      <path
        d="M22 0Q18.5 2.9 20.9 6.8Q16.7 8.5 17.8 12.9Q13.2 13.2 12.9 17.8Q8.5 16.7 6.8 20.9Q2.9 18.5 0 22"
      />
      <path
        d="M42 0Q35.3 5.6 39.9 13Q31.8 16.2 34 24.7Q25.2 25.2 24.7 34Q16.2 31.8 13 39.9Q5.6 35.3 0 42"
      />
      <path
        d="M62 0Q52 8.2 59 19.2Q47 23.9 50.2 36.4Q37.3 37.3 36.4 50.2Q23.9 47 19.2 59Q8.2 52 0 62"
      />
      <path
        d="M82 0Q68.8 10.9 78 25.3Q62.1 31.6 66.3 48.2Q49.3 49.3 48.2 66.3Q31.6 62.1 25.3 78Q10.9 68.8 0 82"
      />
    </svg>

    <span
      v-for="ghost in ghosts"
      :key="ghost.id"
      class="ghost"
      :class="{ 'is-reverse': ghost.reverse }"
      :style="ghostStyle(ghost)"
    >
      👻
    </span>
  </div>
</template>

<script>
import { createHalloweenParticles } from "src/utils/seasonalTheme";

export default {
  name: "HalloweenEffects",
  data() {
    // Created once; fewer ghosts on phones
    return createHalloweenParticles(this.$q.screen.lt.sm);
  },
  methods: {
    ghostStyle(ghost) {
      return {
        left: `${ghost.left}%`,
        fontSize: `${ghost.size}px`,
        animationDuration: `${ghost.duration}s`,
        animationDelay: `${ghost.delay}s`,
      };
    },
  },
};
</script>

<style scoped lang="scss">
.halloween-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // Above the header (2000), below dialogs (6000) and notifications (9500)
  z-index: 3000;
  pointer-events: none;
  overflow: hidden;
  user-select: none;
}

.cobweb {
  position: absolute;
  top: 0;
  width: 70px;
  height: 70px;
  fill: none;
  stroke: rgba(255, 255, 255, 0.45);
  stroke-width: 1;
  // Dark halo so the white threads also show on light pages
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.6));

  path {
    vector-effect: non-scaling-stroke;
  }

  &--left {
    left: 0;
  }

  &--right {
    right: 0;
    transform: scaleX(-1);
  }
}

.ghost {
  --sway: 24px;
  position: absolute;
  top: 100%;
  line-height: 1;
  opacity: 0;
  animation: ghost-rise linear infinite;
  will-change: transform;

  &.is-reverse {
    --sway: -24px;
  }
}

@keyframes ghost-rise {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  10%,
  85% {
    opacity: 0.5;
  }
  25% {
    transform: translate(var(--sway), -30vh);
  }
  50% {
    transform: translate(0, -60vh);
  }
  75% {
    transform: translate(calc(var(--sway) * -1), -90vh);
  }
  100% {
    transform: translate(0, calc(-100vh - 100%));
    opacity: 0;
  }
}

@media (max-width: 599px) {
  .cobweb {
    width: 60px;
    height: 60px;
  }

  // On phones the logo sits in the top-left corner
  .cobweb--left {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ghost {
    display: none;
  }
}

@media print {
  .halloween-effects {
    display: none;
  }
}
</style>
