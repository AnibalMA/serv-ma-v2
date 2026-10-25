<template>
  <q-page class="q-pa-md">
    <div style="max-width: 720px; margin: 0 auto">
      <!-- Cabecera -->
      <div class="q-mb-md">
        <h1 class="text-h5 text-weight-bold text-primary q-my-none">
          <q-icon name="person" class="q-mr-sm" aria-hidden="true" />
          Mi perfil
        </h1>
        <div class="text-caption text-grey-6">
          Revisa y actualiza los datos de tu cuenta
        </div>
      </div>

      <!-- Mis datos -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <h2 class="text-h6 q-my-none">Mis datos</h2>
        </q-card-section>
        <q-form @submit="saveProfile">
          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profileForm.nom_usuario"
                  label="Nombre"
                  name="given-name"
                  outlined
                  dense
                  autocomplete="given-name"
                  lazy-rules
                  :rules="profileRules.name"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profileForm.ape_usuario"
                  label="Apellido"
                  name="family-name"
                  outlined
                  dense
                  autocomplete="family-name"
                  lazy-rules
                  :rules="profileRules.name"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profileForm.email_principal_usuario"
                  type="email"
                  label="Correo electrónico"
                  name="email"
                  spellcheck="false"
                  hint="Es el correo con el que inicias sesión"
                  outlined
                  dense
                  autocomplete="email"
                  lazy-rules
                  :rules="profileRules.email"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="profileForm.celular_principal_usuario"
                  type="tel"
                  inputmode="tel"
                  label="Celular"
                  name="tel"
                  outlined
                  dense
                  autocomplete="tel"
                  lazy-rules
                  :rules="profileRules.phone"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              type="submit"
              color="primary"
              label="Guardar datos"
              no-caps
              :loading="savingProfile"
            />
          </q-card-actions>
        </q-form>
      </q-card>

      <!-- Contraseña -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <h2 class="text-h6 q-my-none">Contraseña</h2>
        </q-card-section>
        <q-form @submit="changePassword">
          <!-- Tells password managers which account this password belongs to -->
          <input
            type="text"
            name="username"
            autocomplete="username"
            :value="user.email_principal_usuario"
            readonly
            hidden
          />
          <q-card-section class="q-pt-none q-gutter-y-md">
            <q-input
              v-model="passwordForm.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              label="Contraseña actual"
              name="current-password"
              outlined
              dense
              autocomplete="current-password"
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showCurrentPassword ? 'visibility' : 'visibility_off'"
                  :aria-label="
                    showCurrentPassword
                      ? 'Ocultar contraseña actual'
                      : 'Mostrar contraseña actual'
                  "
                  @click="showCurrentPassword = !showCurrentPassword"
                />
              </template>
            </q-input>
            <q-input
              v-model="passwordForm.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              label="Nueva contraseña"
              name="new-password"
              hint="Entre 6 y 72 caracteres"
              outlined
              dense
              autocomplete="new-password"
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showNewPassword ? 'visibility' : 'visibility_off'"
                  :aria-label="
                    showNewPassword
                      ? 'Ocultar nueva contraseña'
                      : 'Mostrar nueva contraseña'
                  "
                  @click="showNewPassword = !showNewPassword"
                />
              </template>
            </q-input>
            <q-input
              v-model="passwordForm.confirmPassword"
              :type="showNewPassword ? 'text' : 'password'"
              label="Confirmar nueva contraseña"
              name="confirm-password"
              outlined
              dense
              autocomplete="new-password"
            />
          </q-card-section>
          <q-card-section class="q-pt-none text-caption text-grey-6">
            ¿No recuerdas tu contraseña actual?
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              class="q-px-xs"
              label="Cierra sesión y usa «¿Olvidaste tu contraseña?»"
              @click="logoutToRecoverPassword"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              type="submit"
              color="primary"
              label="Cambiar contraseña"
              no-caps
              :loading="savingPassword"
            />
          </q-card-actions>
        </q-form>
      </q-card>

      <!-- Cuenta de Google -->
      <q-card v-if="isGoogleEnabled" flat bordered class="q-mb-md">
        <q-card-section>
          <h2 class="text-h6 q-my-none">Cuenta de Google</h2>
          <div class="text-caption text-grey-6">
            Vincúlala para entrar con Google sin escribir tu contraseña
          </div>
        </q-card-section>

        <q-card-section
          v-if="isGoogleLinked"
          class="q-pt-none row items-center q-col-gutter-sm"
        >
          <div class="col-12 col-sm" style="overflow-wrap: anywhere">
            <q-icon
              name="check_circle"
              color="positive"
              class="q-mr-xs"
              aria-hidden="true"
            />
            Vinculada con
            <strong>{{ user.sGoogleEmail || "tu cuenta de Google" }}</strong>
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="negative"
              label="Desvincular"
              no-caps
              @click="unlinkGoogle"
            />
          </div>
        </q-card-section>

        <q-card-section v-else class="q-pt-none">
          <div
            v-show="!googleError"
            ref="googleButton"
            style="min-height: 44px; max-width: 400px"
          ></div>
          <div v-if="googleError" role="alert" class="text-caption text-negative">
            {{ googleError }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script src="./index.js" />
