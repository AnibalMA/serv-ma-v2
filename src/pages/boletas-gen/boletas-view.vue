<template>
  <q-page class="flex-center">
    <div class="col-12 q-pa-sm">
      <!-- Selector de usuario -->
      <div class="row q-mb-md">
        <div class="col-6">
          Seleccionar usuario:
          <q-select
            v-model="optUser"
            :options="arr_users"
            label="Mostrar"
            :dense="true"
            :borderless="true"
            @update:model-value="onSelectUser"
          >
            <template v-slot:prepend>
              <q-icon name="manage_history" />
            </template>
          </q-select>
        </div>
        <div class="col-6 self-center">
          <q-btn
            color="primary"
            label="Generar"
            @click="showBoletaDialog = true"
            v-if="this.optUser.value"
          />
        </div>
      </div>

      <!-- Selector de vista -->
      <div class="q-mb-md">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="boletas" label="Boletas" />
          <q-tab name="servicios" label="Servicios" />
        </q-tabs>
      </div>

      <!-- Tabla de Boletas -->
      <div class="col-12" v-show="activeTab === 'boletas'">
        <q-table
          flat
          :title="`Boletas (${arr_boletas.length})`"
          :grid="$q.screen.xs"
          :rows="arr_boletas"
          :columns="arr_boletas_col"
          row-key="cod_boleta"
          :rows-per-page-options="['7']"
          :visible-columns="
            optBoleta == 'Pendientes'
              ? [
                  'cod_boleta',
                  'fecha_emision',
                  'monto_facturado',
                  'desc_estado',
                  'actions_boleta',
                ]
              : [
                  'cod_boleta',
                  'fecha_emision',
                  'monto_facturado',
                  'fecha_cancelado',
                  'monto_cancelado',
                  'desc_estado',
                  'actions_boleta',
                ]
          "
        >
          <template v-slot:top-right>
            <q-select
              v-model="optBoleta"
              :options="options"
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
                  v-for="col in props.cols.filter((col) =>
                    props.row.desc_estado == 'Pendiente'
                      ? !['monto_cancelado', 'fecha_cancelado'].includes(
                          col.name
                        )
                      : true
                  )"
                  :key="col.name"
                  class="q-my-sm"
                >
                  <q-item-section>
                    <q-item-label>{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      v-if="
                        !['desc_estado', 'actions_boleta'].includes(col.name)
                      "
                      caption
                      >{{ col.value }}</q-item-label
                    >
                    <q-item-label caption v-if="col.name == 'desc_estado'">
                      <q-chip
                        :color="col.value == 'Pendiente' ? 'orange' : 'green'"
                        text-color="white"
                      >
                        {{ col.value }}
                      </q-chip>
                    </q-item-label>
                    <q-item-label caption v-if="col.name == 'actions_boleta'">
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
                        icon="delete"
                        @click="onDeleteBoleta(props.row)"
                        round
                        color="negative"
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
                  props.row.desc_estado == 'Pendiente' ? 'orange' : 'green'
                "
                text-color="white"
              >
                {{ props.row.desc_estado }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-actions_boleta="props">
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
                icon="delete"
                @click="onDeleteBoleta(props.row)"
                round
                color="negative"
                dense
              ></q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Tabla de Servicios -->
      <div class="col-12" v-show="activeTab === 'servicios'">
        <!-- Resumen de estados -->
        <div class="row q-mb-md q-gutter-md justify-center">
          <q-card class="text-center" style="min-width: 150px">
            <q-card-section class="q-py-sm">
              <div class="text-h6 text-positive">
                <q-icon name="check_circle" size="md" class="q-mr-xs" />
                {{ serviciosActivos.length }}
              </div>
              <div class="text-subtitle2 text-grey-7">Servicios Activos</div>
            </q-card-section>
          </q-card>

          <q-card class="text-center" style="min-width: 150px">
            <q-card-section class="q-py-sm">
              <div class="text-h6 text-negative">
                <q-icon name="highlight_off" size="md" class="q-mr-xs" />
                {{ serviciosInactivos.length }}
              </div>
              <div class="text-subtitle2 text-grey-7">Servicios Inactivos</div>
            </q-card-section>
          </q-card>

          <q-card class="text-center" style="min-width: 150px">
            <q-card-section class="q-py-sm">
              <div class="text-h6 text-primary">
                <q-icon name="assessment" size="md" class="q-mr-xs" />
                {{ arr_servicios.length }}
              </div>
              <div class="text-subtitle2 text-grey-7">Total Servicios</div>
            </q-card-section>
          </q-card>
        </div>

        <q-table
          flat
          :title="`Servicios del Usuario (${arr_servicios.length})`"
          :grid="$q.screen.xs"
          :rows="arr_servicios"
          :columns="arr_servicios_col"
          row-key="id"
          :rows-per-page-options="['10']"
          :row-class="getRowClass"
        >
          <template v-slot:item="props">
            <q-card
              bordered
              flat
              class="col-12"
              :class="{
                'card-activo': props.row.Estado === 'Activo',
                'card-inactivo': props.row.Estado !== 'Activo',
              }"
            >
              <q-list dense>
                <q-item
                  v-for="col in props.cols.filter(
                    (col) => col.name !== 'actions'
                  )"
                  :key="col.name"
                  class="q-my-sm"
                >
                  <q-item-section>
                    <q-item-label>{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>
                      <span v-if="col.name === 'Estado'">
                        <q-chip
                          :color="
                            props.row.Estado === 'Activo'
                              ? 'positive'
                              : 'negative'
                          "
                          text-color="white"
                          :icon="
                            props.row.Estado === 'Activo'
                              ? 'check_circle'
                              : 'highlight_off'
                          "
                          size="sm"
                          outline
                        >
                          <span class="text-weight-bold">{{ col.value }}</span>
                        </q-chip>
                      </span>
                      <span v-else>{{ col.value }}</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="q-my-sm">
                  <q-item-section>
                    <q-item-label>Acciones</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <div class="row q-gutter-xs justify-center">
                      <q-btn
                        icon="edit"
                        @click="onEditServicio(props.row)"
                        round
                        color="primary"
                        dense
                        size="sm"
                      >
                        <q-tooltip>Editar</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="delete"
                        @click="onDeleteServicio(props.row)"
                        round
                        color="negative"
                        dense
                        size="sm"
                      >
                        <q-tooltip>Eliminar</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="schedule"
                        @click="onChangeDiaPago(props.row)"
                        round
                        color="orange"
                        dense
                        size="sm"
                      >
                        <q-tooltip>Cambiar día de pago</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </template>
          <template v-slot:no-data="{}">
            <div class="full-width row flex-center text-cyan-8 q-gutter-sm">
              <span style="font-weight: bold; font-size: 15px">
                No existen servicios a mostrar
              </span>
              <q-icon size="2em" name="sentiment_dissatisfied" />
            </div>
          </template>
          <template v-slot:body-cell-Estado="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.Estado === 'Activo' ? 'positive' : 'negative'"
                text-color="white"
                :icon="
                  props.row.Estado === 'Activo'
                    ? 'check_circle'
                    : 'highlight_off'
                "
                size="md"
                outline
                :class="{
                  'estado-activo': props.row.Estado === 'Activo',
                  'estado-inactivo': props.row.Estado !== 'Activo',
                }"
              >
                <span class="text-weight-bold">{{ props.row.Estado }}</span>
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                icon="edit"
                @click="onEditServicio(props.row)"
                round
                color="primary"
                class="q-mr-sm"
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                @click="onDeleteServicio(props.row)"
                round
                color="negative"
                class="q-mr-sm"
                dense
              ></q-btn>
              <q-btn
                icon="schedule"
                @click="onChangeDiaPago(props.row)"
                round
                color="orange"
                dense
              ></q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Dialog para cambiar día de pago -->
      <q-dialog v-model="showDiaPagoDialog" persistent>
        <q-card class="dialog-card">
          <q-card-section>
            <div class="text-h6">Cambiar día de pago</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-select
              filled
              v-model="nuevoDiaPago"
              :options="diasDelMes"
              label="Seleccionar día"
              emit-value
              map-options
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
            <q-btn
              flat
              label="Confirmar"
              color="primary"
              @click="confirmChangeDiaPago"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog para editar servicio -->
      <q-dialog v-model="showEditDialog" persistent>
        <q-card class="dialog-card">
          <q-card-section>
            <div class="text-h6">Editar servicio</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              filled
              v-model="editingServicio.Grupo"
              label="Grupo"
              :readonly="true"
            />
            <q-input
              filled
              v-model="editingServicio.Plataforma"
              label="Plataforma"
              :readonly="true"
            />
            <q-input filled v-model="editingServicio.Perfil" label="Perfil" />
            <q-input filled v-model="editingServicio.Pin" label="PIN" />
            <q-select
              filled
              v-model="editingServicio.PayDay"
              :options="diasDelMes"
              label="Día de pago"
              emit-value
              map-options
              :readonly="true"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
            <q-btn
              flat
              label="Guardar"
              color="primary"
              @click="confirmEditServicio"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Diálogo de confirmación para generar boleta -->
      <q-dialog v-model="showBoletaDialog" persistent>
        <q-card class="q-pa-md" style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">Opciones de Generación de Boleta</div>
            <div class="text-subtitle2 text-grey-7">
              Selecciona las opciones para la generación de la boleta
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="q-gutter-md">
              <q-checkbox
                v-model="sendEmail"
                label="Enviar notificación por correo electrónico"
                color="primary"
              />

              <q-checkbox
                v-model="sendSMS"
                label="Enviar notificación por SMS"
                color="primary"
              />

              <q-checkbox
                v-model="attachFile"
                label="Incluir archivo adjunto"
                color="primary"
              />

              <q-checkbox
                v-model="useNextMonth"
                label="Última boleta + 1 mes"
                color="primary"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancelar"
              color="grey"
              @click="showBoletaDialog = false"
            />
            <q-btn
              label="Generar Boleta"
              color="primary"
              @click="onGenBoletas"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script src="./index.js" />

<style scoped>
.dialog-card {
  min-width: 400px;
}

.q-field {
  margin-bottom: 16px;
}

/* Estilos para highlight de estados de servicios */
.estado-activo {
  animation: pulseGreen 2s infinite;
  /* box-shadow: 0 0 10px rgba(76, 175, 80, 0.3); */
  border: 2px solid #4caf50 !important;
}

.estado-inactivo {
  animation: pulseRed 2s infinite;
  /* box-shadow: 0 0 10px rgba(244, 67, 54, 0.3); */
  border: 2px solid #f44336 !important;
}

/* Estilos para filas completas de la tabla */
.row-activo {
  background-color: rgba(76, 175, 80, 0.05) !important;
  border-left: 4px solid #4caf50 !important;
}

.row-activo:hover {
  background-color: rgba(76, 175, 80, 0.1) !important;
  /* transform: scale(1.005);
  transition: all 0.2s ease; */
}

.row-inactivo {
  background-color: rgba(244, 67, 54, 0.05) !important;
  border-left: 4px solid #f44336 !important;
}

.row-inactivo:hover {
  background-color: rgba(244, 67, 54, 0.1) !important;
  /* transform: scale(1.005);
  transition: all 0.2s ease; */
}

/* Estilos para tarjetas en vista móvil */
.card-activo {
  background-color: rgba(76, 175, 80, 0.05) !important;
  border-left: 4px solid #4caf50 !important;
  /* box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2) !important; */
}

.card-activo:hover {
  background-color: rgba(76, 175, 80, 0.1) !important;
  /* box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
  transform: translateY(-2px);
  transition: all 0.3s ease; */
}

.card-inactivo {
  background-color: rgba(244, 67, 54, 0.05) !important;
  border-left: 4px solid #f44336 !important;
  /* box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2) !important; */
}

.card-inactivo:hover {
  background-color: rgba(244, 67, 54, 0.1) !important;
  /* box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3) !important;
  transform: translateY(-2px);
  transition: all 0.3s ease; */
}
/*
@keyframes pulseGreen {
  0% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }
}

@keyframes pulseRed {
  0% {
    box-shadow: 0 0 5px rgba(244, 67, 54, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(244, 67, 54, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(244, 67, 54, 0.3);
  }
} */

/* Estilos adicionales para hacer más visible el estado */
.q-chip.estado-activo .q-chip__content {
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.q-chip.estado-inactivo .q-chip__content {
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Estilos para mejorar los botones en vista móvil */
@media (max-width: 600px) {
  .dialog-card {
    min-width: 90vw;
  }

  /* Mejorar espaciado de botones en móvil */
  .q-btn.q-btn--round {
    margin: 2px !important;
  }

  /* Asegurar que los botones no se desborden */
  .q-item-section .row {
    flex-wrap: wrap;
    justify-content: center !important;
  }

  /* Hacer los botones un poco más pequeños en móvil */
  .q-btn--dense.q-btn--round {
    min-width: 32px !important;
    min-height: 32px !important;
  }
}
</style>
