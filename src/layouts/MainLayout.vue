<template>
  <div>
    <q-layout view="lHh Lpr lff" :container="true" style="height: 100vh" class="shadow-2">
      <q-header :elevated="true" class="bg-cyan-8">
        <q-toolbar>
          <q-toolbar-title>Serv-MA</q-toolbar-title>
          <q-space />
          Bienvenido, {{ loggedInUser.name }}
          <q-btn round icon="notifications" unelevated class="q-mx-sm">
            <q-badge :floating="true" color="red" :rounded="true" />
          </q-btn>
          <q-separator dark vertical inset />
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="drawer" :show-if-above="true" :width="200" :breakpoint="400">
        <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
          <q-list :padding="true">
            <template v-for="(menuItem, index) in menuList">
              <q-item v-if="true" :clickable="true" style="height: 100px;" :key="index" :to="menuItem.route"
                @click="onPressMenu(menuItem.label)">
                <q-item-section>
                  <div class="row" style="text-align: center">
                    <div class="col-12" style="font-size: xx-large;">
                      <q-icon :name="menuItem.icon" color="primary" />
                    </div>
                    <div class="col-12" style="font-size: large;">
                      {{ menuItem.label }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index" v-if="menuItem.separator" />
            </template>
          </q-list>
        </q-scroll-area>

        <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <div class="text-weight-bold">{{ loggedInUser.name }}</div>
            <div>@{{ loggedInUser.username }}</div>
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
import { ref, computed } from 'vue'

export default {
  data() {
    return {
      drawer: false,
      user: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@example.com'
      },
      menuList: [
        {
          icon: 'dashboard',
          label: 'Dashboard',
          route: "/",
          separator: true
        },
        {
          icon: 'receipt',
          label: 'Boletas',
          route: 'login',
          separator: true
        },
        {
          icon: 'power_settings_new',
          label: 'Cerrar sesión',
          separator: true
        }
      ]
    }
  },
  methods: {
    onPressMenu: function (oEvent) {
      if (oEvent == 'Cerrar sesión') {
        window.location.replace('/logout');
      }
    }
  },
  computed: {
    loggedInUser() {
      return this.user
    }
  }
}
</script>