<template>
  <q-page class="q-px-sm">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg q-ma-sm">
      <div>
        <h4 class="text-h4 q-my-none">📱 Plataformas</h4>
        <p class="text-grey-6 q-mb-none">Gestión de plataformas y grupos</p>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="row">
        <q-input
          v-model="searchTerm"
          outlined
          dense
          placeholder="Buscar plataforma..."
          style="min-width: 250px"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          color="primary"
          class="q-mx-sm"
          icon="refresh"
          round
          @click="loadPlatforms"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!platforms.length" class="text-center q-py-xl">
      <q-icon name="inbox" size="4rem" color="grey-5" />
      <div class="text-h6 text-grey-6 q-mt-md">
        No se encontraron plataformas
      </div>
    </div>

    <!-- Plataformas Grid -->
    <div v-else class="row q-pr-sm">
      <div
        v-for="platform in filteredPlatforms"
        :key="platform.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="platform-card">
          <!-- Header de la plataforma -->
          <q-card-section class="bg-primary text-white">
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">{{ platform.nombre }}</div>
                <div class="text-caption opacity-70">
                  {{ platform.cod_plataforma }}
                </div>
              </div>
              <div class="text-right">
                <q-chip
                  color="white"
                  text-color="primary"
                  size="sm"
                  :label="`${platform.grupos.length} grupo${
                    platform.grupos.length !== 1 ? 's' : ''
                  }`"
                />
              </div>
            </div>
          </q-card-section>

          <!-- Grupos -->
          <q-card-section class="q-pa-none">
            <q-expansion-item
              v-for="(grupo, index) in platform.grupos"
              :key="grupo.id"
              :default-opened="index === 0"
               :header-class="index % 2 === 0 ? ($q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1') : ($q.dark.isActive ? 'bg-grey-9' : 'bg-white')"
            >
              <template v-slot:header>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ grupo.nombre }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ grupo.perfiles.length }} perfiles •
                    {{ grupo.cuentas.length }} cuenta{{
                      grupo.cuentas.length !== 1 ? "s" : ""
                    }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-chip
                    :color="getGroupStatusColor(grupo)"
                    text-color="white"
                    size="sm"
                    :icon="getGroupStatusIcon(grupo)"
                  />
                </q-item-section>
              </template>

              <!-- Contenido del grupo -->
               <div :class="$q.dark.isActive ? 'surface-bg q-pa-md text-white' : 'bg-grey-1 q-pa-md'">
                <!-- Cuentas -->
                <div class="q-mb-md">
                  <div class="text-subtitle2 text-weight-medium q-mb-sm">
                    🔐 Cuentas
                  </div>
                  <div class="row q-gutter-sm">
                    <q-card
                      v-for="cuenta in grupo.cuentas"
                      :key="cuenta.correo_acc"
                      flat
                      bordered
                      class="col-12 q-pa-sm"
                    >
                      <div class="row items-center justify-between">
                        <div class="col">
                          <div class="text-body2 text-weight-medium">
                            {{ cuenta.correo_acc }}
                          </div>
                          <div class="text-caption text-grey-6">••••••••••</div>
                        </div>
                        <div class="col-auto">
                          <q-chip
                            :color="cuenta.id_estado === 1 ? 'green' : 'red'"
                            text-color="white"
                            size="sm"
                            :icon="
                              cuenta.id_estado === 1 ? 'check_circle' : 'error'
                            "
                            :label="
                              cuenta.id_estado === 1 ? 'Activa' : 'Inactiva'
                            "
                          />
                          <q-chip
                            v-if="cuenta.is_classic_email"
                            color="orange"
                            text-color="white"
                            size="sm"
                            icon="email"
                            label="Clásico"
                            class="q-ml-xs"
                          />
                        </div>
                      </div>
                    </q-card>
                  </div>
                </div>

                <!-- Perfiles -->
                <div>
                  <div class="text-subtitle2 text-weight-medium q-mb-sm">
                    👥 Perfiles ({{ grupo.perfiles.length }})
                  </div>
                  <div class="row q-gutter-sm">
                    <q-card
                      v-for="perfil in grupo.perfiles"
                      :key="perfil.id"
                      flat
                      bordered
                      class="col-12 col-sm-6 q-pa-sm"
                    >
                      <div class="row items-start justify-between">
                        <div class="col">
                          <div class="text-body2 text-weight-medium">
                            {{ perfil.perfil }}
                          </div>
                          <div class="text-caption text-grey-6">
                            {{ perfil.usuario }}
                          </div>
                          <div class="text-caption text-grey-5 q-mt-xs">
                            📅 Pago: {{ perfil.payday }} • 🔒 PIN:
                            {{ perfil.pin === "-" ? "No" : perfil.pin }}
                          </div>
                        </div>
                        <div class="col-auto text-right">
                          <q-btn
                            flat
                            dense
                            round
                            color="primary"
                            icon="content_copy"
                            size="sm"
                            @click="copyPerfilInfo(platform, grupo, perfil)"
                            class="q-mb-xs"
                          >
                            <q-tooltip>Copiar información</q-tooltip>
                          </q-btn>
                          <div class="text-weight-bold text-green-8">
                            {{ perfil.monto_pagar }}
                          </div>
                        </div>
                      </div>
                    </q-card>
                  </div>
                </div>

                <!-- Resumen del grupo -->
                <q-separator class="q-my-md" />
                <div class="row items-center justify-between">
                  <div class="text-caption text-grey-6">
                    Total ingresos del grupo:
                  </div>
                  <div class="text-weight-bold text-primary">
                    S/{{ calculateGroupTotal(grupo).toFixed(2) }}
                  </div>
                </div>
              </div>
            </q-expansion-item>
          </q-card-section>

          <!-- Footer con estadísticas -->
          <q-card-section :class="$q.dark.isActive ? 'surface-bg text-white' : 'bg-grey-1'">
            <div class="row items-center justify-between text-caption">
              <div class="text-grey-6">
                Total perfiles: {{ getTotalProfiles(platform) }}
              </div>
              <div class="text-weight-bold text-green-8">
                Ingresos: S/{{ getPlatformTotal(platform).toFixed(2) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Estadísticas generales -->
    <q-card class="q-mt-xl" v-if="platforms.length">
      <q-card-section class="bg-grey-9 text-white">
        <div class="text-h6">📊 Resumen General</div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="stat-item text-center">
              <q-icon name="apps" size="2rem" color="primary" class="q-mb-sm" />
              <div class="stat-value text-h4 text-weight-bold text-primary">
                {{ platforms.length }}
              </div>
              <div class="stat-label text-grey-6">Plataformas</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="stat-item text-center">
              <q-icon
                name="group_work"
                size="2rem"
                color="secondary"
                class="q-mb-sm"
              />
              <div class="stat-value text-h4 text-weight-bold text-secondary">
                {{ getTotalGroups() }}
              </div>
              <div class="stat-label text-grey-6">Grupos</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="stat-item text-center">
              <q-icon
                name="people"
                size="2rem"
                color="accent"
                class="q-mb-sm"
              />
              <div class="stat-value text-h4 text-weight-bold text-accent">
                {{ getTotalProfiles() }}
              </div>
              <div class="stat-label text-grey-6">Perfiles</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="stat-item text-center">
              <q-icon
                name="payments"
                size="2rem"
                color="positive"
                class="q-mb-sm"
              />
              <div class="stat-value text-h4 text-weight-bold text-positive">
                S/{{ getTotalRevenue().toFixed(2) }}
              </div>
              <div class="stat-label text-grey-6">Ingresos Totales</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script src="./index.js" />

<style lang="scss" scoped>
.stat-item {
  padding: 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);

  .stat-value {
    margin: 0.5rem 0;
  }

  .stat-label {
    font-size: 0.875rem;
  }
}

.platform-card {
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}

.q-stat {
  text-align: center;
  padding: 1rem;

  .q-stat__value {
    font-size: 2rem;
    font-weight: bold;
    display: block;
  }

  .q-stat__label {
    color: #666;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    display: block;
  }
}
</style>
