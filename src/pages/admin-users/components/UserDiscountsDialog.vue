<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--md">
      <q-card-section class="bg-orange-8 text-white">
        <div class="text-h6">
          <q-icon name="discount" class="q-mr-sm" />
          Descuentos de {{ user?.nom_usuario }} {{ user?.ape_usuario }}
        </div>
      </q-card-section>
      <q-card-section>
        <div v-if="loading" class="flex flex-center q-py-lg">
          <q-spinner-dots size="40px" color="primary" />
        </div>
        <q-list v-else-if="discounts.length" bordered separator>
          <q-item v-for="d in discounts" :key="d.id" class="q-py-sm">
            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                d.desc_nota_short || d.desc_nota || "Sin descripción"
              }}</q-item-label>
              <q-item-label caption>{{ d.desc_nota }}</q-item-label>
              <q-item-label caption>
                Por boleta: S/. {{ Number(d.factor_desc || 0).toFixed(2) }}
                &nbsp;|&nbsp; Tipo: {{ d.tipo_desc || "-" }} &nbsp;|&nbsp; ID: {{ d.id }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                color="green"
                :label="`S/. ${Number(d.monto_descuento || 0).toFixed(2)}`"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-center q-py-lg text-grey-6">
          <q-icon name="money_off" size="3rem" />
          <div class="q-mt-sm">No tiene descuentos registrados</div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    user: Object,
    discounts: Array,
    loading: Boolean,
  },
  emits: ["update:modelValue"],
};
</script>
