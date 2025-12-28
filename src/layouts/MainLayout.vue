<template>
  <div>
    <!-- Efecto de nieve navideña -->
    <ChristmasSnow />

    <!-- Música navideña de fondo -->
    <audio
      ref="christmasAudio"
      autoplay
      preload="auto"
      muted
      :src="currentSong.src"
      @timeupdate="updateTime"
      @loadedmetadata="updateDuration"
      @ended="nextSong"
    >
      Tu navegador no soporta el elemento de audio.
    </audio>

    <q-layout
      view="lHh Lpr lff"
      :container="true"
      style="height: 100vh"
      class="shadow-2"
    >
      <q-header :elevated="true" class="bg-cyan-8">
        <q-toolbar>
          <q-toolbar-title style="display: flex; align-items: center">
            <img
              :src="images.christmasLogo"
              alt="Serv-MA"
              style="
                height: 22px;
                width: auto;
                max-width: none;
                object-fit: contain;
              "
            />
          </q-toolbar-title>
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
          style="
            height: calc(100% - 150px);
            margin-top: 150px;
            padding-bottom: 70px;
          "
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
          class="main-content-area"
        >
          <div style="padding-bottom: 70px">
            <router-view />
          </div>
        </q-scroll-area>
      </q-page-container>
    </q-layout>

    <!-- Controles flotantes de música navideña -->
    <div class="music-controls-floating">
      <q-card
        class="music-card"
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
      >
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between no-wrap">
            <!-- Icono y controles principales -->
            <div class="row items-center q-gutter-xs">
              <q-icon name="music_note" color="red" size="md" />
              <q-btn
                round
                dense
                icon="skip_previous"
                color="red"
                size="sm"
                @click="prevSong"
              >
                <q-tooltip class="bg-red">Anterior</q-tooltip>
              </q-btn>
              <q-btn
                round
                dense
                :icon="isPlaying ? 'pause' : 'play_arrow'"
                color="red"
                size="md"
                @click="togglePlay"
              >
                <q-tooltip class="bg-red">{{
                  isPlaying ? "Pausar" : "Reproducir"
                }}</q-tooltip>
              </q-btn>
              <q-btn
                round
                dense
                icon="skip_next"
                color="red"
                size="sm"
                @click="nextSong"
              >
                <q-tooltip class="bg-red">Siguiente</q-tooltip>
              </q-btn>
              <q-btn
                round
                dense
                :icon="isMuted ? 'volume_off' : 'volume_up'"
                color="red"
                size="sm"
                @click="toggleMute"
              >
                <q-tooltip class="bg-red">{{
                  isMuted ? "Silenciar" : "Activar"
                }}</q-tooltip>
              </q-btn>
            </div>

            <!-- Slider de volumen, nombre de canción y tiempo -->
            <div
              class="column q-ml-sm"
              style="min-width: 140px; flex: 1; max-width: 200px"
            >
              <div
                class="text-caption text-center ellipsis"
                style="font-size: 11px; font-weight: 500"
                :title="currentSong.title"
              >
                🎵 {{ currentSong.title }}
              </div>
              <q-slider
                v-model="musicVolume"
                :min="0"
                :max="100"
                @update:model-value="updateVolume"
                color="red"
                :disable="isMuted"
                dense
              >
                <q-tooltip class="bg-red">{{ musicVolume }}%</q-tooltip>
              </q-slider>
              <div
                class="text-caption text-center"
                style="margin-top: -6px; font-size: 9px"
              >
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }} •
                {{ currentSongIndex + 1 }}/{{ playlist.length }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
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

// Controles flotantes de música
.music-controls-floating {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;

  .music-card {
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
    border-radius: 0;
    border-top: 2px solid #f44336;
    margin: 0;

    // Hacer más compacto en móviles
    .q-card__section {
      padding: 8px 12px !important;
    }
  }

  // Desktop: flotante a la derecha
  @media (min-width: 600px) {
    bottom: 20px;
    left: auto;
    right: 20px;
    width: auto;

    .music-card {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      border: 2px solid #f44336;

      .q-card__section {
        padding: 12px 16px !important;
      }
    }
  }
}

// Ajustar drawer en móviles para dar espacio al reproductor
@media (max-width: 599px) {
  .q-drawer {
    padding-bottom: 10px;
  }
}

.body--dark {
  .music-controls-floating {
    .music-card {
      box-shadow: 0 -4px 12px rgba(255, 255, 255, 0.2);

      @media (min-width: 600px) {
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
      }
    }
  }
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
import christmasLogo from "src/assets/logo-christmas.png";
import { io } from "socket.io-client";
import { serviceHttp } from "src/utils/serviceHttp";
import ChristmasSnow from "src/components/ChristmasSnow.vue";
export default {
  data() {
    return {
      activateDark: useUserStore().getTheme() === "dark" ? true : false,
      user: useUserStore().getUser(),
      drawer: false,
      images: {
        boyImage,
        girlImage,
        christmasLogo,
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
      // Controles de música
      isPlaying: false,
      isMuted: false,
      musicVolume: 20, // Volumen inicial al 20%
      currentTime: 0,
      duration: 0,
      autoplayHandler: null,
      currentSongIndex: 0,
      playlist: [
        { title: "Last Christmas", src: "/last_christmas_sound.mp3" },
        { title: "All I Want for Christmas", src: "/all_i_want.mp3" },
        { title: "Jingle Bells", src: "/jingle_bells.mp3" },
        { title: "Feliz Navidad", src: "/feliz_navidad.mp3" },
      ],
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
      // Actualizar la preferencia de tema en la base de datos
      this.updateThemePreference();
      // Actualizar el valor de activateDark para mantener sincronizado el toggle
      this.activateDark = Dark.isActive;

      useUserStore().setTheme(Dark.isActive ? "dark" : "light");
    },
    async updateThemePreference() {
      try {
        await serviceHttp.post("/change_theme", {
          theme: Dark.isActive ? "dark" : "light",
        });
        console.log("Preferencia de tema actualizada en la base de datos");
      } catch (error) {
        console.error("Error al actualizar la preferencia de tema:", error);
        // Opcionalmente mostrar una notificación al usuario
        this.$q.notify({
          type: "negative",
          message: "No se pudo guardar la preferencia de tema",
          timeout: 2000,
        });
      }
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

    setupAutoplayOnInteraction() {
      // Crear handler que se puede remover después
      this.autoplayHandler = () => {
        const audio = this.$refs.christmasAudio;
        if (audio && audio.paused) {
          // Desmutear y reproducir
          audio.muted = false;
          audio.volume = this.musicVolume / 100;

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                this.isPlaying = true;
                console.log("🎵 Música iniciada tras interacción");
                // Remover listeners una vez que funcione
                document.removeEventListener("click", this.autoplayHandler);
                document.removeEventListener(
                  "touchstart",
                  this.autoplayHandler
                );
                document.removeEventListener("keydown", this.autoplayHandler);
              })
              .catch((error) => {
                console.log("Error al reproducir:", error);
              });
          }
        }
      };

      // Agregar listeners para múltiples tipos de interacción
      document.addEventListener("click", this.autoplayHandler);
      document.addEventListener("touchstart", this.autoplayHandler);
      document.addEventListener("keydown", this.autoplayHandler);
    },

    togglePlay() {
      const audio = this.$refs.christmasAudio;
      if (!audio) return;

      if (this.isPlaying) {
        audio.pause();
        this.isPlaying = false;
      } else {
        // Asegurarse de que no esté muteado
        audio.muted = false;
        audio.volume = this.musicVolume / 100;

        audio
          .play()
          .then(() => {
            this.isPlaying = true;
            // Remover listeners si existen
            if (this.autoplayHandler) {
              document.removeEventListener("click", this.autoplayHandler);
              document.removeEventListener("touchstart", this.autoplayHandler);
              document.removeEventListener("keydown", this.autoplayHandler);
            }
          })
          .catch((error) => {
            console.log("Error al reproducir:", error);
          });
      }
    },

    toggleMute() {
      const audio = this.$refs.christmasAudio;
      if (!audio) return;

      this.isMuted = !this.isMuted;
      audio.muted = this.isMuted;
    },

    updateVolume(value) {
      const audio = this.$refs.christmasAudio;
      if (!audio) return;

      audio.volume = value / 100;
    },

    updateTime(event) {
      this.currentTime = event.target.currentTime;
    },

    updateDuration(event) {
      this.duration = event.target.duration;
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },

    nextSong() {
      this.currentSongIndex =
        (this.currentSongIndex + 1) % this.playlist.length;
      this.playSongAfterChange();
    },

    prevSong() {
      this.currentSongIndex =
        (this.currentSongIndex - 1 + this.playlist.length) %
        this.playlist.length;
      this.playSongAfterChange();
    },

    playSongAfterChange() {
      const audio = this.$refs.christmasAudio;
      if (!audio) return;

      // Esperar a que el src cambie y reproducir
      this.$nextTick(() => {
        audio.load();
        if (this.isPlaying || !audio.paused) {
          audio.muted = false;
          audio.volume = this.musicVolume / 100;
          audio.play().catch((error) => {
            console.log("Error al reproducir siguiente canción:", error);
          });
          this.isPlaying = true;
        }
      });
    },
  },
  computed: {
    loggedInUser() {
      return this.user;
    },
    currentSong() {
      return this.playlist[this.currentSongIndex] || this.playlist[0];
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

    // Configurar el audio para autoplay
    this.$nextTick(() => {
      const audio = this.$refs.christmasAudio;
      if (audio) {
        // Establecer volumen
        audio.volume = this.musicVolume / 100;

        // Intentar desmutear después de un pequeño delay
        setTimeout(() => {
          audio.muted = false;
          this.isPlaying = !audio.paused;

          // Si no está reproduciéndose, configurar autoplay en interacción
          if (audio.paused) {
            this.setupAutoplayOnInteraction();
          }
        }, 100);
      }
    });
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }

    // Limpiar listeners de autoplay
    if (this.autoplayHandler) {
      document.removeEventListener("click", this.autoplayHandler);
      document.removeEventListener("touchstart", this.autoplayHandler);
      document.removeEventListener("keydown", this.autoplayHandler);
    }
  },
  created() {
    // Inicializar el tema basado en la preferencia guardada
    const savedTheme = useUserStore().getTheme();
    Dark.set(savedTheme === "dark");
  },
  components: {
    ChristmasSnow,
  },
};
</script>
