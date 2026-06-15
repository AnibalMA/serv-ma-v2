<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--sm">
      <q-card-section class="bg-cyan-8 text-white">
        <div class="text-h6">
          <q-icon name="person" class="q-mr-sm" />
          Detalles del Usuario
        </div>
      </q-card-section>
      <q-card-section v-if="user">
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Nombre completo</q-item-label>
              <q-item-label>
                {{ user.nom_usuario }} {{ user.ape_usuario }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="email" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Email</q-item-label>
              <q-item-label>{{ user.email_principal_usuario || "No registrado" }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="phone" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Celular</q-item-label>
              <q-item-label>{{ user.celular_principal_usuario || "No registrado" }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="circle" :color="isActive ? 'green' : 'red'" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Estado</q-item-label>
              <q-item-label>{{ isActive ? "Activo" : "Inactivo" }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
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
    isActive: Boolean,
  },
  emits: ["update:modelValue"],
};
</script>
