<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--xs">
      <q-card-section class="bg-orange text-white">
        <div class="text-h6">
          <q-icon name="warning" class="q-mr-sm" />
          Confirmar acción
        </div>
      </q-card-section>
      <q-card-section>
        <p>{{ message }}</p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn
          flat
          label="Confirmar"
          color="primary"
          @click="$emit('confirm')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    message: String,
  },
  emits: ["update:modelValue", "confirm"],
};
</script>
