<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 90vw">
      <q-toolbar class="bg-grey-9 text-white">
        <q-icon name="person" class="q-mr-sm" />
        <q-toolbar-title class="text-body1">
          {{ person ? person.fullName : "Foto" }}
        </q-toolbar-title>
        <q-btn flat round icon="close" v-close-popup />
      </q-toolbar>
      <q-card-section class="flex flex-center q-pa-md" v-if="person">
        <q-img
          :src="
            'data:' +
            (person.photoMimeType || 'image/png') +
            ';base64,' +
            person.photo
          "
          style="max-width: 100%; max-height: 70vh; border-radius: 8px"
          fit="contain"
        />
      </q-card-section>
      <q-card-section v-if="person" class="q-pt-none">
        <div class="row q-col-gutter-sm items-center justify-center">
          <div v-if="person.dni">
            <q-chip icon="badge" dense>DNI: {{ person.dni }}</q-chip>
          </div>
          <div v-if="person.age">
            <q-chip icon="cake" dense>{{ person.age }} años</q-chip>
          </div>
          <div v-if="person.department">
            <q-chip icon="location_on" dense>{{ person.department }}</q-chip>
          </div>
          <div v-if="person.similarityPercent != null">
            <q-chip
              :icon="'compare'"
              :color="person.similarityPercent >= 80 ? 'green' : person.similarityPercent >= 50 ? 'orange' : 'red'"
              text-color="white"
              dense
            >
              {{ person.similarityPercent }}% similitud
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    person: Object,
  },
  emits: ["update:modelValue"],
};
</script>
