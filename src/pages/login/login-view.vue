<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Efecto de nieve navideña -->
    <!-- <ChristmasSnow /> -->
    <HalloweenEffects v-if="isHalloween" />

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
            <HalloweenLogo :active="isHalloween">
              <q-img
                src="/imgs/logo_serv-ma.webp"
                srcset="/imgs/logo_serv-ma@2x.webp 2x"
                style="height: 150px"
                fetchpriority="high"
                loading="eager"
              >
                <template v-slot:loading>
                  <q-spinner-gears color="white" />
                </template>
              </q-img>
            </HalloweenLogo>
            <div class="text-h5 text-weight-bold lbl-login">
              Inicio de sesión
            </div>
            <div class="text-white">Accede con tu cuenta</div>

            <!-- Indicador de estado del servidor -->
            <div class="q-mt-sm">
              <q-chip
                :color="
                  serverStatus.isOnline && !serverStatus.isInMaintenance
                    ? 'green'
                    : 'red'
                "
                text-color="dark"
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
              label-color="white"
              color="white"
              bg-color="primary"
              v-model="email"
              label="Correo electrónico"
              autocomplete="username"
              spellcheck="false"
              :disable="!serverStatus.isOnline || serverStatus.isInMaintenance"
            ></q-input>
            <q-input
              dense
              outlined
              label-color="white"
              color="white"
              bg-color="primary"
              class="q-mt-md"
              v-model="password"
              type="password"
              label="Contraseña"
              autocomplete="current-password"
              @keyup.enter="login()"
              :disable="!serverStatus.isOnline || serverStatus.isInMaintenance"
            ></q-input>
          </q-card-section>

          <!-- Verificación anti-robots (Cloudflare Turnstile) -->
          <q-card-section v-if="isTurnstileEnabled" class="q-px-none q-py-none">
            <div
              v-show="!turnstileError"
              ref="turnstile"
              class="row justify-center"
              style="min-height: 65px"
            ></div>
            <div
              v-if="turnstileError"
              role="alert"
              class="text-caption text-red-3 text-center q-px-md"
            >
              {{ turnstileError }}
            </div>
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
            <template
              v-if="serverStatus.isOnline && !serverStatus.isInMaintenance"
            >
              <div
                v-if="!isFormValid"
                class="text-center q-mt-sm text-grey-5 text-caption"
              >
                Completa los campos para continuar
              </div>
              <div
                v-else-if="isWaitingForTurnstile"
                class="text-center q-mt-sm text-grey-5 text-caption"
              >
                Completa la verificación anti-robots
              </div>
            </template>
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

          <!-- Inicio de sesión con Google (v-show: el botón se dibuja al montar) -->
          <q-card-section
            v-if="isGoogleEnabled"
            v-show="serverStatus.isOnline && !serverStatus.isInMaintenance"
            class="q-pt-none"
          >
            <div
              class="row items-center no-wrap text-grey-4 q-mb-md"
              aria-hidden="true"
            >
              <q-separator dark class="col" />
              <span class="q-px-sm">o</span>
              <q-separator dark class="col" />
            </div>
            <div
              v-show="!googleError"
              ref="googleButton"
              class="row justify-center"
              style="min-height: 44px"
            ></div>
            <div
              v-if="googleError"
              role="alert"
              class="text-caption text-grey-4 text-center"
            >
              {{ googleError }}
            </div>
          </q-card-section>

          <q-card-section class="text-center q-pb-none">
            <a
              href="/privacidad.html"
              target="_blank"
              rel="noopener"
              class="text-caption"
              style="
                color: rgba(255, 255, 255, 0.75);
                text-decoration: underline;
              "
              >Política de privacidad</a
            >
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script src="./index.js" />
