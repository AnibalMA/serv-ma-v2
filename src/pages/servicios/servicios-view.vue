<template>
  <q-page class="flex-center">
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Selector de Plataforma -->
        <div class="col-12 col-md-4 col-sm-12">
          <q-select
            v-model="selectedPlatform"
            :options="arr_platforms_u"
            label="Seleccionar Plataforma"
            outlined
            option-value="value"
            option-label="label"
            @update:model-value="onPlatformChange"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar>
                    <q-img :src="scope.opt.icon" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{
                    scope.opt.description
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Selector de Servicio -->
        <div class="col-12 col-md-4 col-sm-12">
          <q-select
            v-model="selectedService"
            :options="services"
            label="Seleccionar Servicio"
            outlined
            option-value="value"
            option-label="label"
            :disable="!selectedPlatform"
            :loading="loadingServices"
            @update:model-value="onServiceChange"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Seleccione primero una plataforma
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-4 col-sm-12">
          <q-btn
            color="primary"
            label="Solicitar Servicio"
            class="full-width"
            :disable="!selectedPlatform || !selectedService"
            @click="requestService"
          >
            <q-tooltip
              v-if="!selectedPlatform || !selectedService"
              class="bg-dark"
            >
              <q-icon name="info" class="q-mr-sm" />
              <span class="text-bold">Requisitos:</span>
              <ul class="q-ma-none q-pl-sm">
                <li v-if="!selectedPlatform">Seleccionar plataforma</li>
                <li v-if="!selectedService">Seleccionar servicio</li>
              </ul>
            </q-tooltip>
          </q-btn>
        </div>
        <!-- Tarjeta de Información -->
        <div class="col-12" v-if="selectedPlatform && selectedService">
          <q-card class="my-card">
            <q-card-section>
              <div class="text-h6" style="font-weight: bold">
                Información del Servicio
              </div>
              <div class="text-subtitle2">
                {{ selectedPlatform.label }} - {{ selectedService.label }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card flat bordered>
              <q-card-section v-html="oResult" />
            </q-card>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>
  
  <script src="./index.js" />