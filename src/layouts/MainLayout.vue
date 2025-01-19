<template>
  <div>
    <q-layout
      view="lHh Lpr lff"
      :container="true"
      style="height: 100vh"
      class="shadow-2"
    >
      <q-header :elevated="true" class="bg-cyan-8">
        <q-toolbar>
          <q-toolbar-title>Serv-MA</q-toolbar-title>
          <q-space />
          <div :hidden="$q.screen.xs">
            Bienvenido, {{ loggedInUser.nom_usuario }}
            {{ loggedInUser.ape_usuario }}
          </div>
          <q-toggle
            name="light_active"
            v-model="activateDark"
            @update:model-value="onChangeTheme"
            color="primary"
            checked-icon="dark_mode"
            unchecked-icon="lightbulb"
          >
            <q-tooltip
              transition-show="scale"
              transition-hide="scale"
              class="bg-cyan-8 text-white"
              >Activar modo {{ activateDark ? "Light" : "Dark" }}</q-tooltip
            >
          </q-toggle>
          <q-separator dark vertical inset />
          <!-- En MainLayout.vue -->
          <q-btn
            round
            flat
            icon="notifications"
            class="q-mx-sm"
            @click="toggleNotifications"
          >
            <q-badge v-if="unreadCount" floating color="red" rounded>{{
              unreadCount
            }}</q-badge>

            <!-- Menú para Desktop -->
            <q-menu
              v-if="!$q.screen.lt.sm"
              v-model="showNotifications"
              anchor="bottom right"
              self="top right"
              class="desktop-notifications"
            >
              <q-list style="min-width: 350px; max-width: 400px">
                <q-item class="bg-cyan-8 text-white">
                  <q-item-section>
                    <div class="row items-center justify-between">
                      <div class="text-subtitle1">Notificaciones</div>
                      <q-btn
                        v-if="unreadCount"
                        flat
                        round
                        dense
                        icon="done_all"
                        class="text-white"
                        @click="markAllAsRead"
                      >
                        <q-tooltip>Marcar todas como leídas</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>

                <q-scroll-area style="height: 400px">
                  <q-list padding>
                    <template v-if="notifications.length">
                      <q-item
                        v-for="notif in notifications"
                        :key="notif.id"
                        clickable
                        v-ripple
                        @click="markAsRead(notif)"
                        :class="{
                          'bg-grey-2': !notif.is_read && !$q.dark.isActive,
                          'bg-grey-9': !notif.is_read && $q.dark.isActive,
                          'notification-item': true,
                        }"
                      >
                        <q-item-section avatar>
                          <q-icon
                            :name="getNotificationIcon(notif.type)"
                            :color="getNotificationColor(notif.type)"
                          />
                        </q-item-section>

                        <q-item-section>
                          <q-item-label
                            :class="$q.dark.isActive ? 'text-white' : ''"
                          >
                            {{ notif.title }}
                          </q-item-label>
                          <q-item-label
                            caption
                            :class="$q.dark.isActive ? 'text-grey-4' : ''"
                          >
                            {{ notif.message }}
                          </q-item-label>
                          <q-item-label
                            caption
                            :class="
                              $q.dark.isActive ? 'text-grey-6' : 'text-grey'
                            "
                          >
                            {{ formatDate(notif.timestamp) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>

                    <div v-else class="empty-notifications-container">
                      <div class="empty-notifications-content">
                        <q-icon
                          name="notifications_none"
                          size="64px"
                          :color="$q.dark.isActive ? 'grey-6' : 'grey-5'"
                        />
                        <div
                          class="text-subtitle1 q-mt-sm"
                          :class="
                            $q.dark.isActive ? 'text-grey-6' : 'text-grey-7'
                          "
                        >
                          No hay notificaciones
                        </div>
                      </div>
                    </div>
                  </q-list>
                </q-scroll-area>
              </q-list>
            </q-menu>

            <!-- Diálogo para Móvil -->
            <q-dialog
              v-model="showNotificationsDialog"
              v-if="$q.screen.lt.sm"
              full-width
              full-height
              maximized
              class="notifications-dialog"
            >
              <q-card
                class="full-height"
                :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
              >
                <q-toolbar class="bg-cyan-9 text-white">
                  <q-toolbar-title class="text-weight-bold"
                    >Notificaciones</q-toolbar-title
                  >
                  <q-btn
                    v-if="unreadCount"
                    flat
                    round
                    dense
                    icon="done_all"
                    class="q-mr-sm"
                    @click="markAllAsRead"
                  />
                  <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>

                <q-card-section
                  class="q-pa-none scroll"
                  style="height: calc(100vh - 50px)"
                >
                  <q-list padding>
                    <template v-if="notifications.length">
                      <q-item
                        v-for="notif in notifications"
                        :key="notif.id"
                        clickable
                        v-ripple
                        @click="markAsRead(notif)"
                        class="notification-item q-py-md"
                        :class="$q.dark.isActive ? 'text-white' : 'text-black'"
                      >
                        <q-item-section side>
                          <q-icon
                            :name="getNotificationIcon(notif.type)"
                            :color="getNotificationColor(notif.type)"
                            size="sm"
                          />
                        </q-item-section>

                        <q-item-section>
                          <q-item-label class="text-weight-medium">
                            {{ notif.title }}
                          </q-item-label>
                          <q-item-label
                            caption
                            :class="
                              $q.dark.isActive ? 'text-grey-4' : 'text-grey-7'
                            "
                          >
                            {{ notif.message }}
                          </q-item-label>
                          <q-item-label
                            caption
                            :class="
                              $q.dark.isActive ? 'text-grey-6' : 'text-grey-6'
                            "
                          >
                            {{ formatDate(notif.timestamp) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>

                    <div v-else class="empty-notifications">
                      <q-icon
                        name="notifications_none"
                        size="48px"
                        :color="$q.dark.isActive ? 'grey-6' : 'grey-5'"
                      />
                      <div
                        class="text-subtitle1 q-mt-sm"
                        :class="
                          $q.dark.isActive ? 'text-grey-6' : 'text-grey-7'
                        "
                      >
                        No hay notificaciones
                      </div>
                    </div>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-dialog>
          </q-btn>
          <q-separator dark vertical inset />
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="drawer"
        :show-if-above="true"
        :width="200"
        :breakpoint="400"
        style="border-right: 1px solid #26a69a"
      >
        <q-scroll-area
          style="height: calc(100% - 150px); margin-top: 150px"
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          dark
        >
          <q-list :padding="true">
            <template v-for="(menuItem, index) in menuList">
              <q-item
                v-if="true"
                :clickable="true"
                style="height: 80px"
                :key="index"
                :to="menuItem.route"
                @click="onPressMenu(menuItem)"
              >
                <q-item-section>
                  <div class="row" style="text-align: center">
                    <div class="col-12" style="font-size: xx-large">
                      <q-icon :name="menuItem.icon" color="primary" />
                    </div>
                    <div class="col-12" style="font-size: large">
                      {{ menuItem.label }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index" v-if="menuItem.separator" />
            </template>
          </q-list>
        </q-scroll-area>

        <q-img
          class="absolute-top"
          src="https://cdn.quasar.dev/img/material.png"
          style="height: 150px"
        >
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img
                :src="
                  loggedInUser.genero === 'M'
                    ? images.boyImage
                    : images.girlImage
                "
              />
            </q-avatar>
            <div class="text-weight-bold">
              {{ loggedInUser.nom_usuario }} {{ loggedInUser.ape_usuario }}
            </div>
            <div>@{{ loggedInUser.usernameL }}</div>
          </div>
        </q-img>
      </q-drawer>

      <q-page-container>
        <q-scroll-area
          style="height: calc(100vh - 50px)"
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
        >
          <router-view />
        </q-scroll-area>
      </q-page-container>
    </q-layout>
  </div>
</template>
<style lang="scss">
.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 150px); // Para el diálogo móvil
  width: 100%;
  text-align: center;
  padding: 2rem;
}

.empty-notifications-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px; // Para el menú de escritorio
  width: 100%;
}

.empty-notifications-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}
.notifications-dialog {
  .notification-item {
    border-bottom: 1px solid;

    &:active {
      background: rgba(0, 0, 0, 0.1);
    }

    .q-item__label {
      line-height: 1.2;
    }
  }

  .q-toolbar {
    min-height: 50px;
  }
}

.body--light {
  .notifications-dialog {
    .notification-item {
      border-bottom-color: rgba(0, 0, 0, 0.05);

      &:active {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.body--dark {
  .notifications-dialog {
    .q-dialog__inner > div {
      background: #1d1d1d !important;
    }

    .notification-item {
      border-bottom-color: rgba(255, 255, 255, 0.1);

      &:active {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// Personalización del scrollbar según el tema
.body--light {
  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

.body--dark {
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
}
</style>
<script>
// import { ref, computed } from 'vue'
import { useUserStore } from "src/stores/user";
// import { Quasar, Platform } from 'quasar'
import { Dark } from "quasar";
// import { route, store } from 'quasar/wrappers'
// import { serviceHttp } from "src/utils/serviceHttp";
import boyImage from "src/assets/boy-avatar.png";
import girlImage from "src/assets/girl-avatar.png";
import { io } from "socket.io-client";
import { serviceHttp } from "src/utils/serviceHttp";
export default {
  data() {
    return {
      activateDark: Dark.isActive || false,
      user: useUserStore().getUser(),
      drawer: false,
      images: {
        boyImage,
        girlImage,
      },
      menuList: useUserStore().getRols() || [
        {
          icon: "power_settings_new",
          label: "Cerrar sesión",
          separator: true,
        },
      ],
      isLoading: false,
      notifications: [],
      socket: null,
      unreadCount: 0,
      showNotifications: false,
      showNotificationsDialog: false,
    };
  },
  watch: {
    notifications: {
      immediate: true,
      handler(newNotifications) {
        this.updateUnreadCount();
      },
    },
  },
  methods: {
    toggleNotifications() {
      if (this.$q.screen.lt.sm) {
        this.showNotificationsDialog = !this.showNotificationsDialog;
      }
    },
    onPressMenu: async function (oEvent) {
      switch (oEvent.label) {
        case "Dashboard":
          // console.log(this);
          this.$router.replace(oEvent.route);
          break;
        case "Boletas":
          this.$router.replace(oEvent.route);
          break;
        case "Cerrar sesión":
          this.logout();
          break;
      }
    },
    logout: function () {
      useUserStore().logout();
      this.$router.replace("/login");
    },
    onChangeTheme: function () {
      Dark.toggle();
    },
    connectSocket() {
      this.socket = io(process.env.API_BACKEND, {
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("Conectado al servidor de Socket.IO");
        this.socket.emit("authenticate", this.user.id);
      });

      this.socket.on("new-notification", (notification) => {
        this.addNotification(notification);
      });

      this.socket.on("disconnect", () => {
        console.log("Desconectado del servidor de Socket.IO");
      });
    },
    closeNotificationMenu() {
      this.$refs.notificationMenu.hide();
    },
    async loadNotifications() {
      try {
        this.isLoading = true;
        const response = await serviceHttp.get("/api/notifications");
        if (response.data.ok) {
          this.notifications = response.data.data.map((n) => ({
            ...n,
            read: n.is_read,
            timestamp: n.created_at,
          }));
          this.updateUnreadCount(); // Actualizar el contador después de cargar
        }
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        this.isLoading = false;
      }
    },
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(
        (n) => !n.is_read && !n.read
      ).length;
    },
    getNotificationIcon(type) {
      const icons = {
        success: "check_circle",
        warning: "warning",
        error: "error",
        info: "info",
      };
      return icons[type] || "info";
    },

    getNotificationColor(type) {
      const colors = {
        success: "positive",
        warning: "warning",
        error: "negative",
        info: "info",
      };
      return colors[type] || "info";
    },

    formatDate(date) {
      if (!date) return "";
      const now = new Date();
      const notifDate = new Date(date);
      const diff = now - notifDate;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return "Ahora";
      if (minutes < 60) return `Hace ${minutes} minutos`;
      if (hours < 24) return `Hace ${hours} horas`;
      if (days < 7) return `Hace ${days} días`;

      return notifDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    async markAsRead(notification) {
      if (!notification.is_read && !notification.read) {
        try {
          await serviceHttp.put(`/api/notifications/${notification.id}/read`);
          notification.is_read = true;
          notification.read = true;
          this.updateUnreadCount();
        } catch (error) {
          console.error("Error al marcar como leída:", error);
        }
      }
    },

    async markAllAsRead() {
      try {
        await serviceHttp.put("/api/notifications/mark-all-read");
        this.notifications.forEach((notif) => {
          notif.is_read = true;
          notif.read = true;
        });
        this.updateUnreadCount();
      } catch (error) {
        console.error("Error al marcar todas como leídas:", error);
      }
    },
    async addNotification(notification) {
      this.notifications.unshift({
        id: notification.id,
        is_read: false,
        read: false,
        timestamp: notification.created_at,
        ...notification,
      });
      this.updateUnreadCount();

      this.$q.notify({
        message: notification.message,
        type: notification.type,
        position: "top-right",
        timeout: 5000,
      });
    },
  },
  computed: {
    loggedInUser() {
      return this.user;
    },
  },
  setup() {
    return {
      thumbStyle: {
        right: "4px",
        borderRadius: "5px",
        backgroundColor: "#027be3",
        width: "5px",
        opacity: 0.75,
      },

      barStyle: {
        right: "2px",
        borderRadius: "9px",
        backgroundColor: "#027be3",
        width: "9px",
        opacity: 0.2,
      },
    };
  },
  async mounted() {
    await this.loadNotifications();
    this.connectSocket();
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>
