<template>
  <div class="christmas-snow-container">
    <!-- Copos de nieve automáticos -->
    <div
      v-for="flake in snowflakes"
      :key="flake.id"
      class="snowflake"
      :style="getSnowflakeStyle(flake)"
    >
      ❄
    </div>
  </div>
</template>

<script>
export default {
  name: "ChristmasSnow",
  data() {
    return {
      snowflakes: [],
      maxSnowflakes: 20,
    };
  },
  mounted() {
    console.log("🎄 ChristmasSnow component mounted");
    this.createSnowflakes();
  },
  beforeUnmount() {
    // Componente limpio, sin necesidad de cleanup
  },
  methods: {
    createSnowflakes() {
      for (let i = 0; i < this.maxSnowflakes; i++) {
        this.snowflakes.push(this.generateSnowflake(i));
      }
      console.log(`❄️ Created ${this.snowflakes.length} snowflakes`);
    },
    generateSnowflake(id) {
      return {
        id: `auto-${id}`,
        left: Math.random() * 100,
        animationDuration: 5 + Math.random() * 10,
        animationDelay: Math.random() * 5,
        size: 10 + Math.random() * 20,
        opacity: 0.2 + Math.random() * 0.3,
        drift: -20 + Math.random() * 40, // Desplazamiento horizontal
      };
    },
    getSnowflakeStyle(flake) {
      return {
        left: `${flake.left}%`,
        animationDuration: `${flake.animationDuration}s`,
        animationDelay: `${flake.animationDelay}s`,
        fontSize: `${flake.size}px`,
        opacity: flake.opacity,
        "--drift": `${flake.drift}px`,
      };
    },
  },
};
</script>

<style scoped lang="scss">
.christmas-snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 99999;
}

.snowflake {
  position: absolute;
  top: -50px;
  color: #fff;
  text-shadow: 0 0 5px #fff;
  animation: fall linear infinite;
  user-select: none;
  will-change: transform;
}

@keyframes fall {
  0% {
    top: -50px;
    transform: translateX(0) rotate(0deg);
  }
  100% {
    top: 100vh;
    transform: translateX(var(--drift)) rotate(360deg);
  }
}

/* Variaciones de copos para hacer más natural */
.snowflake:nth-child(3n) {
  animation-timing-function: ease-in-out;
}
</style>
