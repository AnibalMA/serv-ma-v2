<template>
  <q-dialog :model-value="modelValue" maximized @update:model-value="$emit('update:modelValue', $event)">
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-icon name="history" class="q-mr-sm" />
        <q-toolbar-title>Historial de Créditos</q-toolbar-title>
        <q-btn flat round icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section>
        <q-table
          :rows="rows"
          :columns="[
            { name: 'date', label: 'Fecha', field: 'date', sortable: true },
            { name: 'type', label: 'Tipo', field: 'type', sortable: true },
            { name: 'command', label: 'Comando', field: 'commandLabel', sortable: true },
            { name: 'amount', label: 'Monto', field: 'amount', sortable: true },
            { name: 'balanceAfter', label: 'Saldo', field: 'balanceAfter', sortable: true },
          ]"
          row-key="id"
          flat
          bordered
          :loading="loading"
          :pagination="{ rowsPerPage: 15 }"
        >
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-badge
                :color="props.value === 'credit' ? 'green' : 'red'"
                :label="props.value === 'credit' ? 'Recarga' : 'Uso'"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-amount="props">
            <q-td :props="props">
              <span :class="props.value > 0 ? 'text-green text-weight-bold' : 'text-red text-weight-bold'">
                {{ props.value > 0 ? "+" : "" }}{{ props.value }}
              </span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    rows: Array,
    loading: Boolean,
  },
  emits: ["update:modelValue"],
};
</script>
