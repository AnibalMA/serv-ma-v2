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
          <q-btn round icon="notifications" unelevated class="q-mx-sm" disable>
            <q-tooltip
              transition-show="scale"
              transition-hide="scale"
              class="bg-cyan-8 text-white"
              >Notificaciones</q-tooltip
            >
            <q-badge
              :floating="true"
              color="red"
              :rounded="true"
              v-show="false"
            />
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

<script>
// import { ref, computed } from 'vue'
import { useUserStore } from "src/stores/user";
// import { Quasar, Platform } from 'quasar'
import { Dark } from "quasar";
// import { route, store } from 'quasar/wrappers'
import { serviceHttp } from "src/utils/serviceHttp";
import boyImage from "src/assets/boy-avatar.png";
import girlImage from "src/assets/girl-avatar.png";
export default {
  data() {
    return {
      activateDark: false,
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
    };
  },
  methods: {
    onPressMenu: async function (oEvent) {
      switch (oEvent.label) {
        case "Dashboard":
          const resUsers = await serviceHttp.get("/users");
          console.log(resUsers);
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
};
</script>
