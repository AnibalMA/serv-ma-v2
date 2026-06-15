<template>
  <q-page class="q-pa-md">
    <!-- Cabecera -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary q-mb-xs">
          <q-icon name="verified" class="q-mr-sm" />
          Validar Pagos
        </div>
        <div class="text-caption text-grey-6">
          Solicitudes de verificación de pago pendientes de aprobación
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          flat
          round
          icon="refresh"
          color="primary"
          :loading="loading"
          @click="loadPaymentRequests"
          title="Recargar"
        />
      </div>
    </div>

    <!-- Buscador -->
    <div class="row q-mb-md">
      <div class="col-12 col-sm-5">
        <q-input
          v-model="searchTerm"
          outlined
          dense
          placeholder="Buscar por usuario, boleta, método de pago..."
          clearable
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-auto q-ml-sm self-center">
        <q-badge
          :color="arr_requests.length ? 'amber-8' : 'positive'"
          text-color="white"
          class="q-pa-xs text-subtitle2"
        >
          {{ filteredRequests().length }} pendiente(s)
        </q-badge>
      </div>
    </div>

    <!-- Tabla de solicitudes -->
    <q-table
      :rows="filteredRequests()"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      binary-state-sort
      :rows-per-page-options="[10, 20, 50]"
      no-data-label="No hay solicitudes pendientes de validación"
      :grid="$q.screen.lt.md"
      :hide-header="$q.screen.lt.md"
    >
      <template v-slot:item="props">
        <div class="col-12">
          <q-card flat bordered class="q-pa-sm q-mb-sm">
            <!-- Acciones + Estado badge -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="col">
                <q-chip
                  v-if="props.row.nom_payment_opc"
                  color="blue-grey-7"
                  text-color="white"
                  size="sm"
                  dense
                  :label="props.row.nom_payment_opc"
                />
                <span v-else class="text-caption text-grey-5">Sin método de pago</span>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  dense
                  icon="check_circle"
                  color="positive"
                  size="sm"
                  @click="onApproveRequest(props.row)"
                >
                  <q-tooltip>Aprobar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="cancel"
                  color="red-8"
                  size="sm"
                  class="q-ml-xs"
                  @click="onRejectRequest(props.row)"
                >
                  <q-tooltip>Rechazar</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Usuario -->
            <div class="text-weight-medium">
              {{ props.row.nom_usuario }} {{ props.row.ape_usuario }}
            </div>
            <div class="text-caption text-grey-6">
              {{ props.row.email_usuario }}
            </div>

            <!-- Boleta + Montos -->
            <div class="row q-mt-sm q-col-gutter-sm">
              <div class="col-6">
                <div class="text-caption text-grey-7">N° Boleta</div>
                <div class="text-body2">{{ props.row.cod_boleta }}</div>
              </div>
              <div class="col-6 text-right">
                <div class="text-caption text-grey-7">Monto declarado</div>
                <div class="text-body2 text-weight-bold"
                  :class="props.row.monto_declarado >= (props.row.monto_facturado - (props.row.monto_cancelado || 0)) ? 'text-positive' : 'text-orange-8'"
                >
                  {{ formatMonto(props.row.monto_declarado) }}
                </div>
              </div>
            </div>

            <!-- Comprobante imagen -->
            <div class="row q-mt-sm items-center" v-if="props.row.screenshot_data">
              <q-btn
                icon="image"
                flat
                dense
                color="primary"
                size="sm"
                @click="onViewScreenshot(props.row)"
                label="Ver comprobante"
              />
            </div>

            <!-- Comentarios -->
            <div v-if="props.row.comments" class="text-caption text-grey-6 q-mt-xs">
              {{ props.row.comments }}
            </div>

            <!-- Fecha -->
            <div class="text-caption text-grey-5 text-right q-mt-xs">
              {{ formatFecha(props.row.created_at) }}
            </div>
          </q-card>
        </div>
      </template>
      <!-- Columna: acciones -->
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            round
            dense
            icon="check_circle"
            color="positive"
            @click="onApproveRequest(props.row)"
            title="Aprobar pago"
          >
            <q-tooltip>Aprobar pago</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="cancel"
            color="red-8"
            class="q-ml-xs"
            @click="onRejectRequest(props.row)"
            title="Rechazar"
          >
            <q-tooltip>Rechazar solicitud</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- Columna: usuario -->
      <template #body-cell-nom_usuario="props">
        <q-td :props="props">
          <div class="text-weight-medium">
            {{ props.row.nom_usuario }} {{ props.row.ape_usuario }}
          </div>
          <div class="text-caption text-grey-6">
            {{ props.row.email_usuario }}
          </div>
        </q-td>
      </template>

      <!-- Columna: monto boleta -->
      <template #body-cell-monto_facturado="props">
        <q-td :props="props" class="text-right">
          <span class="text-weight-medium">{{
            formatMonto(props.row.monto_facturado)
          }}</span>
          <div
            v-if="props.row.monto_cancelado > 0"
            class="text-caption text-positive"
          >
            Pagado: {{ formatMonto(props.row.monto_cancelado) }}
          </div>
        </q-td>
      </template>

      <!-- Columna: monto declarado -->
      <template #body-cell-monto_declarado="props">
        <q-td :props="props" class="text-right">
          <span
            :class="
              props.row.monto_declarado >=
              props.row.monto_facturado - props.row.monto_cancelado
                ? 'text-positive text-weight-bold'
                : 'text-orange-8 text-weight-bold'
            "
          >
            {{ formatMonto(props.row.monto_declarado) }}
          </span>
        </q-td>
      </template>

      <!-- Columna: método de pago -->
      <template #body-cell-nom_payment_opc="props">
        <q-td :props="props">
          <q-badge color="blue-grey-7" text-color="white" class="q-pa-xs">
            {{ props.row.nom_payment_opc || "Sin especificar" }}
          </q-badge>
          <div
            v-if="props.row.detalles_payment_opc"
            class="text-caption text-grey-6 q-mt-xs"
          >
            {{ props.row.detalles_payment_opc }}
          </div>
        </q-td>
      </template>

      <!-- Columna: comentarios -->
      <template #body-cell-comments="props">
        <q-td :props="props">
          <span class="text-caption">{{ props.row.comments || "-" }}</span>
        </q-td>
      </template>

      <!-- Columna: comprobante -->
      <template #body-cell-screenshot="props">
        <q-td :props="props" class="text-center">
          <q-btn
            v-if="props.row.screenshot_data"
            flat
            round
            dense
            icon="image"
            color="primary"
            @click="onViewScreenshot(props.row)"
            title="Ver comprobante"
          >
            <q-tooltip>Ver comprobante</q-tooltip>
          </q-btn>
          <span v-else class="text-grey-5 text-caption">Sin imagen</span>
        </q-td>
      </template>

      <!-- Columna: fecha -->
      <template #body-cell-created_at="props">
        <q-td :props="props" class="text-center text-caption">
          {{ formatFecha(props.row.created_at) }}
        </q-td>
      </template>
    </q-table>

    <!-- ══════════════════════════════════════════════
         Dialog: ver comprobante / captura de pantalla
    ══════════════════════════════════════════════ -->
    <q-dialog v-model="showScreenshotDialog" maximized>
      <q-card style="max-width: 900px; width: 100%">
        <q-card-section class="row items-center q-pb-none bg-blue-grey-9">
          <div class="text-subtitle1 text-white">
            <q-icon name="image" class="q-mr-sm" />
            {{ currentScreenshotTitle }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>
        <q-card-section class="flex flex-center q-pa-md">
          <img
            v-if="currentScreenshot"
            :src="currentScreenshot"
            style="
              max-width: 100%;
              max-height: 75vh;
              border-radius: 8px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            "
            alt="Comprobante de pago"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════
         Dialog: confirmar aprobación
    ══════════════════════════════════════════ -->
    <q-dialog v-model="showApproveDialog" persistent>
      <q-card style="min-width: 350px; max-width: 480px; width: 100%">
        <q-card-section class="row items-center bg-positive">
          <q-icon
            name="check_circle"
            color="white"
            size="28px"
            class="q-mr-sm"
          />
          <span class="text-h6 text-white">Confirmar Aprobación</span>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-body1">¿Aprobar el pago de la siguiente solicitud?</p>
          <q-list dense bordered rounded class="rounded-borders q-mb-sm">
            <q-item>
              <q-item-section>
                <q-item-label caption>Usuario</q-item-label>
                <q-item-label>{{ approveForm.nom_usuario }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>N° Boleta</q-item-label>
                <q-item-label>{{ approveForm.cod_boleta }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Monto declarado</q-item-label>
                <q-item-label class="text-positive text-weight-bold">
                  {{ formatMonto(approveForm.monto_declarado) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <p class="text-caption text-grey-7 q-ma-none">
            Esta acción actualizará el estado de la boleta y no puede
            deshacerse.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
            :disable="loadingAction"
          />
          <q-btn
            label="Sí, aprobar"
            color="positive"
            icon="check_circle"
            :loading="loadingAction"
            @click="confirmApprove"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════
         Dialog: rechazar solicitud
    ══════════════════════════════════════════ -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card style="min-width: 350px; max-width: 480px; width: 100%">
        <q-card-section class="row items-center bg-red-8">
          <q-icon name="cancel" color="white" size="28px" class="q-mr-sm" />
          <span class="text-h6 text-white">Rechazar Solicitud</span>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-body2 q-mb-sm">
            Rechazando solicitud de
            <strong>{{ rejectForm.nom_usuario }}</strong> — boleta
            <strong>{{ rejectForm.cod_boleta }}</strong>
          </p>
          <q-input
            v-model="rejectForm.motivoRechazo"
            outlined
            autofocus
            type="textarea"
            rows="3"
            label="Motivo de rechazo *"
            placeholder="Indique el motivo por el que se rechaza esta solicitud..."
            :rules="[(val) => !!val.trim() || 'El motivo es obligatorio']"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
            :disable="loadingAction"
          />
          <q-btn
            label="Rechazar"
            color="red-8"
            icon="cancel"
            :loading="loadingAction"
            @click="confirmReject"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import componentOptions from "./index.js";
export default {
  name: "AdminPaymentsView",
  ...componentOptions,
};
</script>

<style scoped>
@media (max-width: 599px) {
  .text-h5 {
    font-size: 1.3rem;
    line-height: 1.2;
  }
}
</style>
