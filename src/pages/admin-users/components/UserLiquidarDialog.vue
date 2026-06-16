<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--md">
      <q-card-section class="bg-deep-orange-8 text-white">
        <div class="text-h6">
          <q-icon name="done_all" class="q-mr-sm" />
          Liquidar cobros — {{ user?.nom_usuario }} {{ user?.ape_usuario }}
        </div>
        <div class="text-caption q-mt-xs">
          Los cobros pagados pasarán de cobrador a administración
        </div>
      </q-card-section>

      <q-card-section>
        <div v-if="loading" class="flex flex-center q-py-lg">
          <q-spinner-dots size="40px" color="deep-orange" />
        </div>

        <template v-else>
          <div v-if="boletas.length">
            <div :class="$q.dark.isActive ? 'text-caption text-grey-6 q-mb-xs' : 'text-caption text-grey-7 q-mb-xs'">
              Cobros a liquidar ({{ boletas.length }})
            </div>
            <q-list bordered separator dense>
              <q-item v-for="b in boletas" :key="b.id">
                <q-item-section>
                  <q-item-label>{{ b.cod_boleta || `#${b.id}` }}</q-item-label>
                  <q-item-label caption>
                    {{ b.fecha_emision ? b.fecha_emision.substring(0, 10) : "—" }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    color="green-8"
                    :label="`S/. ${Number(b.monto_facturado || 0).toFixed(2)}`"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <div class="q-mt-sm text-right">
              <span class="text-subtitle2 text-weight-bold">
                Total a liquidar: S/.
                {{ total.toFixed(2) }}
              </span>
            </div>
          </div>

          <div v-else class="text-center q-py-sm text-grey-6">
            <q-icon name="check_circle" size="2rem" color="green" />
            <div class="q-mt-xs">No hay cobros pendientes de liquidar</div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Confirmar liquidación"
          color="deep-orange-8"
          icon="done_all"
          @click="$emit('confirm')"
          :disable="loading || !boletas.length"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    user: Object,
    boletas: Array,
    loading: Boolean,
  },
  emits: ["update:modelValue", "cancel", "confirm"],
  computed: {
    total() {
      return (this.boletas || []).reduce(
        (sum, b) => sum + Number(b.monto_facturado || 0),
        0
      );
    },
  },
};
</script>
