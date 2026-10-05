<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--lg">
      <q-card-section class="bg-purple-8 text-white">
        <div class="text-h6">
          <q-icon name="settings_applications" class="q-mr-sm" />
          Servicios de {{ selectedUser?.nom_usuario }}
          {{ selectedUser?.ape_usuario }}
        </div>
      </q-card-section>

      <q-card-section>
        <div v-if="loadingUserServices" class="flex flex-center q-py-lg">
          <q-spinner-dots size="40px" color="primary" />
        </div>

        <q-list v-else-if="userServices.length" bordered separator>
          <q-item v-for="service in userServices" :key="service._serviceId">
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ service.desc_plataforma || "Plataforma" }}
                <q-badge
                  v-if="service.desc_estado"
                  class="q-ml-sm"
                  color="primary"
                  :label="service.desc_estado"
                />
              </q-item-label>
              <q-item-label caption>
                Perfil: {{ service.desc_perfil || "-" }} | PIN:
                {{ service.pin || service.pin_perfil || "-" }}
              </q-item-label>
              <q-item-label caption>
                Día pago: {{ service.dia_pago ?? "-" }} | Monto:
                {{
                  service.monto !== null && service.monto !== undefined
                    ? formatMoney(service.monto)
                    : "-"
                }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="$emit('edit-service', service)"
                >
                  <q-tooltip>Editar perfil/PIN</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="block"
                  @click="$emit('deactivate-service', service)"
                >
                  <q-tooltip>Dar de baja servicio</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-center q-py-lg text-grey-6">
          <q-icon name="tv_off" size="3rem" />
          <div class="q-mt-sm">No tiene servicios registrados</div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Recargar"
          color="primary"
          icon="refresh"
          @click="$emit('reload')"
          :loading="loadingUserServices"
        />
        <q-btn flat label="Cerrar" color="grey" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { formatMoney } from "src/utils/format";

export default {
  props: {
    modelValue: Boolean,
    selectedUser: Object,
    userServices: Array,
    loadingUserServices: Boolean,
  },
  emits: [
    "update:modelValue",
    "edit-service",
    "deactivate-service",
    "reload",
  ],
  methods: {
    formatMoney,
  },
};
</script>
