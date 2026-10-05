<template>
  <div>
    <div class="row items-center q-mb-md">
      <div class="col text-caption text-grey-6">
        Lo que ven los clientes al pagar una boleta. El QR aparece en el método
        que lo tenga.
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo método"
          no-caps
          @click="$emit('new')"
        />
      </div>
    </div>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="primary"
      class="q-mb-md"
    />

    <div v-if="!loading && !options.length" class="text-center text-grey-6 q-pa-lg">
      Aún no hay métodos de pago
    </div>

    <div class="row q-col-gutter-md">
      <div
        v-for="option in options"
        :key="option.id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <q-card flat bordered class="full-height column">
          <q-card-section class="row no-wrap items-start">
            <!-- Miniatura del QR -->
            <div class="qr-thumb q-mr-md">
              <q-img
                v-if="option.qr_url"
                :src="option.qr_url"
                :alt="`Código QR de ${option.nom_payment_opc}`"
                :ratio="1"
                fit="contain"
                spinner-color="primary"
              />
              <div
                v-else
                class="full-height column flex-center text-grey-7 text-caption"
              >
                <q-icon name="qr_code_2" size="32px" aria-hidden="true" />
                Sin QR
              </div>
            </div>

            <div class="col" style="min-width: 0">
              <div class="text-subtitle1 text-weight-bold ellipsis">
                {{ option.nom_payment_opc }}
              </div>
              <div
                v-if="option.desc_payment_opc"
                class="text-caption text-grey-6 break-text"
              >
                {{ option.desc_payment_opc }}
              </div>
              <div
                v-if="option.detalles_payment_opc"
                class="text-body2 q-mt-xs break-text"
              >
                <q-icon name="account_balance" class="q-mr-xs" aria-hidden="true" />
                {{ option.detalles_payment_opc }}
              </div>
            </div>
          </q-card-section>

          <q-space />

          <div class="row items-center q-gutter-sm q-px-md q-pb-md">
            <q-btn
              outline
              dense
              no-caps
              color="primary"
              icon="edit"
              label="Editar"
              class="q-px-sm"
              @click="$emit('edit', option)"
            />
            <q-file
              :model-value="null"
              accept="image/jpeg,image/png,image/webp"
              :label="option.qr_url ? 'Cambiar QR' : 'Subir QR'"
              :loading="uploadingQrId === option.id"
              :disable="uploadingQrId !== null"
              outlined
              dense
              class="qr-file"
              @update:model-value="(file) => $emit('upload-qr', option, file)"
              @rejected="$emit('qr-rejected')"
            >
              <template #prepend>
                <q-icon name="upload" aria-hidden="true" />
              </template>
            </q-file>
            <q-btn
              v-if="option.qr_url"
              flat
              dense
              no-caps
              color="negative"
              icon="delete"
              label="Quitar QR"
              class="q-px-sm"
              :disable="uploadingQrId !== null"
              @click="$emit('remove-qr', option)"
            />
          </div>
        </q-card>
      </div>
    </div>

    <div class="text-caption text-grey-6 q-mt-md">
      El QR debe ser una imagen JPG, PNG o WEBP de 2&nbsp;MB o menos.
    </div>
  </div>
</template>

<script>
// Shows the payment options; the page does the requests (see methods.js)
export default {
  props: {
    options: { type: Array, default: () => [] },
    loading: Boolean,
    // id of the option whose QR is being uploaded or removed
    uploadingQrId: { type: [Number, String], default: null },
  },
  emits: ["new", "edit", "upload-qr", "qr-rejected", "remove-qr"],
};
</script>

<style scoped>
/* White background so the QR looks right in dark mode too */
.qr-thumb {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  padding: 4px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
}

.qr-file {
  width: 150px;
}

.break-text {
  overflow-wrap: anywhere;
}
</style>
