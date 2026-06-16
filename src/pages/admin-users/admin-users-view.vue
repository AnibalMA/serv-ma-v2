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
                <div :class="$q.dark.isActive ? 'text-caption text-grey-6 ellipsis' : 'text-caption text-grey-7 ellipsis'">
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

    <UserViewDialog
      v-model="showUserDialog"
      :user="selectedUser"
      :is-active="isUserActive(selectedUser)"
    />

    <UserCreateDialog
      v-model="showCreateUserDialog"
      @save="saveNewUser"
      @cancel="showCreateUserDialog = false"
    />

    <UserAssignPlatformServiceDialog
      v-model="showAssignPlatformServiceDialog"
      :selected-user="selectedUser"
      :user-options="userOptions"
      :platform-options="platformOptions"
      :filtered-group-options="filteredGroupOptions"
      :loading-master-data="loadingMasterData"
      :grupo-email="getSelectedGrupoEmail()"
      @save="savePlatformService"
      @cancel="showAssignPlatformServiceDialog = false"
      @platform-change="onPlatformChange"
    />

    <UserEditDialog
      v-model="showEditDialog"
      :user="selectedUser"
      @save="saveUserEdit"
      @cancel="showEditDialog = false"
    />

    <UserDiscountsDialog
      v-model="showDiscountDialog"
      :user="selectedUser"
      :discounts="userDiscounts"
      :loading="loadingDiscounts"
    />

    <UserAddDiscountDialog
      v-model="showServiceDialog"
      :selected-user="selectedUser"
      @save="saveDiscount"
      @cancel="showServiceDialog = false"
    />

    <UserManageServicesDialog
      v-model="showManageServicesDialog"
      :selected-user="selectedUser"
      :user-services="userServices"
      :loading-user-services="loadingUserServices"
      @edit-service="onOpenEditService"
      @deactivate-service="onDeactivateService"
      @reload="selectedUser?.id && loadUserServices(selectedUser.id)"
    />

    <UserEditServiceDialog
      v-model="showEditServiceDialog"
      :service="editingService"
      @save="saveUserServiceEdit"
      @cancel="showEditServiceDialog = false"
    />

    <UserPayBoletaDialog
      v-model="showPayBoletaDialog"
      :selected-user="selectedUser"
      :loading-pay-boletas="loadingPayBoletas"
      :user-pay-boletas="userPayBoletas"
      @cancel="showPayBoletaDialog = false"
      @save-pay-boleta="savePayBoleta"
    />

    <UserLiquidarDialog
      v-model="showLiquidarDialog"
      :user="liquidarUserTarget"
      :boletas="userLiquidarBoletas"
      :loading="loadingLiquidarBoletas"
      @confirm="confirmLiquidar"
      @cancel="showLiquidarDialog = false"
    />

    <ConfirmDialog
      v-model="showConfirmDialog"
      :message="confirmMessage"
      @confirm="executeConfirmAction"
    />
  </q-page>
</template>

<script>
import config from "./index";
import UserViewDialog from "./components/UserViewDialog.vue";
import UserCreateDialog from "./components/UserCreateDialog.vue";
import UserAssignPlatformServiceDialog from "./components/UserAssignPlatformServiceDialog.vue";
import UserEditDialog from "./components/UserEditDialog.vue";
import UserDiscountsDialog from "./components/UserDiscountsDialog.vue";
import UserAddDiscountDialog from "./components/UserAddDiscountDialog.vue";
import UserManageServicesDialog from "./components/UserManageServicesDialog.vue";
import UserEditServiceDialog from "./components/UserEditServiceDialog.vue";
import UserPayBoletaDialog from "./components/UserPayBoletaDialog.vue";
import UserLiquidarDialog from "./components/UserLiquidarDialog.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";

export default {
  ...config,
  components: {
    UserViewDialog,
    UserCreateDialog,
    UserAssignPlatformServiceDialog,
    UserEditDialog,
    UserDiscountsDialog,
    UserAddDiscountDialog,
    UserManageServicesDialog,
    UserEditServiceDialog,
    UserPayBoletaDialog,
    UserLiquidarDialog,
    ConfirmDialog,
  },
  computed: {
    userOptions() {
      return this.arr_users.map((u) => ({
        label: `${u.nom_usuario} ${u.ape_usuario}`,
        value: u.id,
      }));
    },
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
