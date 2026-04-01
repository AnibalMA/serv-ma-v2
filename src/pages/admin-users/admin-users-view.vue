<template>
  <q-page class="q-px-sm">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md q-ma-sm">
      <div>
        <h4 class="text-h4 q-my-none">👥 Gestión de Usuarios</h4>
        <p class="text-grey-6 q-mb-none">
          Administración de usuarios del sistema
        </p>
      </div>
      <div class="row q-gutter-sm">
        <q-input
          v-model="searchTerm"
          outlined
          dense
          placeholder="Buscar usuario..."
          style="min-width: 250px"
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
    >
      <template v-slot:body-cell-initials="props">
        <q-td :props="props">
          <q-avatar
            size="36px"
            :color="props.row.cod_estado === 'ESTADO_01' ? 'cyan-8' : 'grey-5'"
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
            :color="props.row.cod_estado === 'ESTADO_01' ? 'green' : 'red'"
            :label="
              props.row.desc_estado ||
              (props.row.cod_estado === 'ESTADO_01' ? 'Activo' : 'Inactivo')
            "
          />
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
            :icon="
              props.row.cod_estado === 'ESTADO_01' ? 'person_off' : 'person'
            "
            :color="
              props.row.cod_estado === 'ESTADO_01' ? 'negative' : 'positive'
            "
            @click="onToggleUserStatus(props.row)"
          >
            <q-tooltip>{{
              props.row.cod_estado === "ESTADO_01" ? "Desactivar" : "Activar"
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
      <q-card style="min-width: 400px">
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
                  :color="
                    selectedUser.cod_estado === 'ESTADO_01' ? 'green' : 'red'
                  "
                />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Estado</q-item-label>
                <q-item-label>{{
                  selectedUser.desc_estado ||
                  (selectedUser.cod_estado === "ESTADO_01"
                    ? "Activo"
                    : "Inactivo")
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

    <!-- Dialog editar usuario -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 450px">
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
      <q-card style="min-width: 500px">
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
            <q-item v-for="d in userDiscounts" :key="d.id">
              <q-item-section>
                <q-item-label>{{
                  d.descripcion || "Sin descripción"
                }}</q-item-label>
                <q-item-label caption>ID: {{ d.id }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  color="green"
                  :label="`S/. ${(d.monto * 1).toFixed(2)}`"
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
      <q-card style="min-width: 400px">
        <q-card-section class="bg-teal-8 text-white">
          <div class="text-h6">
            <q-icon name="add_card" class="q-mr-sm" />
            Nuevo Descuento - {{ selectedUser?.nom_usuario }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model.number="discountForm.monto"
            label="Monto (S/.)"
            outlined
            dense
            type="number"
            min="0"
            step="0.01"
            :rules="[(v) => v > 0 || 'El monto debe ser mayor a 0']"
          />
          <q-input
            v-model="discountForm.descripcion"
            label="Descripción"
            outlined
            dense
            type="textarea"
            rows="3"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Registrar"
            color="teal"
            @click="saveDiscount"
            :disable="discountForm.monto <= 0"
          />
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
  },
};
</script>
