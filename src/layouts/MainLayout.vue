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
      >
        <q-scroll-area
          style="
            height: calc(100% - 150px);
            margin-top: 150px;
            border-right: 1px solid #ddd;
          "
        >
          <q-list :padding="true">
            <template v-for="(menuItem, index) in menuList">
              <q-item
                v-if="true"
                :clickable="true"
                style="height: 100px"
                :key="index"
                :to="menuItem.route"
                @click="onPressMenu(menuItem.label)"
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
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
            <div class="text-weight-bold">
              {{ loggedInUser.nom_usuario }} {{ loggedInUser.ape_usuario }}
            </div>
            <div>@{{ loggedInUser.usernameL }}</div>
          </div>
        </q-img>
      </q-drawer>

      <q-page-container>
        <router-view />
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

export default {
  data() {
    return {
      activateDark: false,
      user: useUserStore().getUser(),
      drawer: false,
      menuList: [
        {
          icon: "dashboard",
          label: "Dashboard",
          route: "/dashboard",
          separator: true,
        },
        {
          icon: "receipt",
          label: "Boletas",
          separator: true,
        },
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
      switch (oEvent) {
        case "Dashboard":
          const resUsers = await serviceHttp.get("/users");
          console.log(resUsers);
          // console.log(this);
          this.$router.replace("/dashboard");
          break;
        case "Boletas":
          this.$router.replace("/boletas");
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
};
</script>
