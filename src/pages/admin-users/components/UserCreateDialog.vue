<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--md">
      <q-card-section class="bg-positive text-white">
        <div class="text-h6">
          <q-icon name="person_add" class="q-mr-sm" />
          Crear usuario
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.nom_usuario"
              label="Nombre"
              outlined
              dense
              :rules="[(v) => !!v || 'Nombre requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.ape_usuario"
              label="Apellido"
              outlined
              dense
              :rules="[(v) => !!v || 'Apellido requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.email_principal_usuario"
              label="Email"
              outlined
              dense
              type="email"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.celular_principal_usuario"
              label="Celular"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.usernameL"
              label="Usuario login"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.passL"
              label="Contraseña"
              outlined
              dense
              type="password"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.num_contacto_prov"
              label="Número contacto proveedor"
              outlined
              dense
              :rules="[(v) => !!v || 'Campo requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.num_opc"
              label="Número opción"
              outlined
              dense
              type="number"
              min="1"
              :rules="[(v) => !!v || 'Campo requerido']"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Crear"
          color="positive"
          @click="$emit('save', form)"
          :disable="
            !form.nom_usuario ||
            !form.ape_usuario ||
            !form.num_contacto_prov ||
            !form.num_opc
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
  },
  emits: ["update:modelValue", "cancel", "save"],
  data() {
    return {
      form: {
        nom_usuario: "",
        ape_usuario: "",
        email_principal_usuario: "",
        celular_principal_usuario: "",
        usernameL: "",
        passL: "",
        num_contacto_prov: "",
        num_opc: "1",
      },
    };
  },
};
</script>
