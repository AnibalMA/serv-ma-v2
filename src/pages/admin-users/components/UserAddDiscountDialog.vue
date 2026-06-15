<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--sm">
      <q-card-section class="bg-teal-8 text-white">
        <div class="text-h6">
          <q-icon name="add_card" class="q-mr-sm" />
          Nuevo Descuento - {{ selectedUser?.nom_usuario }}
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <div class="text-caption text-grey-7 q-mb-xs">
              Tipo de descuento
            </div>
            <q-btn-toggle
              v-model="form.tipo_desc"
              spread
              no-caps
              toggle-color="teal-8"
              :options="[
                {
                  label: 'Normal (único cobro)',
                  value: 'NORMAL',
                  icon: 'payments',
                },
                {
                  label: 'Combo (por boleta)',
                  value: 'COMBO',
                  icon: 'repeat',
                },
              ]"
            />
            <div class="text-caption text-grey-6 q-mt-xs">
              <span v-if="form.tipo_desc === 'NORMAL'">
                Se descuenta todo el monto de una sola vez en la próxima boleta.
              </span>
              <span v-else>
                Se descuenta el monto por boleta (factor) de forma periódica
                hasta agotar el saldo total.
              </span>
            </div>
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div
            :class="
              form.tipo_desc === 'COMBO'
                ? 'col-12 col-sm-6'
                : 'col-12'
            "
          >
            <q-input
              v-model.number="form.monto"
              label="Monto total del descuento (S/.)"
              :hint="
                form.tipo_desc === 'COMBO'
                  ? 'Saldo total disponible'
                  : 'Se aplica en un solo cobro'
              "
              outlined
              dense
              type="number"
              min="0.01"
              step="0.01"
              :rules="[(v) => v > 0 || 'Debe ser mayor a 0']"
            />
          </div>
          <div
            class="col-12 col-sm-6"
            v-if="form.tipo_desc === 'COMBO'"
          >
            <q-input
              v-model.number="form.factor"
              label="Descuento por boleta (S/.)"
              hint="Monto que se descuenta en cada boleta"
              outlined
              dense
              type="number"
              min="0.01"
              step="0.01"
              :rules="[(v) => v > 0 || 'Debe ser mayor a 0']"
            />
          </div>
        </div>
        <q-input
          v-model="form.descripcion"
          label="Descripción"
          outlined
          dense
          type="textarea"
          rows="2"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Registrar"
          color="teal"
          @click="$emit('save', form)"
          :disable="
            form.monto <= 0 ||
            (form.tipo_desc === 'COMBO' && form.factor <= 0)
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    selectedUser: Object,
  },
  emits: ["update:modelValue", "cancel", "save"],
  data() {
    return {
      form: {
        id_usuario: null,
        monto: 0,
        factor: 0,
        tipo_desc: "NORMAL",
        descripcion: "",
      },
    };
  },
  watch: {
    selectedUser: {
      immediate: true,
      handler(u) {
        if (!u?.id) return;
        this.form.id_usuario = u.id;
      },
    },
  },
};
</script>
