<template>
  <div class="accessible-status" :class="`status-${type}`">
    <q-icon :name="icon" size="sm" class="q-mr-xs" />
    <span class="status-text">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String, // 'active', 'inactive', 'pending', 'completed', 'warning', 'info'
    required: true
  },
  label: {
    type: String,
    required: true
  }
});

const icon = computed(() => {
  const icons = {
    active: 'check_circle',
    inactive: 'cancel',
    pending: 'schedule',
    completed: 'done_all',
    warning: 'warning',
    info: 'info'
  };
  return icons[props.type] || 'circle';
});
</script>

<style lang="scss" scoped>
.accessible-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  
  &.status-active {
    color: $positive;
    background: rgba(33, 186, 69, 0.1);
    border: 1px solid rgba(33, 186, 69, 0.3);
  }
  
  &.status-inactive {
    color: $negative;
    background: rgba(193, 0, 21, 0.1);
    border: 1px solid rgba(193, 0, 21, 0.3);
  }
  
  &.status-pending {
    color: $warning;
    background: rgba(199, 145, 0, 0.1);
    border: 1px solid rgba(199, 145, 0, 0.3);
  }
  
  &.status-completed {
    color: $positive;
    background: rgba(33, 186, 69, 0.1);
    border: 1px solid rgba(33, 186, 69, 0.3);
  }
  
  &.status-warning {
    color: $warning;
    background: rgba(199, 145, 0, 0.1);
    border: 1px solid rgba(199, 145, 0, 0.3);
  }
  
  &.status-info {
    color: $info;
    background: rgba(2, 136, 209, 0.1);
    border: 1px solid rgba(2, 136, 209, 0.3);
  }
}

.status-text {
  font-size: 0.875rem;
}

// Dark mode support
body.body--dark {
  .accessible-status {
    &.status-active {
      background: rgba(33, 186, 69, 0.2);
      border-color: rgba(33, 186, 69, 0.5);
    }
    
    &.status-inactive {
      background: rgba(193, 0, 21, 0.2);
      border-color: rgba(193, 0, 21, 0.5);
    }
    
    &.status-pending,
    &.status-warning {
      background: rgba(199, 145, 0, 0.2);
      border-color: rgba(199, 145, 0, 0.5);
    }
    
    &.status-completed {
      background: rgba(33, 186, 69, 0.2);
      border-color: rgba(33, 186, 69, 0.5);
    }
    
    &.status-info {
      background: rgba(2, 136, 209, 0.2);
      border-color: rgba(2, 136, 209, 0.5);
    }
  }
}
</style>
