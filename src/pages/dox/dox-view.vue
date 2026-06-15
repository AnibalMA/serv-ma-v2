<template>
  <q-page :class="$q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md'">
    <!-- Header: Créditos -->
    <div class="row q-mb-md items-center">
      <div class="col">
        <div
          :class="$q.screen.lt.sm ? 'text-h6' : 'text-h5'"
          class="text-weight-bold"
        >
          <q-icon name="search" class="q-mr-sm" color="primary" />
          Consultas DOX-MA
        </div>
      </div>
      <div class="col-auto">
        <q-chip
          :color="credits > 0 ? 'green-8' : 'red-8'"
          text-color="white"
          icon="toll"
          :size="$q.screen.lt.sm ? 'md' : 'lg'"
        >
          {{ credits }} créditos
        </q-chip>
        <q-btn
          flat
          round
          icon="history"
          color="primary"
          size="sm"
          class="q-ml-xs"
          @click="loadCreditHistory"
        >
          <q-tooltip>Historial de créditos</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="bar_chart"
          color="primary"
          size="sm"
          @click="loadUsageSummary"
        >
          <q-tooltip>Resumen de uso</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <!-- Formulario -->
    <div class="row q-col-gutter-md">
      <!-- Selector de Comando -->
      <div class="col-12 col-md-6">
        <q-select
          v-model="selectedCommand"
          :options="commands"
          label="Seleccionar Comando"
          outlined
          option-value="value"
          option-label="label"
          :loading="loadingCommands"
          @update:model-value="onCommandChange"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon
                  :name="scope.opt.requiresPhoto ? 'photo_camera' : 'terminal'"
                  :color="scope.opt.requiresPhoto ? 'orange' : 'primary'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :color="scope.opt.creditCost > 0 ? 'orange' : 'grey'"
                  :label="scope.opt.creditCost + ' cr'"
                />
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay comandos disponibles
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Costo del comando -->
      <div class="col-12 col-md-6" v-if="selectedCommand">
        <q-banner
          rounded
          :class="
            credits >= selectedCommand.creditCost
              ? 'bg-green-1 text-green-9'
              : 'bg-red-1 text-red-9'
          "
          dense
        >
          <template v-slot:avatar>
            <q-icon
              :name="
                credits >= selectedCommand.creditCost
                  ? 'check_circle'
                  : 'warning'
              "
            />
          </template>
          <span v-if="credits >= selectedCommand.creditCost">
            Costo: <strong>{{ selectedCommand.creditCost }}</strong> crédito(s)
            — Disponibles: <strong>{{ credits }}</strong>
          </span>
          <span v-else>
            Créditos insuficientes. Necesitas
            <strong>{{ selectedCommand.creditCost }}</strong
            >, tienes
            <strong>{{ credits }}</strong>
          </span>
        </q-banner>
      </div>
    </div>

    <!-- Parámetros dinámicos -->
    <div class="row q-col-gutter-md q-mt-sm" v-if="selectedCommand">
      <template v-for="param in selectedCommand.params" :key="param.name">
        <!-- Campo de foto -->
        <div class="col-12" v-if="param.type === 'photo'">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="photo_camera" class="q-mr-xs" />
            {{ param.label }}
            <span v-if="param.required" class="text-red">*</span>
          </div>

          <!-- Drop zone / file picker -->
          <div
            v-if="!photoPreview"
            class="photo-dropzone q-pa-lg text-center cursor-pointer"
            @click="triggerPhotoInput"
            @dragover.prevent
            @drop.prevent="onPhotoDrop"
          >
            <q-icon name="cloud_upload" size="48px" color="grey-5" />
            <div class="text-grey-6 q-mt-sm">
              Haz clic o arrastra una imagen aquí
            </div>
            <div class="text-grey-5 text-caption">
              {{ param.hint || "JPG o PNG, máximo 10 MB" }}
            </div>
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onPhotoSelected($event.target.files[0])"
            />
          </div>

          <!-- Preview de la foto -->
          <div v-else class="photo-preview-container">
            <q-img
              :src="photoPreview"
              :ratio="1"
              :style="
                $q.screen.lt.sm
                  ? 'max-width: 180px; border-radius: 8px'
                  : 'max-width: 300px; border-radius: 8px'
              "
              class="shadow-2"
            />
            <q-btn
              round
              flat
              color="red"
              icon="delete"
              class="q-mt-sm"
              @click="removePhoto"
            >
              <q-tooltip>Quitar foto</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Campos de texto normales -->
        <div
          class="col-12 col-md-6"
          v-else-if="param.type === 'text' || !param.type"
        >
          <q-input
            v-model="paramValues[param.name]"
            :label="param.label"
            :hint="param.hint || ''"
            :rules="
              param.required
                ? [(v) => !!v || param.label + ' es requerido']
                : []
            "
            outlined
            dense
          >
            <template v-slot:prepend>
              <q-icon name="edit" />
            </template>
          </q-input>
        </div>
      </template>
    </div>

    <!-- Botón Ejecutar -->
    <div class="row q-mt-md" v-if="selectedCommand">
      <div class="col-12 col-md-4">
        <q-btn
          color="primary"
          :label="isExecuting ? 'Ejecutando...' : 'Ejecutar Consulta'"
          icon="play_arrow"
          class="full-width"
          :size="$q.screen.lt.sm ? 'md' : 'lg'"
          :loading="isExecuting"
          :disable="!canExecute()"
          @click="executeCommand"
        >
          <q-tooltip v-if="!canExecute() && !isExecuting">
            <div v-if="!selectedCommand">Selecciona un comando</div>
            <div v-else-if="selectedCommand.requiresPhoto && !photoFile">
              Debes adjuntar una foto
            </div>
            <div
              v-else-if="
                selectedCommand.creditCost > 0 &&
                credits < selectedCommand.creditCost
              "
            >
              Créditos insuficientes
            </div>
            <div v-else>Completa los campos requeridos</div>
          </q-tooltip>
        </q-btn>
      </div>
      <!-- Indicador de alta demanda -->
      <div class="col-12 q-mt-sm" v-if="queueWait">
        <q-banner class="bg-warning text-black rounded-borders">
          <template v-slot:avatar>
            <q-icon name="hourglass_top" />
          </template>
          Alta demanda: hay consultas en espera. Tu solicitud se está procesando...
        </q-banner>
      </div>
    </div>

    <DoxResultSection
      :result="result"
      :result-error="resultError"
      :dni-photo-src="dniPhotoSrc"
      @open-photo-zoom="openPhotoZoom"
      @download-pdf="downloadPdf"
    />

    <DoxPhotoZoomDialog
      v-model="showPhotoZoom"
      :person="zoomedPerson"
    />
    <DoxCreditHistoryDialog
      v-model="showHistory"
      :rows="creditHistory"
      :loading="loadingHistory"
    />
    <DoxUsageSummaryDialog
      v-model="showSummary"
      :items="usageSummary"
      :loading="loadingSummary"
    />
  </q-page>
</template>

<script>
import doxPage from "./index";
import DoxResultSection from "./components/DoxResultSection.vue";
import DoxPhotoZoomDialog from "./components/DoxPhotoZoomDialog.vue";
import DoxCreditHistoryDialog from "./components/DoxCreditHistoryDialog.vue";
import DoxUsageSummaryDialog from "./components/DoxUsageSummaryDialog.vue";

export default {
  ...doxPage,
  components: {
    DoxResultSection,
    DoxPhotoZoomDialog,
    DoxCreditHistoryDialog,
    DoxUsageSummaryDialog,
  },

  computed: {
    dniPhotoSrc() {
      if (!this.result || !this.result.data || !this.result.data.personal)
        return null;
      if (this.result.image && this.result.image.base64) {
        return (
          "data:" +
          (this.result.image.mimeType || "image/jpeg") +
          ";base64," +
          this.result.image.base64
        );
      }
      if (this.result.data.photo) {
        return (
          "data:" +
          (this.result.data.photoMimeType || "image/jpeg") +
          ";base64," +
          this.result.data.photo
        );
      }
      return null;
    },
  },

  methods: {
    ...doxPage.methods,

    onPhotoDrop(event) {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.onPhotoSelected(files[0]);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.photo-dropzone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    border-color: #1976d2;
    background: rgba(25, 118, 210, 0.04);
  }
}

.photo-preview-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

// Dark mode
.body--dark {
  .photo-dropzone {
    border-color: #555;

    &:hover {
      border-color: #1976d2;
      background: rgba(25, 118, 210, 0.1);
    }
  }
}
</style>
