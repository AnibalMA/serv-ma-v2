<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card :style="$q.screen.lt.sm ? 'min-width: 280px; max-width: 95vw' : 'min-width: 400px'">
      <q-toolbar class="bg-primary text-white">
        <q-icon name="bar_chart" class="q-mr-sm" />
        <q-toolbar-title>Resumen de Uso</q-toolbar-title>
        <q-btn flat round icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section>
        <q-list bordered separator :loading="loading">
          <q-item v-for="item in items" :key="item.command">
            <q-item-section avatar>
              <q-icon name="terminal" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ item.commandLabel }}</q-item-label>
              <q-item-label caption>{{ item.useCount }} uso(s) — {{ item.totalSpent }} créditos gastados</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="!items.length && !loading">
            <q-item-section class="text-grey text-center">Sin registros de uso</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    items: Array,
    loading: Boolean,
  },
  emits: ["update:modelValue"],
};
</script>
