<template>
  <q-page class="q-px-sm">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md q-ma-sm">
      <div>
        <h4 class="text-h4 q-my-none">🎫 Gestión de Tickets</h4>
        <p class="text-grey-6 q-mb-none">
          Acciones administrativas: baja de usuarios, descuentos, cambio de PIN,
          etc.
        </p>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Acción"
          @click="onCreateTicket"
        />
        <q-btn
          v-if="actionHistory.length"
          color="grey"
          icon="delete_sweep"
          round
          flat
          @click="clearHistory"
        >
          <q-tooltip>Limpiar historial</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div
        v-for="tt in ticketTypes"
        :key="tt.value"
        class="col-6 col-sm-4 col-md-2"
      >
        <q-card
          class="cursor-pointer text-center q-pa-sm"
          flat
          bordered
          @click="quickAction(tt)"
        >
          <q-icon :name="tt.icon" :color="tt.color" size="2rem" />
          <div class="text-caption q-mt-xs">{{ tt.label }}</div>
        </q-card>
      </div>
    </div>

    <!-- Historial de acciones -->
    <q-card flat bordered>
      <q-card-section class="bg-grey-2 q-py-sm">
        <div class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-medium">
            <q-icon name="history" class="q-mr-sm" />
            Historial de Acciones
          </div>
          <q-input
            v-model="searchTerm"
            dense
            outlined
            placeholder="Buscar..."
            style="max-width: 250px"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-separator />

      <q-table
        :rows="filteredTickets"
        :columns="arr_tickets_col"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip
              :icon="getTicketTypeIcon(props.row.tipo)"
              :color="getTicketTypeColor(props.row.tipo)"
              text-color="white"
              :label="props.row.tipo"
              size="sm"
              dense
            />
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.estado === 'Completado' ? 'green' : 'red'"
              :label="props.row.estado"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="info"
              @click="
                selectedTicket = props.row;
                showDetailDialog = true;
              "
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-py-xl">
            <q-icon size="2em" name="inbox" />
            <span>No hay acciones registradas</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog crear ticket / acción -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="bg-cyan-8 text-white">
          <div class="text-h6">
            <q-icon name="add_task" class="q-mr-sm" />
            Nueva Acción Administrativa
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <!-- Tipo de acción -->
          <q-select
            v-model="ticketForm.tipo"
            :options="ticketTypes"
            label="Tipo de acción"
            outlined
            dense
            emit-value
            map-options
            option-value="value"
            option-label="label"
            :rules="[(v) => !!v || 'Seleccione un tipo de acción']"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Buscar usuario -->
          <q-select
            v-model="ticketForm.usuario"
            :options="userOptions"
            label="Buscar usuario"
            outlined
            dense
            use-input
            input-debounce="300"
            @filter="
              (val, update, abort) => {
                update(() => searchUsers(val));
              }
            "
            @update:model-value="onUserSelected"
            :loading="searchingUsers"
            :rules="[(v) => !!v || 'Seleccione un usuario']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Escriba al menos 2 caracteres para buscar
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Campos adicionales según tipo -->
          <template v-if="ticketForm.tipo">
            <!-- Monto para descuento -->
            <q-input
              v-if="
                ticketForm.tipo.value === 'CREAR_DESCUENTO' ||
                ticketForm.tipo === 'CREAR_DESCUENTO'
              "
              v-model.number="ticketForm.monto"
              label="Monto del descuento (S/.)"
              outlined
              dense
              type="number"
              min="0"
              step="0.01"
              :rules="[(v) => v > 0 || 'El monto debe ser mayor a 0']"
            />

            <!-- Selector de servicio -->
            <q-select
              v-if="needsServiceSelector"
              v-model="selectedService"
              :options="userServices"
              label="Seleccionar servicio"
              outlined
              dense
              :loading="loadingServices"
              :disable="!ticketForm.usuario"
              :rules="[(v) => !!v || 'Seleccione un servicio']"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{
                      ticketForm.usuario
                        ? "No se encontraron servicios"
                        : "Seleccione primero un usuario"
                    }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Nuevo perfil -->
            <q-input
              v-if="
                (ticketForm.tipo.value || ticketForm.tipo) === 'CAMBIAR_PERFIL'
              "
              v-model="ticketForm.desc_perfil"
              label="Nuevo nombre de perfil"
              outlined
              dense
            />

            <!-- Nuevo PIN -->
            <q-input
              v-if="
                (ticketForm.tipo.value || ticketForm.tipo) === 'CAMBIAR_PIN'
              "
              v-model="ticketForm.nuevo_pin"
              label="Nuevo PIN"
              outlined
              dense
              maxlength="6"
              mask="######"
              :rules="[(v) => !!v || 'Ingrese el nuevo PIN']"
            />
          </template>

          <!-- Descripción -->
          <q-input
            v-model="ticketForm.descripcion"
            label="Descripción / Notas"
            outlined
            dense
            type="textarea"
            rows="2"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Ejecutar"
            color="primary"
            icon="play_arrow"
            @click="executeTicket"
            :disable="!ticketForm.tipo || !ticketForm.usuario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog detalle de acción -->
    <q-dialog v-model="showDetailDialog">
      <q-card style="min-width: 400px" v-if="selectedTicket">
        <q-card-section class="bg-cyan-8 text-white">
          <div class="text-h6">
            <q-icon name="info" class="q-mr-sm" />
            Detalle de Acción
          </div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon
                  :name="getTicketTypeIcon(selectedTicket.tipo)"
                  :color="getTicketTypeColor(selectedTicket.tipo)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Tipo</q-item-label>
                <q-item-label>{{ selectedTicket.tipo }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Usuario</q-item-label>
                <q-item-label>{{ selectedTicket.usuario }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="description" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Descripción</q-item-label>
                <q-item-label>{{
                  selectedTicket.descripcion || "Sin descripción"
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon
                  name="circle"
                  :color="
                    selectedTicket.estado === 'Completado' ? 'green' : 'red'
                  "
                />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Estado</q-item-label>
                <q-item-label>{{ selectedTicket.estado }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="schedule" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Fecha</q-item-label>
                <q-item-label>{{
                  formatDate(selectedTicket.fecha)
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="selectedTicket.ejecutadoPor">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Ejecutado por</q-item-label>
                <q-item-label>{{ selectedTicket.ejecutadoPor }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog confirmación -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-orange text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            Confirmar acción
          </div>
        </q-card-section>
        <q-card-section>
          <p class="q-mb-none">{{ confirmMessage }}</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Confirmar"
            color="primary"
            @click="executeConfirmAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import config from "./index";
export default {
  ...config,
  computed: {
    filteredTickets() {
      if (!this.searchTerm) return this.arr_tickets;
      const term = this.searchTerm.toLowerCase();
      return this.arr_tickets.filter(
        (t) =>
          (t.tipo || "").toLowerCase().includes(term) ||
          (t.usuario || "").toLowerCase().includes(term) ||
          (t.descripcion || "").toLowerCase().includes(term) ||
          (t.estado || "").toLowerCase().includes(term)
      );
    },
    needsServiceSelector() {
      const tipo = this.ticketForm.tipo?.value || this.ticketForm.tipo;
      return ["CAMBIAR_PIN", "CAMBIAR_PERFIL", "BAJA_SERVICIO"].includes(tipo);
    },
  },
  methods: {
    ...config.methods,
    quickAction(ticketType) {
      if (!this.checkAdminAccess()) return;
      this.ticketForm = {
        tipo: ticketType,
        usuario: null,
        descripcion: "",
        monto: 0,
        id_usuario_servicio: null,
        desc_perfil: "",
        nuevo_pin: "",
      };
      this.userOptions = [];
      this.userServices = [];
      this.selectedService = null;
      this.showCreateDialog = true;
    },
  },
};
</script>
