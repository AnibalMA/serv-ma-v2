<template>
  <q-page class="q-px-sm admin-users-page">
    <!-- Header -->
    <div class="row items-start justify-between q-mb-md q-ma-sm admin-header">
      <div>
        <h4 class="text-h4 q-my-none">👥 Gestión de Usuarios</h4>
        <p class="text-grey-6 q-mb-none">
          Administración de usuarios del sistema
        </p>
      </div>
      <div class="row q-gutter-sm admin-actions">
        <q-btn
          color="positive"
          icon="person_add"
          label="Nuevo usuario"
          @click="onOpenCreateUser"
        />
        <q-btn
          color="indigo"
          icon="playlist_add"
          label="Asignar servicio plataforma"
          @click="onAssignPlatformService(null)"
          :loading="loadingMasterData"
        />
        <q-input
          v-model="searchTerm"
          outlined
          dense
          placeholder="Buscar usuario..."
          class="user-search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append v-if="searchTerm">
            <q-icon
              name="close"
              class="cursor-pointer"
              @click="searchTerm = ''"
            />
          </template>
        </q-input>
        <q-btn
          color="primary"
          icon="refresh"
          round
          @click="getUsers"
          :loading="loading"
        >
          <q-tooltip>Recargar usuarios</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <q-table
      :rows="filteredUsers"
      :columns="arr_users_col"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :pagination="{ rowsPerPage: 15 }"
      :filter="searchTerm"
      class="admin-users-table"
      :grid="$q.screen.lt.md"
      :hide-header="$q.screen.lt.md"
    >
      <template v-slot:item="props">
        <div class="col-12">
          <q-card flat bordered class="q-pa-sm q-mb-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar
                  size="36px"
                  :color="isUserActive(props.row) ? 'cyan-8' : 'grey-5'"
                  text-color="white"
                  class="text-weight-bold"
                >
                  {{ props.row.initials }}
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle2 text-weight-medium ellipsis">
                  {{ props.row.nom_usuario }} {{ props.row.ape_usuario }}
                </div>
                <div class="text-caption text-grey-7 ellipsis">
                  {{
                    props.row.email_principal_usuario ||
                    props.row.celular_principal_usuario ||
                    "Sin contacto"
                  }}
                </div>
              </div>
              <div class="col-auto">
                <q-badge
                  :color="isUserActive(props.row) ? 'green' : 'red'"
                  :label="getUserStatusLabel(props.row)"
                />
              </div>
            </div>

            <div class="row q-gutter-xs q-mt-sm action-buttons-mobile">
              <q-btn
                flat
                dense
                icon="visibility"
                color="info"
                @click="onViewUser(props.row)"
              />
              <q-btn
                flat
                dense
                icon="edit"
                color="primary"
                @click="onEditUser(props.row)"
              />
              <q-btn
                flat
                dense
                :icon="isUserActive(props.row) ? 'person_off' : 'person'"
                :color="isUserActive(props.row) ? 'negative' : 'positive'"
                @click="onToggleUserStatus(props.row)"
              />
              <q-btn
                flat
                dense
                icon="discount"
                color="orange"
                @click="onViewDiscounts(props.row)"
              />
              <q-btn
                flat
                dense
                icon="add_card"
                color="teal"
                @click="onAddDiscount(props.row)"
              />
              <q-btn
                flat
                dense
                icon="playlist_add"
                color="indigo"
                @click="onAssignPlatformService(props.row)"
              />
              <q-btn
                flat
                dense
                icon="settings_applications"
                color="purple"
                @click="onManageUserServices(props.row)"
              />
              <q-btn
                flat
                dense
                icon="payments"
                color="green-8"
                @click="onPayBoleta(props.row)"
              />
              <q-btn
                flat
                dense
                icon="done_all"
                color="blue-grey"
                @click="onLiquidarBoletas(props.row)"
              />
            </div>
          </q-card>
        </div>
      </template>

      <template v-slot:body-cell-initials="props">
        <q-td :props="props">
          <q-avatar
            size="36px"
            :color="isUserActive(props.row) ? 'cyan-8' : 'grey-5'"
            text-color="white"
            class="text-weight-bold"
          >
            {{ props.row.initials }}
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-desc_estado="props">
        <q-td :props="props">
          <q-badge
            :color="isUserActive(props.row) ? 'green' : 'red'"
            :label="getUserStatusLabel(props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-xs action-buttons-desktop">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="info"
              @click="onViewUser(props.row)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              @click="onEditUser(props.row)"
            >
              <q-tooltip>Editar usuario</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :icon="isUserActive(props.row) ? 'person_off' : 'person'"
              :color="isUserActive(props.row) ? 'negative' : 'positive'"
              @click="onToggleUserStatus(props.row)"
            >
              <q-tooltip>{{
                isUserActive(props.row) ? "Desactivar" : "Activar"
              }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="discount"
              color="orange"
              @click="onViewDiscounts(props.row)"
            >
              <q-tooltip>Ver descuentos</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="add_card"
              color="teal"
              @click="onAddDiscount(props.row)"
            >
              <q-tooltip>Agregar descuento</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="playlist_add"
              color="indigo"
              @click="onAssignPlatformService(props.row)"
            >
              <q-tooltip>Asignar servicio de plataforma</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="settings_applications"
              color="purple"
              @click="onManageUserServices(props.row)"
            >
              <q-tooltip>Administrar servicios</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="payments"
              color="green-8"
              @click="onPayBoleta(props.row)"
            >
              <q-tooltip>Registrar pago cobrador</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="done_all"
              color="blue-grey"
              @click="onLiquidarBoletas(props.row)"
            >
              <q-tooltip>Liquidar cobros (cobrador → admin)</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-py-xl">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span> No se encontraron usuarios </span>
        </div>
      </template>
    </q-table>

    <!-- Dialog ver detalles -->
    <q-dialog v-model="showUserDialog">
      <q-card class="dialog-card dialog-card--sm">
        <q-card-section class="bg-cyan-8 text-white">
          <div class="text-h6">
            <q-icon name="person" class="q-mr-sm" />
            Detalles del Usuario
          </div>
        </q-card-section>
        <q-card-section v-if="selectedUser">
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="badge" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Nombre completo</q-item-label>
                <q-item-label>
                  {{ selectedUser.nom_usuario }}
                  {{ selectedUser.ape_usuario }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="email" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Email</q-item-label>
                <q-item-label>{{
                  selectedUser.email_principal_usuario || "No registrado"
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="phone" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Celular</q-item-label>
                <q-item-label>{{
                  selectedUser.celular_principal_usuario || "No registrado"
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon
                  name="circle"
                  :color="isUserActive(selectedUser) ? 'green' : 'red'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Estado</q-item-label>
                <q-item-label>{{
                  getUserStatusLabel(selectedUser)
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog crear usuario -->
    <q-dialog v-model="showCreateUserDialog" persistent>
      <q-card class="dialog-card dialog-card--md">
        <q-card-section class="bg-positive text-white">
          <div class="text-h6">
            <q-icon name="person_add" class="q-mr-sm" />
            Crear usuario
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.nom_usuario"
                label="Nombre"
                outlined
                dense
                :rules="[(v) => !!v || 'Nombre requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.ape_usuario"
                label="Apellido"
                outlined
                dense
                :rules="[(v) => !!v || 'Apellido requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.email_principal_usuario"
                label="Email"
                outlined
                dense
                type="email"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.celular_principal_usuario"
                label="Celular"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.usernameL"
                label="Usuario login"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.passL"
                label="Contraseña"
                outlined
                dense
                type="password"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.num_contacto_prov"
                label="Número contacto proveedor"
                outlined
                dense
                :rules="[(v) => !!v || 'Campo requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="createUserForm.num_opc"
                label="Número opción"
                outlined
                dense
                type="number"
                min="1"
                :rules="[(v) => !!v || 'Campo requerido']"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Crear"
            color="positive"
            @click="saveNewUser"
            :disable="
              !createUserForm.nom_usuario ||
              !createUserForm.ape_usuario ||
              !createUserForm.num_contacto_prov ||
              !createUserForm.num_opc
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog asignar servicio de plataforma -->
    <q-dialog v-model="showAssignPlatformServiceDialog" persistent>
      <q-card class="dialog-card dialog-card--lg">
        <q-card-section class="bg-indigo text-white">
          <div class="text-h6">
            <q-icon name="playlist_add" class="q-mr-sm" />
            Asignar servicio de plataforma
          </div>
          <div class="text-caption q-mt-xs">
            Usuario + servicio (grupo, plataforma, día de pago)
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            v-if="!selectedUser"
            v-model="platformServiceForm.id_usuario"
            :options="
              arr_users.map((u) => ({
                label: `${u.nom_usuario} ${u.ape_usuario}`,
                value: u.id,
              }))
            "
            emit-value
            map-options
            label="Usuario"
            outlined
            dense
            :rules="[(v) => !!v || 'Usuario requerido']"
          />

          <q-input
            v-else
            :model-value="`${selectedUser.nom_usuario} ${selectedUser.ape_usuario}`"
            label="Usuario"
            outlined
            dense
            readonly
          />

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="platformServiceForm.id_plataforma"
                :options="platformOptions"
                emit-value
                map-options
                label="Plataforma"
                outlined
                dense
                :loading="loadingMasterData"
                :rules="[(v) => !!v || 'Plataforma requerida']"
                @update:model-value="onPlatformChange"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="platformServiceForm.id_grupo"
                :options="filteredGroupOptions"
                emit-value
                map-options
                label="Grupo"
                outlined
                dense
                :loading="loadingMasterData"
                :disable="!platformServiceForm.id_plataforma"
                :hint="
                  !platformServiceForm.id_plataforma
                    ? 'Selecciona una plataforma primero'
                    : ''
                "
                :rules="[(v) => !!v || 'Grupo requerido']"
              />
            </div>
            <div class="col-12" v-if="getSelectedGrupoEmail()">
              <q-input
                :model-value="getSelectedGrupoEmail()"
                label="Correo del grupo"
                outlined
                dense
                readonly
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="platformServiceForm.dia_pago"
                label="Día de pago"
                outlined
                dense
                type="number"
                min="1"
                max="31"
                :rules="[(v) => !!v || 'Día de pago requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="platformServiceForm.monto"
                label="Monto"
                outlined
                dense
                type="number"
                min="0"
                step="0.01"
                :rules="[(v) => v >= 0 || 'Monto válido requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="platformServiceForm.desc_perfil"
                label="Perfil"
                outlined
                dense
                :rules="[(v) => !!v || 'Perfil requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="platformServiceForm.pin_perfil"
                label="PIN perfil"
                outlined
                dense
                :rules="[(v) => !!v || 'PIN requerido']"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Asignar"
            color="indigo"
            @click="savePlatformService"
            :disable="
              !platformServiceForm.id_usuario ||
              !platformServiceForm.id_grupo ||
              !platformServiceForm.id_plataforma ||
              !platformServiceForm.dia_pago ||
              platformServiceForm.monto === null ||
              platformServiceForm.monto === undefined ||
              !platformServiceForm.desc_perfil ||
              !platformServiceForm.pin_perfil
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog editar usuario -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card class="dialog-card dialog-card--md">
        <q-card-section class="bg-cyan-8 text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            Editar Usuario
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="editForm.nom_usuario"
            label="Nombre"
            outlined
            dense
            :rules="[(v) => !!v || 'Nombre es requerido']"
          />
          <q-input
            v-model="editForm.ape_usuario"
            label="Apellido"
            outlined
            dense
            :rules="[(v) => !!v || 'Apellido es requerido']"
          />
          <q-input
            v-model="editForm.email_principal_usuario"
            label="Email"
            outlined
            dense
            type="email"
          />
          <q-input
            v-model="editForm.celular_principal_usuario"
            label="Celular"
            outlined
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Guardar"
            color="primary"
            @click="saveUserEdit"
            :disable="!editForm.nom_usuario || !editForm.ape_usuario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog ver descuentos -->
    <q-dialog v-model="showDiscountDialog">
      <q-card class="dialog-card dialog-card--md">
        <q-card-section class="bg-orange-8 text-white">
          <div class="text-h6">
            <q-icon name="discount" class="q-mr-sm" />
            Descuentos de {{ selectedUser?.nom_usuario }}
            {{ selectedUser?.ape_usuario }}
          </div>
        </q-card-section>
        <q-card-section>
          <div v-if="loadingDiscounts" class="flex flex-center q-py-lg">
            <q-spinner-dots size="40px" color="primary" />
          </div>
          <q-list v-else-if="userDiscounts.length" bordered separator>
            <q-item v-for="d in userDiscounts" :key="d.id" class="q-py-sm">
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  d.desc_nota_short || d.desc_nota || "Sin descripción"
                }}</q-item-label>
                <q-item-label caption>{{ d.desc_nota }}</q-item-label>
                <q-item-label caption>
                  Por boleta: S/.
                  {{ Number(d.factor_desc || 0).toFixed(2) }} &nbsp;|&nbsp;
                  Tipo: {{ d.tipo_desc || "-" }} &nbsp;|&nbsp; ID: {{ d.id }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  color="green"
                  :label="`S/. ${Number(d.monto_descuento || 0).toFixed(2)}`"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-center q-py-lg text-grey-6">
            <q-icon name="money_off" size="3rem" />
            <div class="q-mt-sm">No tiene descuentos registrados</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog agregar descuento -->
    <q-dialog v-model="showServiceDialog" persistent>
      <q-card class="dialog-card dialog-card--sm">
        <q-card-section class="bg-teal-8 text-white">
          <div class="text-h6">
            <q-icon name="add_card" class="q-mr-sm" />
            Nuevo Descuento - {{ selectedUser?.nom_usuario }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <!-- Tipo de descuento -->
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <div class="text-caption text-grey-7 q-mb-xs">
                Tipo de descuento
              </div>
              <q-btn-toggle
                v-model="discountForm.tipo_desc"
                spread
                no-caps
                toggle-color="teal-8"
                :options="[
                  {
                    label: 'Normal (único cobro)',
                    value: 'NORMAL',
                    icon: 'payments',
                  },
                  {
                    label: 'Combo (por boleta)',
                    value: 'COMBO',
                    icon: 'repeat',
                  },
                ]"
              />
              <div class="text-caption text-grey-6 q-mt-xs">
                <span v-if="discountForm.tipo_desc === 'NORMAL'">
                  Se descuenta todo el monto de una sola vez en la próxima
                  boleta.
                </span>
                <span v-else>
                  Se descuenta el monto por boleta (factor) de forma periódica
                  hasta agotar el saldo total.
                </span>
              </div>
            </div>
          </div>
          <div class="row q-col-gutter-sm">
            <div
              :class="
                discountForm.tipo_desc === 'COMBO'
                  ? 'col-12 col-sm-6'
                  : 'col-12'
              "
            >
              <q-input
                v-model.number="discountForm.monto"
                label="Monto total del descuento (S/.)"
                :hint="
                  discountForm.tipo_desc === 'COMBO'
                    ? 'Saldo total disponible'
                    : 'Se aplica en un solo cobro'
                "
                outlined
                dense
                type="number"
                min="0.01"
                step="0.01"
                :rules="[(v) => v > 0 || 'Debe ser mayor a 0']"
              />
            </div>
            <div
              class="col-12 col-sm-6"
              v-if="discountForm.tipo_desc === 'COMBO'"
            >
              <q-input
                v-model.number="discountForm.factor"
                label="Descuento por boleta (S/.)"
                hint="Monto que se descuenta en cada boleta"
                outlined
                dense
                type="number"
                min="0.01"
                step="0.01"
                :rules="[(v) => v > 0 || 'Debe ser mayor a 0']"
              />
            </div>
          </div>
          <q-input
            v-model="discountForm.descripcion"
            label="Descripción"
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
            label="Registrar"
            color="teal"
            @click="saveDiscount"
            :disable="
              discountForm.monto <= 0 ||
              (discountForm.tipo_desc === 'COMBO' && discountForm.factor <= 0)
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog administrar servicios -->
    <q-dialog v-model="showManageServicesDialog" persistent>
      <q-card class="dialog-card dialog-card--lg">
        <q-card-section class="bg-purple-8 text-white">
          <div class="text-h6">
            <q-icon name="settings_applications" class="q-mr-sm" />
            Servicios de {{ selectedUser?.nom_usuario }}
            {{ selectedUser?.ape_usuario }}
          </div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingUserServices" class="flex flex-center q-py-lg">
            <q-spinner-dots size="40px" color="primary" />
          </div>

          <q-list v-else-if="userServices.length" bordered separator>
            <q-item v-for="service in userServices" :key="service._serviceId">
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ service.desc_plataforma || "Plataforma" }}
                  <q-badge
                    v-if="service.desc_estado"
                    class="q-ml-sm"
                    color="primary"
                    :label="service.desc_estado"
                  />
                </q-item-label>
                <q-item-label caption>
                  Perfil: {{ service.desc_perfil || "-" }} | PIN:
                  {{ service.pin || service.pin_perfil || "-" }}
                </q-item-label>
                <q-item-label caption>
                  Día pago: {{ service.dia_pago ?? "-" }} | Monto: S/.
                  {{
                    service.monto !== null && service.monto !== undefined
                      ? Number(service.monto).toFixed(2)
                      : "-"
                  }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="edit"
                    @click="onOpenEditService(service)"
                  >
                    <q-tooltip>Editar perfil/PIN</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="block"
                    @click="onDeactivateService(service)"
                  >
                    <q-tooltip>Dar de baja servicio</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-center q-py-lg text-grey-6">
            <q-icon name="tv_off" size="3rem" />
            <div class="q-mt-sm">No tiene servicios registrados</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Recargar"
            color="primary"
            icon="refresh"
            @click="selectedUser?.id && loadUserServices(selectedUser.id)"
            :loading="loadingUserServices"
          />
          <q-btn flat label="Cerrar" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog editar servicio -->
    <q-dialog v-model="showEditServiceDialog" persistent>
      <q-card class="dialog-card dialog-card--sm">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            Editar servicio
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="editServiceForm.desc_perfil"
            label="Perfil"
            outlined
            dense
            :rules="[(v) => !!v || 'Perfil requerido']"
          />
          <q-input
            v-model="editServiceForm.pin"
            label="PIN"
            outlined
            dense
            :rules="[(v) => !!v || 'PIN requerido']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Guardar"
            color="primary"
            @click="saveUserServiceEdit"
            :disable="!editServiceForm.desc_perfil || !editServiceForm.pin"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog registrar pago cobrador -->
    <q-dialog v-model="showPayBoletaDialog" persistent>
      <q-card class="dialog-card dialog-card--md">
        <q-card-section class="bg-green-8 text-white">
          <div class="text-h6">
            <q-icon name="payments" class="q-mr-sm" />
            Registrar pago — {{ selectedUser?.nom_usuario }}
            {{ selectedUser?.ape_usuario }}
          </div>
          <div class="text-caption q-mt-xs">Cobrador recaudó del usuario</div>
        </q-card-section>

        <!-- Selector de modo -->
        <q-tabs
          v-model="modoPayBoleta"
          dense
          active-color="green-8"
          indicator-color="green-8"
          align="justify"
          class="text-grey-7"
          @update:model-value="
            () => {
              payBoletaForm.idBoleta = [];
              payBoletaForm.idDetalle = [];
              payBoletaForm.bAll = false;
              payBoletaForm.montoCancelado = 0;
            }
          "
        >
          <q-tab name="boletas" icon="receipt_long" label="Por boleta" />
          <q-tab name="items" icon="list" label="Por servicio" />
        </q-tabs>

        <q-separator />

        <q-card-section>
          <div v-if="loadingPayBoletas" class="flex flex-center q-py-lg">
            <q-spinner-dots size="40px" color="primary" />
          </div>

          <template v-else>
            <!-- ───────────────────────────────────────────
                 MODO PRINCIPAL: pago por boleta completa
            ─────────────────────────────────────────── -->
            <template v-if="modoPayBoleta === 'boletas'">
              <div v-if="userPayBoletas.length" class="q-mb-md">
                <div class="text-caption text-grey-7 q-mb-xs">
                  Boletas pendientes
                </div>
                <q-list bordered separator dense>
                  <q-item
                    v-for="b in userPayBoletas"
                    :key="b.id"
                    tag="label"
                    clickable
                  >
                    <q-item-section side>
                      <q-checkbox
                        v-model="payBoletaForm.idBoleta"
                        :val="b.id"
                        :disable="payBoletaForm.bAll"
                        color="green-8"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{
                        b.cod_boleta || `#${b.id}`
                      }}</q-item-label>
                      <q-item-label caption>
                        Saldo: S/.
                        {{
                          Number(
                            (b.monto_facturado || 0) - (b.monto_cancelado || 0)
                          ).toFixed(2)
                        }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge
                        color="orange"
                        :label="`S/. ${Number(b.monto_facturado || 0).toFixed(
                          2
                        )}`"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-checkbox
                  v-model="payBoletaForm.bAll"
                  label="Pagar todas las pendientes"
                  class="q-mt-sm"
                  color="green-8"
                  @update:model-value="
                    (v) => {
                      if (v) payBoletaForm.idBoleta = [];
                    }
                  "
                />
              </div>

              <div v-else class="text-center q-py-sm text-grey-6 q-mb-md">
                <q-icon name="check_circle" size="2rem" color="green" />
                <div class="q-mt-xs">No hay boletas pendientes</div>
              </div>

              <q-input
                v-model.number="payBoletaForm.montoCancelado"
                label="Monto a cancelar (S/.)"
                outlined
                dense
                type="number"
                min="0.01"
                step="0.01"
                :rules="[(v) => v > 0 || 'Ingrese un monto mayor a 0']"
              />
            </template>

            <!-- ───────────────────────────────────────────
                 MODO SECUNDARIO: pago por servicio/ítem
            ─────────────────────────────────────────── -->
            <template v-else>
              <div v-if="userPayBoletas.length">
                <div class="text-caption text-grey-7 q-mb-sm">
                  Selecciona los servicios a marcar como pagados
                </div>

                <div v-for="b in userPayBoletas" :key="b.id" class="q-mb-sm">
                  <!-- Cabecera de boleta -->
                  <div
                    class="row items-center q-px-sm q-py-xs rounded-borders bg-grey-2"
                  >
                    <q-checkbox
                      :model-value="areAllDetallesSelected(b)"
                      :indeterminate="areSomeDetallesSelected(b)"
                      color="green-8"
                      dense
                      @update:model-value="(v) => toggleBoletaDetalles(b, v)"
                    />
                    <span class="text-weight-medium text-body2 q-ml-sm">
                      {{ b.cod_boleta || `#${b.id}` }}
                    </span>
                    <q-space />
                    <q-badge
                      color="orange"
                      :label="`Saldo: S/. ${Number(
                        (b.monto_facturado || 0) - (b.monto_cancelado || 0)
                      ).toFixed(2)}`"
                    />
                  </div>

                  <!-- Servicios/ítems de la boleta -->
                  <q-list
                    v-if="b.detalles && b.detalles.length"
                    dense
                    bordered
                    separator
                    class="q-mt-xs"
                  >
                    <q-item
                      v-for="d in b.detalles"
                      :key="d.id"
                      tag="label"
                      clickable
                      dense
                    >
                      <q-item-section side>
                        <q-checkbox
                          v-model="payBoletaForm.idDetalle"
                          :val="d.id"
                          color="green-8"
                          dense
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>
                          {{ d.desc_perfil || "Servicio" }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <!-- Último ítem pendiente con descuento: mostrar precio original tachado + precio neto real -->
                        <template
                          v-if="
                            b.descuentos &&
                            b.descuentos.length &&
                            b.detalles.length === 1
                          "
                        >
                          <div class="column items-end q-gutter-y-none">
                            <span
                              class="text-caption text-grey-5"
                              style="text-decoration: line-through"
                            >
                              S/. {{ Number(d.monto_servicio || 0).toFixed(2) }}
                            </span>
                            <q-badge
                              color="green-8"
                              :label="`S/. ${(
                                Number(b.monto_facturado || 0) -
                                Number(b.monto_cancelado || 0)
                              ).toFixed(2)}`"
                            />
                            <span class="text-caption text-blue-grey-5"
                              >desc. incluido</span
                            >
                          </div>
                        </template>
                        <template v-else>
                          <q-badge
                            color="green-8"
                            :label="`S/. ${Number(
                              d.monto_servicio || 0
                            ).toFixed(2)}`"
                          />
                        </template>
                      </q-item-section>
                    </q-item>
                    <!-- Filas de descuento (solo informativas, no seleccionables) -->
                    <q-item
                      v-for="d in b.descuentos"
                      :key="`desc-${d.id}`"
                      dense
                      disable
                    >
                      <q-item-section side>
                        <q-icon name="sell" color="blue-grey-5" size="xs" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-blue-grey-6 text-caption">
                          {{ d.notas || "Descuento" }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <span class="text-caption text-blue-grey-6">
                          S/. {{ Number(d.monto_servicio || 0).toFixed(2) }}
                        </span>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-caption text-grey-6 q-pl-xl q-mt-xs">
                    Sin servicios pendientes
                  </div>
                </div>

                <!-- Total auto-calculado -->
                <div class="row justify-end items-center q-mt-sm q-gutter-x-sm">
                  <span
                    v-if="montoDescuentoAplicado !== '0.00'"
                    class="text-caption text-blue-grey-6"
                  >
                    (incl. descuento S/. {{ montoDescuentoAplicado }})
                  </span>
                  <span class="text-subtitle2 text-weight-bold text-green-8">
                    Total a pagar: S/. {{ montoSeleccionado }}
                  </span>
                </div>
              </div>

              <div v-else class="text-center q-py-sm text-grey-6">
                <q-icon name="check_circle" size="2rem" color="green" />
                <div class="q-mt-xs">No hay boletas pendientes</div>
              </div>
            </template>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Registrar pago"
            color="green-8"
            icon="payments"
            @click="savePayBoleta"
            :disable="
              loadingPayBoletas ||
              (modoPayBoleta === 'boletas' &&
                ((!payBoletaForm.bAll && !payBoletaForm.idBoleta.length) ||
                  !payBoletaForm.montoCancelado ||
                  payBoletaForm.montoCancelado <= 0)) ||
              (modoPayBoleta === 'items' && !payBoletaForm.idDetalle.length)
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog liquidar cobros -->
    <q-dialog v-model="showLiquidarDialog" persistent>
      <q-card class="dialog-card dialog-card--md">
        <q-card-section class="bg-deep-orange-8 text-white">
          <div class="text-h6">
            <q-icon name="done_all" class="q-mr-sm" />
            Liquidar cobros —
            {{ liquidarUserTarget?.nom_usuario }}
            {{ liquidarUserTarget?.ape_usuario }}
          </div>
          <div class="text-caption q-mt-xs">
            Los cobros pagados pasarán de cobrador a administración
          </div>
        </q-card-section>

        <q-card-section>
          <div v-if="loadingLiquidarBoletas" class="flex flex-center q-py-lg">
            <q-spinner-dots size="40px" color="deep-orange" />
          </div>

          <template v-else>
            <div v-if="userLiquidarBoletas.length">
              <div class="text-caption text-grey-7 q-mb-xs">
                Cobros a liquidar ({{ userLiquidarBoletas.length }})
              </div>
              <q-list bordered separator dense>
                <q-item v-for="b in userLiquidarBoletas" :key="b.id">
                  <q-item-section>
                    <q-item-label>{{
                      b.cod_boleta || `#${b.id}`
                    }}</q-item-label>
                    <q-item-label caption>
                      {{
                        b.fecha_emision ? b.fecha_emision.substring(0, 10) : "—"
                      }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge
                      color="green-8"
                      :label="`S/. ${Number(b.monto_facturado || 0).toFixed(
                        2
                      )}`"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <div class="q-mt-sm text-right">
                <span class="text-subtitle2 text-weight-bold">
                  Total a liquidar: S/.
                  {{
                    userLiquidarBoletas
                      .reduce(
                        (sum, b) => sum + Number(b.monto_facturado || 0),
                        0
                      )
                      .toFixed(2)
                  }}
                </span>
              </div>
            </div>

            <div v-else class="text-center q-py-sm text-grey-6">
              <q-icon name="check_circle" size="2rem" color="green" />
              <div class="q-mt-xs">No hay cobros pendientes de liquidar</div>
            </div>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Confirmar liquidación"
            color="deep-orange-8"
            icon="done_all"
            @click="confirmLiquidar"
            :disable="loadingLiquidarBoletas || !userLiquidarBoletas.length"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog confirmación -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card class="dialog-card dialog-card--xs">
        <q-card-section class="bg-orange text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            Confirmar acción
          </div>
        </q-card-section>
        <q-card-section>
          <p>{{ confirmMessage }}</p>
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
    filteredUsers() {
      if (!this.searchTerm) return this.arr_users;
      const term = this.searchTerm.toLowerCase();
      return this.arr_users.filter(
        (u) =>
          (u.nom_usuario || "").toLowerCase().includes(term) ||
          (u.ape_usuario || "").toLowerCase().includes(term) ||
          (u.email_principal_usuario || "").toLowerCase().includes(term) ||
          (u.celular_principal_usuario || "").toLowerCase().includes(term)
      );
    },
    montoSeleccionado() {
      let total = 0;
      for (const boleta of this.userPayBoletas) {
        const detalles = boleta.detalles || [];
        const selectedIds = this.payBoletaForm.idDetalle;
        const selectedFromBoleta = detalles.filter((d) =>
          selectedIds.includes(d.id)
        );
        if (!selectedFromBoleta.length) continue;
        if (selectedFromBoleta.length === detalles.length) {
          // Todos los ítems seleccionados → usar monto neto (ya incluye descuentos)
          total +=
            parseFloat(boleta.monto_facturado || 0) -
            parseFloat(boleta.monto_cancelado || 0);
        } else {
          // Pago parcial → sumar solo los ítems elegidos
          for (const d of selectedFromBoleta) {
            total += parseFloat(d.monto_servicio || 0);
          }
        }
      }
      return total.toFixed(2);
    },
    montoDescuentoAplicado() {
      let totalDesc = 0;
      for (const boleta of this.userPayBoletas) {
        const detalles = boleta.detalles || [];
        const selectedIds = this.payBoletaForm.idDetalle;
        const selectedFromBoleta = detalles.filter((d) =>
          selectedIds.includes(d.id)
        );
        if (
          selectedFromBoleta.length === detalles.length &&
          detalles.length > 0
        ) {
          for (const d of boleta.descuentos || []) {
            totalDesc += parseFloat(d.monto_servicio || 0);
          }
        }
      }
      return totalDesc.toFixed(2);
    },
  },
};
</script>

<style scoped>
.admin-header {
  gap: 12px;
}

.admin-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.user-search-input {
  min-width: 250px;
}

.action-buttons-desktop {
  flex-wrap: wrap;
}

.action-buttons-mobile {
  flex-wrap: wrap;
}

.dialog-card {
  width: 92vw;
  max-width: 640px;
}

.dialog-card--lg {
  max-width: 680px;
}

.dialog-card--md {
  max-width: 560px;
}

.dialog-card--sm {
  max-width: 440px;
}

.dialog-card--xs {
  max-width: 380px;
}

@media (max-width: 1023px) {
  .admin-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .user-search-input {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 599px) {
  .admin-users-page .text-h4 {
    font-size: 1.4rem;
    line-height: 1.2;
  }

  .admin-actions .q-btn {
    flex: 1 1 calc(50% - 8px);
  }

  .admin-actions .q-btn.q-btn--round {
    flex: 0 0 auto;
    width: 40px;
    min-width: 40px;
    height: 40px;
  }
}
</style>
