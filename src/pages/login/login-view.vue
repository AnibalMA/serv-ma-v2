<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Efecto de nieve navideña -->
    <ChristmasSnow />

    <q-page-container>
      <q-page class="flex flex-center bg-login">
        <!-- Mensaje de estado del servidor -->
        <q-banner
          v-if="
            !bannerDismissed &&
            (showServerStatus ||
              !serverStatus.isOnline ||
              serverStatus.isInMaintenance ||
              serverStatus.showMessageTop)
          "
          :class="
            serverStatus.isInMaintenance
              ? 'bg-orange-8'
              : serverStatus.showMessageTop
              ? 'bg-primary'
              : 'bg-red-8'
          "
          text-color="white"
          class="fixed-top z-top"
        >
          <template v-slot:avatar>
            <q-icon
              :name="serverStatus.isInMaintenance ? 'build' : 'cloud_off'"
              color="white"
            />
          </template>

          <div v-if="!serverStatus.isOnline">
            <strong>Servidor no disponible</strong><br />
            <span>{{
              statusError ||
              serverStatus.maintenanceMessage ||
              "No se puede conectar con el servidor"
            }}</span>
          </div>
          <div
            v-else-if="serverStatus.isWorking && serverStatus.showMessageTop"
          >
            <strong style="color: white">Sistema:</strong><br />
            <span style="color: white">{{
              serverStatus.maintenanceMessage
            }}</span>
            <div v-if="serverStatus.estimatedDowntime" class="q-mt-xs">
              <small
                >Tiempo estimado: {{ serverStatus.estimatedDowntime }}</small
              >
            </div>
          </div>

          <div v-else-if="serverStatus.isInMaintenance">
            <strong style="color: white">Sistema en mantenimiento</strong><br />
            <span style="color: white">{{
              serverStatus.maintenanceMessage
            }}</span>
            <div v-if="serverStatus.estimatedDowntime" class="q-mt-xs">
              <small
                >Tiempo estimado: {{ serverStatus.estimatedDowntime }}</small
              >
            </div>
          </div>

          <template v-slot:action>
            <!-- <q-btn
              flat
              color="white"
              label="Reintentar"
              @click="retryConnection"
              :loading="isCheckingStatus"
            /> -->
            <q-btn
              flat
              color="white"
              icon="close"
              @click="bannerDismissed = true"
            />
          </template>
        </q-banner>

        <q-card
          class="q-pa-md shadow-2 card-login q-pb-xl"
          style="border-radius: 18px; background-color: #173153; width: 350px"
        >
          <q-card-section class="text-center">
            <q-img src="../../assets/logo_serv-ma.png" style="height: 150px">
              <template v-slot:loading>
                <q-spinner-gears color="white" />
              </template>
            </q-img>
            <div class="text-h5 text-weight-bold lbl-login">
              Inicio de sesión
            </div>
            <div>Accede con tu cuenta</div>

            <!-- Indicador de estado del servidor -->
            <div class="q-mt-sm">
              <q-chip
                :color="
                  serverStatus.isOnline && !serverStatus.isInMaintenance
                    ? 'green'
                    : 'red'
                "
                text-color="white"
                size="sm"
                :icon="
                  serverStatus.isOnline && !serverStatus.isInMaintenance
                    ? 'cloud_done'
                    : 'cloud_off'
                "
              >
                {{ serverStatus.serviceName || "ServMA" }}
              </q-chip>
            </div>
          </q-card-section>

          <q-card-section>
            <q-input
              dense
              outlined
              label-color="grey-1"
              color="grey-1"
              bg-color="primary"
              v-model="email"
              label="Correo electrónico"
              :disable="!serverStatus.isOnline || serverStatus.isInMaintenance"
            ></q-input>
            <q-input
              dense
              outlined
              label-color="grey-1"
              color="grey-1"
              bg-color="primary"
              class="q-mt-md"
              v-model="password"
              type="password"
              label="Contraseña"
              @keyup.enter="login()"
              :disable="!serverStatus.isOnline || serverStatus.isInMaintenance"
            ></q-input>
          </q-card-section>

          <q-card-section>
            <q-btn
              style="border-radius: 8px"
              color="cyan-8"
              rounded
              size="md"
              label="Iniciar Sesión"
              no-caps
              @click="login()"
              class="full-width"
              :disable="isLoginDisabled"
            ></q-btn>
            <div
              v-if="
                !isFormValid &&
                serverStatus.isOnline &&
                !serverStatus.isInMaintenance
              "
              class="text-center q-mt-sm text-grey-5 text-caption"
            >
              Completa los campos para continuar
            </div>
          </q-card-section>

          <q-card-section class="text-center">
            <q-btn
              flat
              dense
              color="grey-1"
              label="¿Olvidaste tu contraseña?"
              no-caps
              @click="forgotPassword()"
              :disable="!serverStatus.isOnline || serverStatus.isInMaintenance"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script src="./index.js" />
