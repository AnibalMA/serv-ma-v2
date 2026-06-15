<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--sm">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="edit" class="q-mr-sm" />
          Editar servicio
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="form.desc_perfil"
          label="Perfil"
          outlined
          dense
          :rules="[(v) => !!v || 'Perfil requerido']"
        />
        <q-input
          v-model="form.pin"
          label="PIN"
          outlined
          dense
          :rules="[(v) => !!v || 'PIN requerido']"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Guardar"
          color="primary"
          @click="$emit('save', form)"
          :disable="!form.desc_perfil || !form.pin"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    service: Object,
  },
  emits: ["update:modelValue", "cancel", "save"],
  data() {
    return {
      form: {
        id_usuario_servicio: this.service?._serviceId || null,
        desc_perfil: this.service?.desc_perfil || "",
        pin: this.service?.pin || this.service?.pin_perfil || "",
      },
    };
  },
};
</script>
