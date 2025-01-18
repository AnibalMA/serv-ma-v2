<template>
  <div class="message-display">
    <div ref="messageContainer" class="message-container">
      <transition-group name="message">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="getMessageClass(msg)"
        >
          <div v-html="msg.content"></div>
        </div>
      </transition-group>

      <div v-if="isTyping" class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref } from "vue";

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  isTyping: {
    type: Boolean,
    default: false,
  },
});

const messageContainer = ref(null);

const getMessageClass = (message) => {
  if (message.content.includes("text-primary")) return "primary";
  if (message.content.includes("text-info")) return "info";
  if (message.content.includes("text-warning")) return "warning";
  if (message.content.includes("text-positive")) return "positive";
  return "";
};

watch(
  () => props.messages.length,
  () => {
    setTimeout(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    }, 100);
  }
);
</script>

<style scoped>
.message-display {
  width: 100%;
}

.message-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.message-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--q-primary);
  animation: bounce 0.8s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.primary {
  border-left: 3px solid var(--q-primary);
}
.info {
  border-left: 3px solid var(--q-info);
}
.warning {
  border-left: 3px solid var(--q-warning);
}
.positive {
  border-left: 3px solid var(--q-positive);
}
</style>
