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
          optBoleta == 'Pendientes'
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
                    ? !['monto_cancelado', 'fecha_cancelado'].includes(col.name)
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
                    v-if="!['desc_estado', 'actions'].includes(col.name)"
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
              :color="props.row.desc_estado == 'Pendiente' ? 'orange' : 'green'"
              text-color="white"
            >
              {{ props.row.desc_estado }}
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
              dense
            ></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script src="./index.js" />