<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
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
          v-model="form.id_usuario"
          :options="userOptions"
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
              v-model="form.id_plataforma"
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
              v-model="form.id_grupo"
              :options="filteredGroupOptions"
              emit-value
              map-options
              label="Grupo"
              outlined
              dense
              :loading="loadingMasterData"
              :disable="!form.id_plataforma"
              :hint="
                !form.id_plataforma
                  ? 'Selecciona una plataforma primero'
                  : ''
              "
              :rules="[(v) => !!v || 'Grupo requerido']"
            />
          </div>
          <div class="col-12" v-if="grupoEmail">
            <q-input
              :model-value="grupoEmail"
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
              v-model.number="form.dia_pago"
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
              v-model.number="form.monto"
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
              v-model="form.desc_perfil"
              label="Perfil"
              outlined
              dense
              :rules="[(v) => !!v || 'Perfil requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.pin_perfil"
              label="PIN perfil"
              outlined
              dense
              :rules="[(v) => !!v || 'PIN requerido']"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Asignar"
          color="indigo"
          @click="$emit('save', form)"
          :disable="
            !form.id_usuario ||
            !form.id_grupo ||
            !form.id_plataforma ||
            !form.dia_pago ||
            form.monto === null ||
            form.monto === undefined ||
            !form.desc_perfil ||
            !form.pin_perfil
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    selectedUser: Object,
    userOptions: Array,
    platformOptions: Array,
    groupOptions: Array,
    plataformaGrupos: Array,
    loadingMasterData: Boolean,
  },
  emits: ["update:modelValue", "cancel", "save"],
  data() {
    return {
      form: {
        id_usuario: null,
        id_grupo: null,
        id_plataforma: null,
        dia_pago: null,
        monto: null,
        desc_perfil: "",
        pin_perfil: "",
      },
    };
  },
  computed: {
    // Groups that belong to the selected platform
    filteredGroupOptions() {
      if (!this.form.id_plataforma) return [];
      const idsGrupos = this.plataformaGrupos
        .filter(
          (pg) => String(pg.id_plataforma) === String(this.form.id_plataforma)
        )
        .map((pg) => pg.id_grupo);
      return this.groupOptions.filter((g) => idsGrupos.includes(g.value));
    },
    grupoEmail() {
      const { id_plataforma, id_grupo } = this.form;
      if (!id_plataforma || !id_grupo) return null;
      const pg = this.plataformaGrupos.find(
        (p) =>
          String(p.id_plataforma) === String(id_plataforma) &&
          String(p.id_grupo) === String(id_grupo)
      );
      return pg?.correo_acc || null;
    },
  },
  watch: {
    // Start with a clean form every time the dialog opens
    modelValue(isOpen) {
      if (isOpen) this.resetForm();
    },
  },
  methods: {
    resetForm() {
      this.form = {
        id_usuario: this.selectedUser?.id || null,
        id_grupo: null,
        id_plataforma: null,
        dia_pago: null,
        monto: null,
        desc_perfil: "",
        pin_perfil: "",
      };
    },
    onPlatformChange(idPlataforma) {
      this.form.id_grupo = null;
      const platform = this.platformOptions.find(
        (p) => String(p.value) === String(idPlataforma)
      );
      if (platform?.monto !== null && platform?.monto !== undefined) {
        this.form.monto = Number(platform.monto);
      }
    },
  },
};
</script>
