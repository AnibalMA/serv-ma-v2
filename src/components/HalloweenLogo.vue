<template>
  <div v-if="active" class="halloween-logo">
    <slot />

    <!-- The hat sits on the laptop and sticks out above the logo -->
    <svg class="witch-hat" viewBox="0 8 100 85" aria-hidden="true">
      <ellipse class="witch-hat__brim" cx="50" cy="82" rx="47" ry="10" />
      <path
        class="witch-hat__cone"
        d="M27 81Q38 52 47 24Q51 10 68 11Q58 17 57 27Q62 54 73 81Q50 88 27 81Z"
      />
      <path
        class="witch-hat__band"
        d="M30.5 73Q50 79 69.5 73L66.5 64.5Q50 69.5 33.8 64.5Z"
      />
      <rect
        class="witch-hat__buckle"
        x="44"
        y="65.5"
        width="12"
        height="9"
        rx="1.5"
      />
    </svg>

    <svg class="spider" viewBox="0 20 40 80" aria-hidden="true">
      <line class="spider__thread" x1="20" y1="20" x2="20" y2="64" />
      <path
        class="spider__legs"
        d="M17 70L8 62L3 68M16 74L6 70L1 77M16 78L6 80L2 88M17 82L9 88L7 96M23 70L32 62L37 68M24 74L34 70L39 77M24 78L34 80L38 88M23 82L31 88L33 96"
      />
      <circle class="spider__body" cx="20" cy="68" r="5" />
      <ellipse class="spider__body" cx="20" cy="79" rx="7" ry="8.5" />
      <circle class="spider__eye" cx="18" cy="67" r="1.2" />
      <circle class="spider__eye" cx="22" cy="67" r="1.2" />
    </svg>
  </div>
  <slot v-else />
</template>

<script>
export default {
  name: "HalloweenLogo",
  props: {
    // Off: shows the logo exactly as it is, without the wrapper
    active: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
$outline: #ddd6fe;

// Block: the login q-img keeps its full width inside the wrapper
.halloween-logo {
  position: relative;
  display: block;
  vertical-align: middle;
  line-height: 0;
}

// Sizes and places in % of the logo, so they work for the small header logo
// and the big login one. The laptop spans about x 40-61% and y 10-39%.
.witch-hat,
.spider {
  position: absolute;
  height: auto;
  pointer-events: none;
}

.witch-hat {
  // The brim rests on the top edge of the laptop
  bottom: 90%;
  left: 39%;
  width: 18%;
  transform: rotate(-10deg);
  transform-origin: 50% 90%;

  // Same thin outline on the small and the big logo
  &__brim,
  &__cone {
    stroke: $outline;
    stroke-width: 1.25px;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  &__brim {
    fill: #1a0b2e;
  }

  &__cone {
    fill: #2a1145;
  }

  &__band {
    fill: #f97316;
  }

  &__buckle {
    fill: none;
    stroke: #facc15;
    stroke-width: 2.5;
  }
}

.spider {
  // Hangs from the top right corner of the laptop
  top: 9%;
  left: 62%;
  width: 8%;
  transform-origin: 50% 0;
  animation: spider-swing 3s ease-in-out infinite alternate;

  &__thread {
    stroke: rgba(255, 255, 255, 0.75);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  &__legs {
    fill: none;
    stroke: #e9d5ff;
    stroke-width: 1px;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  &__body {
    fill: #1c1027;
    stroke: #e9d5ff;
    stroke-width: 1.5;
  }

  &__eye {
    fill: #f97316;
  }
}

@keyframes spider-swing {
  from {
    transform: rotate(8deg);
  }
  to {
    transform: rotate(-8deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spider {
    animation: none;
  }
}
</style>
