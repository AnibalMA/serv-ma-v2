<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--md">
      <q-card-section class="bg-cyan-8 text-white">
        <div class="text-h6">
          <q-icon name="edit" class="q-mr-sm" />
          Editar Usuario
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="form.nom_usuario"
          label="Nombre"
          outlined
          dense
          :rules="[(v) => !!v || 'Nombre es requerido']"
        />
        <q-input
          v-model="form.ape_usuario"
          label="Apellido"
          outlined
          dense
          :rules="[(v) => !!v || 'Apellido es requerido']"
        />
        <q-input
          v-model="form.email_principal_usuario"
          label="Email"
          outlined
          dense
          type="email"
        />
        <q-input
          v-model="form.celular_principal_usuario"
          label="Celular"
          outlined
          dense
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Guardar"
          color="primary"
          @click="$emit('save', form)"
          :disable="!form.nom_usuario || !form.ape_usuario"
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
  },
  emits: ["update:modelValue", "cancel", "save"],
  data() {
    return {
      form: {
        id_usuario: this.user?.id || null,
        nom_usuario: this.user?.nom_usuario || "",
        ape_usuario: this.user?.ape_usuario || "",
        email_principal_usuario: this.user?.email_principal_usuario || "",
        celular_principal_usuario: this.user?.celular_principal_usuario || "",
      },
    };
  },
};
</script>
