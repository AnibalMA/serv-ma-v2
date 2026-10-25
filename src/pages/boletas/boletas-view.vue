<template>
  <q-page class="flex-center">
    <div class="q-pa-sm">
      <q-table
        flat
        :title="`Boletas (${arr_boletas.length})`"
        :grid="$q.screen.xs"
        :rows="arr_boletas"
        :columns="arr_boletas_col"
        row-key="cod_boleta"
        :rows-per-page-options="['7']"
        :visible-columns="
          optBoleta === 'Pending'
            ? [
                'cod_boleta',
                'fecha_emision',
                'monto_facturado',
                'desc_estado',
                'actions',
              ]
            : [
                'cod_boleta',
                'fecha_emision',
                'monto_facturado',
                'fecha_cancelado',
                'monto_cancelado',
                'desc_estado',
                'actions',
              ]
        "
      >
        <template v-slot:top-right>
          <q-select
            v-model="optBoleta"
            :options="options"
            emit-value
            map-options
            label="Mostrar"
            :dense="true"
            :borderless="true"
            @update:model-value="onSelectOpt"
          >
            <template v-slot:prepend>
              <q-icon name="manage_history" />
              <!-- <q-avatar>
                                <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg">
                            </q-avatar> -->
            </template>
          </q-select>
        </template>
        <template v-slot:item="props">
          <!-- <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
                        :style="props.selected ? 'transform: scale(0.95);' : ''"> -->
          <q-card bordered flat class="col-12">
            <q-list dense>
              <q-item
                v-for="col in getVisibleBoletaCols(props.cols, props.row)"
                :key="col.name"
                class="q-my-sm"
              >
                <q-item-section>
                  <q-item-label>{{ col.label }}</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    v-if="!['desc_estado', 'actions'].includes(col.name)"
                    caption
                    >{{ col.value }}</q-item-label
                  >
                  <q-item-label caption v-if="col.name == 'desc_estado'">
                    <q-chip
                      :color="
                        props.row.bProcessValidation
                          ? 'blue'
                          : col.value == 'Pendiente'
                          ? 'orange'
                          : 'green'
                      "
                      text-color="white"
                    >
                      {{
                        props.row.bProcessValidation
                          ? "En Validación"
                          : col.value
                      }}
                    </q-chip>
                  </q-item-label>
                  <q-item-label caption v-if="col.name == 'actions'">
                    <q-btn
                      icon="picture_as_pdf"
                      @click="onViewBoleta(props.row)"
                      round
                      color="red"
                      class="q-mr-sm"
                      dense
                    ></q-btn>
                    <q-btn
                      icon="cloud_download"
                      @click="onDownloadBoleta(props.row)"
                      round
                      color="primary"
                      class="q-mr-sm"
                      dense
                    ></q-btn>
                    <q-btn
                      v-if="
                        props.row.desc_estado === 'Pendiente' &&
                        !props.row.bProcessValidation
                      "
                      icon="payment"
                      @click="onPayBoleta(props.row)"
                      round
                      color="green"
                      dense
                    ></q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
          <!-- </div> -->
        </template>
        <template v-slot:no-data="{}">
          <div class="full-width row flex-center text-cyan-8 q-gutter-sm">
            <span style="font-weight: bold; font-size: 15px">
              No existen datos a mostrar
            </span>
            <q-icon size="2em" name="sentiment_dissatisfied" />
          </div>
        </template>
        <!-- <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="cod_boleta" :props="props">
                            {{ props.row.cod_boleta }}
                        </q-td>
                        <q-td key="fecha_emision" :props="props">
                            {{ formatDate(props.row.fecha_emision) }}
                        </q-td>
                        <q-td key="monto_facturado" :props="props">
                            {{ formatPrice(props.row.monto_facturado) }}
                        </q-td>
                        <q-td key="fecha_cancelado" :props="props">
                            {{ formatDate(props.row.fecha_cancelado) }}
                        </q-td>
                        <q-td key="monto_cancelado" :props="props">
                            {{ formatPrice(props.row.monto_cancelado) }}
                        </q-td>
                        <q-td key="desc_estado" :props="props">
                            <q-chip :color="props.row.desc_estado == 'Pendiente' ? 'orange' : 'green'" text-color="white">
                                {{ props.row.desc_estado }}
                            </q-chip>
                        </q-td>
                    </q-tr>
                </template> -->
        <template v-slot:body-cell-desc_estado="props">
          <q-td :props="props">
            <q-chip
              :color="
                props.row.bProcessValidation
                  ? 'blue'
                  : props.row.desc_estado == 'Pendiente'
                  ? 'orange'
                  : 'green'
              "
              :icon="
                props.row.bProcessValidation
                  ? 'hourglass_empty'
                  : props.row.desc_estado == 'Pendiente'
                  ? 'schedule'
                  : 'check_circle'
              "
              text-color="white"
            >
              {{
                props.row.bProcessValidation
                  ? "En Validación"
                  : props.row.desc_estado
              }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              icon="picture_as_pdf"
              @click="onViewBoleta(props.row)"
              round
              color="red"
              class="q-mr-sm"
              dense
            ></q-btn>
            <q-btn
              icon="cloud_download"
              @click="onDownloadBoleta(props.row)"
              round
              color="primary"
              class="q-mr-sm"
              dense
            ></q-btn>
            <q-btn
              v-if="
                props.row.desc_estado === 'Pendiente' &&
                !props.row.bProcessValidation
              "
              icon="payment"
              @click="onPayBoleta(props.row)"
              round
              color="green"
              dense
            ></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Modal de Pago -->
    <q-dialog v-model="showPaymentModal" persistent>
      <q-card class="payment-card">
        <q-card-section>
          <div class="text-h6">Realizar Pago</div>
        </q-card-section>

        <!-- Solo esta parte se desplaza, así los botones siempre se ven en el celular -->
        <q-card-section class="q-pt-none scroll payment-body">
          <div class="row q-gutter-sm q-mb-md">
            <q-chip
              :label="`Boleta: ${selectedBoleta?.cod_boleta}`"
              color="grey-7"
              text-color="white"
              size="md"
              icon="receipt"
            />
            <q-chip
              :label="`Por pagar: ${formatMoney(amountToPay)}`"
              color="green"
              text-color="white"
              size="md"
              icon="attach_money"
            />
          </div>

          <!-- Selección de método de pago -->
          <q-select
            v-model="selectedPaymentMethod"
            :options="paymentOptions"
            option-label="nom_payment_opc"
            option-value="id"
            label="Método de Pago"
            filled
            class="q-mb-md"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.nom_payment_opc }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.desc_payment_opc">
                    {{ scope.opt.desc_payment_opc }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Mostrar detalles del método de pago seleccionado -->
          <q-card v-if="selectedPaymentMethod" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">
                {{ selectedPaymentMethod.nom_payment_opc }}
              </div>
              <div
                class="text-caption q-mb-sm"
                v-if="selectedPaymentMethod.desc_payment_opc"
              >
                {{ selectedPaymentMethod.desc_payment_opc }}
              </div>
              <div
                class="q-mb-sm"
                v-if="selectedPaymentMethod.detalles_payment_opc"
              >
                <div class="row items-center q-gutter-sm">
                  <div class="col">
                    <q-chip
                      :label="selectedPaymentMethod.detalles_payment_opc"
                      color="primary"
                      text-color="white"
                      size="md"
                      icon="account_balance"
                    />
                  </div>
                  <q-btn
                    icon="content_copy"
                    @click="
                      copyToClipboard(
                        selectedPaymentMethod.detalles_payment_opc
                      )
                    "
                    round
                    color="primary"
                    size="sm"
                    dense
                    aria-label="Copiar número"
                  >
                    <q-tooltip>Copiar número</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Pago con QR (Yape) -->
          <div v-if="selectedPaymentMethod?.qr_url" class="q-mb-md">
            <div class="text-center q-mb-sm">
              <div class="text-caption">Monto a pagar</div>
              <div class="text-h4 text-weight-bold text-positive amount">
                {{ formatMoney(amountToPay) }}
              </div>
            </div>

            <!-- Fondo blanco para que el QR se pueda escanear también en modo oscuro -->
            <div class="qr-box">
              <q-img
                :src="selectedPaymentMethod.qr_url"
                :alt="`Código QR de ${selectedPaymentMethod.nom_payment_opc}`"
                :ratio="1"
                fit="contain"
                spinner-color="primary"
              />
            </div>

            <div v-if="$q.platform.has.touch" class="text-center q-mt-sm">
              <q-btn
                v-if="$q.platform.is.android"
                :href="qrDownloadUrl"
                outline
                no-caps
                color="primary"
                icon="download"
                label="Descargar QR"
              />
              <div v-if="$q.platform.is.ios" class="text-caption text-grey-6">
                Mantén presionado el QR y toca «Guardar en Fotos»; luego elígelo
                desde la galería en Yape.
              </div>
              <div v-else class="text-caption text-grey-6 q-mt-xs">
                También puedes mantener presionado el QR para guardarlo.
              </div>
            </div>

            <ol class="q-pl-lg q-mt-md q-mb-none text-body2">
              <li>
                Abre Yape y escanea el código (en el celular: guárdalo y
                elígelo desde la galería en Yape).
              </li>
              <li>
                Paga <strong>{{ formatMoney(amountToPay) }}</strong>.
              </li>
              <li>Escribe el número de operación y sube la captura.</li>
            </ol>
          </div>

          <!-- Mensaje informativo (métodos sin QR) -->
          <q-card
            v-else-if="selectedPaymentMethod"
            flat
            bordered
            class="q-mb-md bg-blue-1"
          >
            <q-card-section>
              <div class="row items-start q-gutter-sm">
                <q-icon name="info" color="blue" size="md" aria-hidden="true" />
                <div class="col text-blue-9">
                  <div class="text-body2">
                    <strong>Instrucciones:</strong>
                  </div>
                  <div class="text-body2">
                    Después de pagar, escribe el número de operación y adjunta
                    el comprobante (captura de pantalla) del pago realizado.
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Número de operación -->
          <q-input
            v-model="operationNumber"
            label="Número de operación"
            name="nro_operacion"
            hint="Está en la constancia del pago"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            filled
            lazy-rules
            :rules="operationNumberRules"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="tag" aria-hidden="true" />
            </template>
          </q-input>

          <!-- Subir captura -->
          <div class="text-subtitle2 q-mb-sm">
            Adjuntar Captura de Transacción
          </div>
          <q-file
            v-model="captureFile"
            accept="image/*"
            filled
            label="Seleccionar imagen"
            :loading="processingCapture"
            @update:model-value="onFileSelected"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" aria-hidden="true" />
            </template>
          </q-file>

          <div role="status" aria-live="polite" class="text-caption text-grey-6">
            {{ processingCapture ? "Preparando la imagen…" : "" }}
          </div>

          <!-- Vista previa de la imagen -->
          <div v-if="paymentCapture" class="q-mb-md">
            <div class="text-caption q-mb-sm">Vista previa:</div>
            <q-img
              :src="paymentCapture"
              alt="Vista previa de la captura del pago"
              fit="contain"
              style="max-width: 200px; max-height: 200px"
              class="rounded-borders"
            />
          </div>

          <!-- Campo de comentarios -->
          <div v-if="selectedPaymentMethod">
            <div class="text-subtitle2 q-mb-sm">Comentarios (Opcional)</div>
            <q-input
              v-model="paymentComment"
              type="textarea"
              filled
              rows="3"
              placeholder="Escribe aquí cualquier comentario adicional sobre el pago…"
              aria-label="Comentarios (opcional)"
              counter
              maxlength="500"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="cancelPayment" />
          <q-btn
            unelevated
            label="Enviar a Revisión"
            color="primary"
            @click="submitPaymentVerification"
            :disable="processingCapture"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script src="./index.js" />

<style scoped>
.payment-card {
  width: 100%;
  max-width: 480px;
}

.payment-body {
  max-height: 65vh;
  overscroll-behavior: contain;
}

/* White background so the QR can be scanned in dark mode too */
.qr-box {
  max-width: 260px;
  margin: 0 auto;
  padding: 12px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.amount {
  font-variant-numeric: tabular-nums;
}
</style>
