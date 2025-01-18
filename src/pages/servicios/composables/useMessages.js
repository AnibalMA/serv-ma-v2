import { ref, computed } from "vue";

export function useMessages() {
  const messages = ref([]);
  const isTyping = ref(false);

  const addMessage = async (message) => {
    isTyping.value = true;
    await new Promise((resolve) => setTimeout(resolve, 800));
    isTyping.value = false;
    messages.value.push({
      id: Date.now(),
      content: message,
      timestamp: new Date(),
    });
  };

  const clearMessages = () => {
    messages.value = [];
  };

  return {
    messages,
    isTyping,
    addMessage,
    clearMessages,
  };
}
