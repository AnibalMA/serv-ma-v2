<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <div class="q-pl-sm">
        <span class="q-table__title" style="color: #000"># Dashboard</span>
      </div>
      <q-carousel
        v-model="slide"
        transition-prev="scale"
        transition-next="scale"
        swipeable
        animated
        control-color="white"
        navigation
        padding
        arrows
        height="300px"
        class="bg-cyan-8 text-white shadow-1 rounded-borders"
      >
        <q-carousel-slide name="tv" class="column no-wrap flex-center">
          <q-icon name="live_tv" size="56px" />
          <div class="q-mt-md text-center">
            Te encuentras en la versión inicial de la aplicación
          </div>
        </q-carousel-slide>
        <q-carousel-slide name="layers" class="column no-wrap flex-center">
          <q-icon name="layers" size="56px" />
          <div class="q-mt-md text-center">
            Pronto tendremos más funcionalidades
          </div>
        </q-carousel-slide>
      </q-carousel>
      <div class="row col-12 justify-evenly">
        <div class="card-dashboard">
          <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
            <q-toolbar-title>Funcionalidades</q-toolbar-title>
          </q-toolbar>

          <q-list bordered>
            <q-item-label header
              >Ver Boletas de Pago (Pendientes y Canceladas)</q-item-label
            >
            <q-separator />
            <q-item-label header
              >Descargar Boletas de Pago (Pendientes y Canceladas)</q-item-label
            >
          </q-list>
        </div>
        <div class="card-dashboard">
          <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
            <q-toolbar-title>Proximamente</q-toolbar-title>
          </q-toolbar>

          <q-list bordered>
            <q-item-label header>Perfil</q-item-label>
            <q-separator />
            <q-item-label header>Plataformas inscritas</q-item-label>
            <q-separator />
            <q-item-label header>Solicitudes</q-item-label>
          </q-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "IndexPage",
  data() {
    return {
      slide: ref("tv"),
    };
  },
});
</script>
