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
    </div>

    <!-- Resultado -->
    <div class="q-mt-lg" v-if="result || resultError">
      <q-separator class="q-mb-md" />

      <!-- Error -->
      <q-banner v-if="resultError" rounded class="bg-red-1 text-red-9 q-mb-md">
        <template v-slot:avatar>
          <q-icon name="error" color="red" />
        </template>
        {{ resultError }}
      </q-banner>

      <!-- Resultado exitoso -->
      <div v-if="result && result.ok">
        <!-- Créditos consumidos -->
        <q-banner
          v-if="result.credits"
          rounded
          class="bg-blue-1 text-blue-9 q-mb-md"
          dense
        >
          <template v-slot:avatar>
            <q-icon name="toll" color="blue" />
          </template>
          Créditos: {{ result.credits.balanceBefore }} →
          {{ result.credits.balanceAfter }} (costo: {{ result.credits.cost }})
        </q-banner>

        <!-- Texto plano -->
        <q-card v-if="result.text" class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              <q-icon name="description" class="q-mr-xs" />
              Resultado
            </div>
            <pre class="result-text">{{ result.text }}</pre>
          </q-card-section>
        </q-card>

        <!-- Datos parseados (tabla) -->
        <q-card v-if="result.data" class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              <q-icon name="table_chart" class="q-mr-xs" />
              Datos Extraídos
            </div>

            <!-- Si data es un array de objetos, mostrar como tabla -->
            <template v-if="Array.isArray(result.data) && result.data.length">
              <q-table
                :rows="result.data"
                :columns="getDataColumns(result.data)"
                row-key="__index"
                flat
                bordered
                dense
                :pagination="{ rowsPerPage: 10 }"
              />
            </template>

            <!-- RFN: resultado con personas y fotos (requiere similarityPercent) -->
            <template
              v-else-if="
                result.data.persons &&
                Array.isArray(result.data.persons) &&
                result.data.persons.length &&
                result.data.persons.some((p) => p.similarityPercent != null)
              "
            >
              <!-- Header info -->
              <div class="row q-col-gutter-sm q-mb-md">
                <div
                  class="col-12 col-sm-6 col-md-3"
                  v-if="result.data.documentType"
                >
                  <q-chip icon="badge" color="primary" text-color="white" dense>
                    {{ result.data.documentType }}
                  </q-chip>
                </div>
                <div
                  class="col-12 col-sm-6 col-md-3"
                  v-if="result.data.totalResults"
                >
                  <q-chip icon="people" color="teal" text-color="white" dense>
                    {{ result.data.totalResults }} resultado{{
                      result.data.totalResults !== 1 ? "s" : ""
                    }}
                  </q-chip>
                </div>
                <div
                  class="col-12 col-sm-6 col-md-3"
                  v-if="result.data.timestamp"
                >
                  <q-chip
                    icon="schedule"
                    color="grey-7"
                    text-color="white"
                    dense
                  >
                    {{ result.data.timestamp }}
                  </q-chip>
                </div>
              </div>
              <div
                v-if="result.data.description"
                class="text-caption text-grey-7 q-mb-md"
              >
                {{ result.data.description }}
              </div>

              <!-- Person cards grid -->
              <div class="row q-col-gutter-sm">
                <div
                  v-for="(person, idx) in result.data.persons"
                  :key="idx"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-card bordered flat class="person-card">
                    <!-- Ranking badge -->
                    <q-badge
                      floating
                      rounded
                      :color="
                        idx === 0
                          ? 'amber-8'
                          : idx === 1
                          ? 'blue-grey-5'
                          : 'brown-5'
                      "
                      text-color="white"
                      class="text-weight-bold"
                      :style="
                        $q.screen.lt.sm
                          ? 'font-size: 11px; padding: 3px 7px; z-index: 2'
                          : 'font-size: 14px; padding: 6px 10px; z-index: 2'
                      "
                    >
                      #{{ person.ranking || idx + 1 }}
                    </q-badge>

                    <q-card-section horizontal class="person-card-body">
                      <!-- Photo -->
                      <q-card-section class="col-auto q-pa-sm">
                        <div
                          v-if="person.photo"
                          class="photo-zoom-wrapper"
                          @click="openPhotoZoom(person)"
                        >
                          <q-img
                            :src="
                              'data:' +
                              (person.photoMimeType || 'image/png') +
                              ';base64,' +
                              person.photo
                            "
                            :width="
                              $q.screen.lt.sm
                                ? '70px'
                                : (person.photoWidth || 120) + 'px'
                            "
                            style="
                              border-radius: 8px;
                              border: 2px solid #e0e0e0;
                              cursor: pointer;
                            "
                            :ratio="
                              person.photoWidth && person.photoHeight
                                ? person.photoWidth / person.photoHeight
                                : undefined
                            "
                          />
                          <div class="photo-zoom-overlay">
                            <q-icon
                              name="search"
                              :size="$q.screen.lt.sm ? '18px' : '24px'"
                              color="white"
                            />
                          </div>
                        </div>
                        <q-avatar
                          v-else
                          :size="$q.screen.lt.sm ? '60px' : '100px'"
                          color="grey-4"
                          text-color="grey-7"
                          icon="person"
                        />
                      </q-card-section>

                      <!-- Person info -->
                      <q-card-section class="col q-pa-sm person-info">
                        <div
                          class="text-weight-bold q-mb-xs person-name"
                          :class="
                            $q.screen.lt.sm ? 'text-caption' : 'text-subtitle2'
                          "
                          style="line-height: 1.3"
                        >
                          {{ person.fullName || "Sin nombre" }}
                        </div>

                        <div v-if="person.dni" class="q-mb-xs">
                          <q-icon
                            name="badge"
                            :size="$q.screen.lt.sm ? '13px' : '16px'"
                            color="grey-7"
                            class="q-mr-xs"
                          />
                          <span
                            :class="
                              $q.screen.lt.sm ? 'text-caption' : 'text-body2'
                            "
                            >DNI: <strong>{{ person.dni }}</strong></span
                          >
                        </div>

                        <div v-if="person.age" class="q-mb-xs">
                          <q-icon
                            name="cake"
                            :size="$q.screen.lt.sm ? '13px' : '16px'"
                            color="grey-7"
                            class="q-mr-xs"
                          />
                          <span
                            :class="
                              $q.screen.lt.sm ? 'text-caption' : 'text-body2'
                            "
                            >{{ person.age }} años</span
                          >
                        </div>

                        <div v-if="person.department" class="q-mb-xs">
                          <q-icon
                            name="location_on"
                            :size="$q.screen.lt.sm ? '13px' : '16px'"
                            color="grey-7"
                            class="q-mr-xs"
                          />
                          <span
                            :class="
                              $q.screen.lt.sm ? 'text-caption' : 'text-body2'
                            "
                            >{{ person.department }}</span
                          >
                        </div>

                        <!-- Similarity bar -->
                        <div
                          v-if="person.similarityPercent != null"
                          class="q-mt-xs"
                        >
                          <div class="row items-center q-mb-xs">
                            <q-icon
                              name="compare"
                              :size="$q.screen.lt.sm ? '13px' : '16px'"
                              class="q-mr-xs"
                              :color="
                                person.similarityPercent >= 80
                                  ? 'green'
                                  : person.similarityPercent >= 50
                                  ? 'orange'
                                  : 'red'
                              "
                            />
                            <span
                              :class="[
                                'text-caption text-weight-bold',
                                person.similarityPercent >= 80
                                  ? 'text-green'
                                  : person.similarityPercent >= 50
                                  ? 'text-orange'
                                  : 'text-red',
                              ]"
                            >
                              {{ person.similarityPercent }}%
                            </span>
                          </div>
                          <q-linear-progress
                            :value="person.similarityPercent / 100"
                            :color="
                              person.similarityPercent >= 80
                                ? 'green'
                                : person.similarityPercent >= 50
                                ? 'orange'
                                : 'red'
                            "
                            rounded
                            :size="$q.screen.lt.sm ? '5px' : '8px'"
                            track-color="grey-3"
                          />
                        </div>
                      </q-card-section>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </template>

            <!-- NM: Búsqueda por nombres - resultado con lista de personas -->
            <template
              v-else-if="
                result.data.persons &&
                Array.isArray(result.data.persons) &&
                result.data.persons.length
              "
            >
              <!-- Header info -->
              <div class="row q-col-gutter-sm q-mb-md items-center">
                <div class="col-auto">
                  <q-chip icon="people" color="teal" text-color="white" dense>
                    {{ result.data.totalResults || result.data.persons.length }}
                    resultado{{
                      (result.data.totalResults ||
                        result.data.persons.length) !== 1
                        ? "s"
                        : ""
                    }}
                  </q-chip>
                </div>
              </div>

              <!-- Sin resultados -->
              <div
                v-if="result.data.persons.length === 0"
                class="text-center q-pa-lg text-grey-6"
              >
                <q-icon name="search_off" size="48px" class="q-mb-sm" />
                <div class="text-subtitle1">
                  No se encontraron coincidencias
                </div>
              </div>

              <!-- Person cards grid -->
              <div class="row q-col-gutter-sm">
                <div
                  v-for="(person, idx) in result.data.persons"
                  :key="person.dni || idx"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-card bordered flat class="person-card">
                    <q-card-section horizontal class="person-card-body">
                      <!-- Photo area -->
                      <q-card-section class="col-auto q-pa-sm">
                        <!-- Foto disponible -->
                        <div
                          v-if="person.photo"
                          class="photo-zoom-wrapper"
                          @click="openPhotoZoom(person)"
                        >
                          <q-img
                            :src="
                              'data:' +
                              (person.photoMimeType || 'image/jpeg') +
                              ';base64,' +
                              person.photo
                            "
                            :width="$q.screen.lt.sm ? '70px' : '100px'"
                            style="
                              border-radius: 8px;
                              border: 2px solid #e0e0e0;
                              cursor: pointer;
                            "
                          />
                          <div class="photo-zoom-overlay">
                            <q-icon
                              name="search"
                              :size="$q.screen.lt.sm ? '18px' : '24px'"
                              color="white"
                            />
                          </div>
                        </div>
                        <!-- Sin foto -->
                        <q-avatar
                          v-else
                          :size="$q.screen.lt.sm ? '60px' : '100px'"
                          color="grey-4"
                          text-color="grey-7"
                          icon="person"
                        />
                      </q-card-section>

                      <!-- Person info -->
                      <q-card-section class="col q-pa-sm person-info">
                        <div
                          class="text-weight-bold q-mb-xs person-name"
                          :class="
                            $q.screen.lt.sm ? 'text-caption' : 'text-subtitle2'
                          "
                          style="line-height: 1.3"
                        >
                          {{ person.fullName || "Sin nombre" }}
                        </div>

                        <div v-if="person.dni" class="q-mb-xs">
                          <q-icon
                            name="badge"
                            :size="$q.screen.lt.sm ? '13px' : '16px'"
                            color="grey-7"
                            class="q-mr-xs"
                          />
                          <span
                            :class="
                              $q.screen.lt.sm ? 'text-caption' : 'text-body2'
                            "
                          >
                            DNI:
                            <strong>{{ person.dni }}</strong>
                            <span
                              v-if="person.digitoVerificador"
                              class="text-grey-6"
                            >
                              - {{ person.digitoVerificador }}
                            </span>
                          </span>
                        </div>

                        <div v-if="person.edad" class="q-mb-xs">
                          <q-icon
                            name="cake"
                            :size="$q.screen.lt.sm ? '13px' : '16px'"
                            color="grey-7"
                            class="q-mr-xs"
                          />
                          <span
                            :class="
                              $q.screen.lt.sm ? 'text-caption' : 'text-body2'
                            "
                            >{{ person.edad }} años</span
                          >
                        </div>
                      </q-card-section>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </template>

            <!-- DNI: resultado con datos personales estructurados -->
            <template
              v-else-if="result.data.personal && result.data.personal.dni"
            >
              <div class="row q-col-gutter-sm">
                <!-- Foto + datos principales -->
                <div class="col-12 col-md-4">
                  <q-card
                    bordered
                    flat
                    class="text-center"
                    :class="$q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md'"
                  >
                    <div
                      v-if="dniPhotoSrc"
                      class="q-mb-sm photo-zoom-wrapper"
                      style="display: inline-block"
                      @click="
                        openPhotoZoom({
                          photo:
                            (result.image && result.image.base64) ||
                            result.data.photo,
                          photoMimeType:
                            (result.image && result.image.mimeType) ||
                            result.data.photoMimeType ||
                            'image/jpeg',
                          fullName:
                            (result.data.personal.nombres || '') +
                            ' ' +
                            (result.data.personal.apellidos || ''),
                        })
                      "
                    >
                      <img
                        :src="dniPhotoSrc"
                        :style="
                          $q.screen.lt.sm
                            ? 'width: 120px; border-radius: 10px; border: 2px solid #e0e0e0; cursor: pointer;'
                            : 'width: 200px; border-radius: 12px; border: 3px solid #e0e0e0; cursor: pointer;'
                        "
                      />
                      <div class="photo-zoom-overlay">
                        <q-icon name="search" size="24px" color="white" />
                      </div>
                    </div>
                    <div v-else>
                      <q-avatar
                        :size="$q.screen.lt.sm ? '80px' : '120px'"
                        color="grey-4"
                        text-color="grey-7"
                        icon="person"
                      />
                    </div>

                    <div
                      :class="$q.screen.lt.sm ? 'text-subtitle1' : 'text-h6'"
                      class="text-weight-bold q-mt-sm"
                    >
                      {{ result.data.personal.nombres || "" }}
                    </div>
                    <div
                      :class="$q.screen.lt.sm ? 'text-body2' : 'text-subtitle1'"
                      class="text-grey-8"
                    >
                      {{ result.data.personal.apellidos || "" }}
                    </div>
                    <q-chip
                      color="primary"
                      text-color="white"
                      icon="badge"
                      class="q-mt-sm"
                      :dense="$q.screen.lt.sm"
                    >
                      DNI: {{ result.data.personal.dni
                      }}{{
                        result.data.personal.digitoVerificador
                          ? " - " + result.data.personal.digitoVerificador
                          : ""
                      }}
                    </q-chip>
                    <div
                      v-if="
                        result.data.nacimiento && result.data.nacimiento.edad
                      "
                      class="q-mt-xs"
                    >
                      <q-chip outline color="teal" icon="cake" dense>
                        {{ result.data.nacimiento.edad }} años
                      </q-chip>
                    </div>
                  </q-card>
                </div>

                <!-- Secciones de datos -->
                <div class="col-12 col-md-8">
                  <!-- Datos Personales -->
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm"
                    v-if="Object.keys(result.data.personal).length"
                  >
                    <q-card-section class="q-py-sm">
                      <div
                        class="text-subtitle2 text-weight-bold text-primary q-mb-xs"
                      >
                        <q-icon name="person" class="q-mr-xs" /> Datos
                        Personales
                      </div>
                      <div class="row q-col-gutter-xs">
                        <div
                          v-for="(val, key) in result.data.personal"
                          :key="key"
                          class="col-12 col-sm-6"
                          v-show="key !== 'photo' && key !== 'photoMimeType'"
                        >
                          <div class="text-caption text-grey-7">
                            {{ formatDniKey(key) }}
                          </div>
                          <div class="text-body2 text-weight-medium">
                            {{ val }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Nacimiento -->
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm"
                    v-if="
                      result.data.nacimiento &&
                      Object.keys(result.data.nacimiento).length
                    "
                  >
                    <q-card-section class="q-py-sm">
                      <div
                        class="text-subtitle2 text-weight-bold text-orange-8 q-mb-xs"
                      >
                        <q-icon name="cake" class="q-mr-xs" /> Nacimiento
                      </div>
                      <div class="row q-col-gutter-xs">
                        <div
                          v-for="(val, key) in result.data.nacimiento"
                          :key="key"
                          class="col-12 col-sm-6"
                        >
                          <div class="text-caption text-grey-7">
                            {{ formatDniKey(key) }}
                          </div>
                          <div class="text-body2 text-weight-medium">
                            {{ val }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Documentación -->
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm"
                    v-if="
                      result.data.documentacion &&
                      Object.keys(result.data.documentacion).length
                    "
                  >
                    <q-card-section class="q-py-sm">
                      <div
                        class="text-subtitle2 text-weight-bold text-purple-8 q-mb-xs"
                      >
                        <q-icon name="description" class="q-mr-xs" />
                        Documentación
                      </div>
                      <div class="row q-col-gutter-xs">
                        <div
                          v-for="(val, key) in result.data.documentacion"
                          :key="key"
                          class="col-12 col-sm-6"
                        >
                          <div class="text-caption text-grey-7">
                            {{ formatDniKey(key) }}
                          </div>
                          <div class="text-body2 text-weight-medium">
                            {{ val }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Dirección -->
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm"
                    v-if="
                      result.data.direccion &&
                      Object.keys(result.data.direccion).length
                    "
                  >
                    <q-card-section class="q-py-sm">
                      <div
                        class="text-subtitle2 text-weight-bold text-green-8 q-mb-xs"
                      >
                        <q-icon name="home" class="q-mr-xs" /> Dirección
                      </div>
                      <div class="row q-col-gutter-xs">
                        <div
                          v-for="(val, key) in result.data.direccion"
                          :key="key"
                          class="col-12 col-sm-6"
                        >
                          <div class="text-caption text-grey-7">
                            {{ formatDniKey(key) }}
                          </div>
                          <div class="text-body2 text-weight-medium">
                            {{ val }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Ubicación -->
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm"
                    v-if="
                      result.data.ubicacion &&
                      Object.keys(result.data.ubicacion).length
                    "
                  >
                    <q-card-section class="q-py-sm">
                      <div
                        class="text-subtitle2 text-weight-bold text-blue-8 q-mb-xs"
                      >
                        <q-icon name="location_on" class="q-mr-xs" /> Ubicación
                      </div>
                      <div class="row q-col-gutter-xs">
                        <div
                          v-for="(val, key) in result.data.ubicacion"
                          :key="key"
                          class="col-12 col-sm-6"
                        >
                          <div class="text-caption text-grey-7">
                            {{ formatDniKey(key) }}
                          </div>
                          <div class="text-body2 text-weight-medium">
                            {{ val }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Actas / Certificados -->
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm"
                    v-if="
                      result.data.actas && Object.keys(result.data.actas).length
                    "
                  >
                    <q-card-section class="q-py-sm">
                      <div
                        class="text-subtitle2 text-weight-bold text-red-8 q-mb-xs"
                      >
                        <q-icon name="article" class="q-mr-xs" /> Actas /
                        Certificados
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div
                          v-for="(val, key) in result.data.actas"
                          :key="key"
                          class="col-auto"
                        >
                          <q-chip
                            outline
                            :color="val > 0 ? 'teal' : 'grey'"
                            dense
                          >
                            {{ formatDniKey(key) }}: {{ val }}
                          </q-chip>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Hijos -->
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm"
                    v-if="result.data.hijos != null"
                  >
                    <q-card-section class="q-py-sm row items-center">
                      <q-icon
                        name="family_restroom"
                        size="24px"
                        color="indigo"
                        class="q-mr-sm"
                      />
                      <div class="text-subtitle2 text-weight-bold text-indigo">
                        Hijos:
                      </div>
                      <q-chip
                        class="q-ml-sm"
                        color="indigo"
                        text-color="white"
                        dense
                      >
                        {{ result.data.hijos }}
                      </q-chip>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </template>

            <!-- Si es un objeto genérico, mostrar key-value (excluyendo arrays/objetos complejos) -->
            <template
              v-else-if="
                typeof result.data === 'object' && !Array.isArray(result.data)
              "
            >
              <q-list bordered separator>
                <q-item v-for="(val, key) in result.data" :key="key" dense>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{
                      key
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{
                      typeof val === "object" ? JSON.stringify(val) : val
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-card-section>
        </q-card>

        <!-- PDF descargable -->
        <q-card v-if="result.pdf" class="q-mb-md">
          <q-card-section
            :class="$q.screen.lt.sm ? 'column q-gutter-sm' : 'row items-center'"
          >
            <div :class="$q.screen.lt.sm ? '' : ''" class="row items-center">
              <q-icon
                name="picture_as_pdf"
                :size="$q.screen.lt.sm ? '24px' : '32px'"
                color="red"
                class="q-mr-sm"
              />
              <div>
                <div
                  :class="
                    $q.screen.lt.sm
                      ? 'text-body2 text-weight-bold'
                      : 'text-subtitle1 text-weight-bold'
                  "
                >
                  Documento PDF
                </div>
                <div
                  class="text-caption text-grey ellipsis"
                  style="max-width: 200px"
                >
                  {{ result.pdf.fileName }}
                </div>
              </div>
            </div>
            <q-space v-if="!$q.screen.lt.sm" />
            <q-btn
              color="red"
              icon="download"
              :label="$q.screen.lt.sm ? 'Descargar' : 'Descargar PDF'"
              :size="$q.screen.lt.sm ? 'sm' : 'md'"
              :class="$q.screen.lt.sm ? 'full-width' : ''"
              @click="downloadPdf"
            />
          </q-card-section>
        </q-card>

        <!-- Imagen resultado (no mostrar si es DNI, ya se muestra en su card) -->
        <q-card
          v-if="
            result.image &&
            !(result.data && result.data.personal && result.data.personal.dni)
          "
          class="q-mb-md"
        >
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              <q-icon name="image" class="q-mr-xs" />
              Imagen
            </div>
            <q-img
              :src="
                'data:' +
                result.image.mimeType +
                ';base64,' +
                result.image.base64
              "
              :style="
                $q.screen.lt.sm
                  ? 'max-width: 100%; border-radius: 8px'
                  : 'max-width: 500px; border-radius: 8px'
              "
              class="shadow-2"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog: Zoom de Foto -->
    <q-dialog v-model="showPhotoZoom">
      <q-card style="min-width: 320px; max-width: 90vw">
        <q-toolbar class="bg-grey-9 text-white">
          <q-icon name="person" class="q-mr-sm" />
          <q-toolbar-title class="text-body1">
            {{ zoomedPerson ? zoomedPerson.fullName : "Foto" }}
          </q-toolbar-title>
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="flex flex-center q-pa-md" v-if="zoomedPerson">
          <q-img
            :src="
              'data:' +
              (zoomedPerson.photoMimeType || 'image/png') +
              ';base64,' +
              zoomedPerson.photo
            "
            style="max-width: 100%; max-height: 70vh; border-radius: 8px"
            fit="contain"
          />
        </q-card-section>
        <q-card-section v-if="zoomedPerson" class="q-pt-none">
          <div class="row q-col-gutter-sm items-center justify-center">
            <div v-if="zoomedPerson.dni">
              <q-chip icon="badge" dense>DNI: {{ zoomedPerson.dni }}</q-chip>
            </div>
            <div v-if="zoomedPerson.age">
              <q-chip icon="cake" dense>{{ zoomedPerson.age }} años</q-chip>
            </div>
            <div v-if="zoomedPerson.department">
              <q-chip icon="location_on" dense>{{
                zoomedPerson.department
              }}</q-chip>
            </div>
            <div v-if="zoomedPerson.similarityPercent != null">
              <q-chip
                :icon="'compare'"
                :color="
                  zoomedPerson.similarityPercent >= 80
                    ? 'green'
                    : zoomedPerson.similarityPercent >= 50
                    ? 'orange'
                    : 'red'
                "
                text-color="white"
                dense
              >
                {{ zoomedPerson.similarityPercent }}% similitud
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog: Historial de Créditos -->
    <q-dialog v-model="showHistory" maximized>
      <q-card>
        <q-toolbar class="bg-primary text-white">
          <q-icon name="history" class="q-mr-sm" />
          <q-toolbar-title>Historial de Créditos</q-toolbar-title>
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <q-table
            :rows="creditHistory"
            :columns="[
              {
                name: 'date',
                label: 'Fecha',
                field: 'date',
                sortable: true,
              },
              {
                name: 'type',
                label: 'Tipo',
                field: 'type',
                sortable: true,
              },
              {
                name: 'command',
                label: 'Comando',
                field: 'commandLabel',
                sortable: true,
              },
              {
                name: 'amount',
                label: 'Monto',
                field: 'amount',
                sortable: true,
              },
              {
                name: 'balanceAfter',
                label: 'Saldo',
                field: 'balanceAfter',
                sortable: true,
              },
            ]"
            row-key="id"
            flat
            bordered
            :loading="loadingHistory"
            :pagination="{ rowsPerPage: 15 }"
          >
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <q-badge
                  :color="props.value === 'credit' ? 'green' : 'red'"
                  :label="props.value === 'credit' ? 'Recarga' : 'Uso'"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-amount="props">
              <q-td :props="props">
                <span
                  :class="
                    props.value > 0
                      ? 'text-green text-weight-bold'
                      : 'text-red text-weight-bold'
                  "
                >
                  {{ props.value > 0 ? "+" : "" }}{{ props.value }}
                </span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog: Resumen de Uso -->
    <q-dialog v-model="showSummary">
      <q-card
        :style="
          $q.screen.lt.sm
            ? 'min-width: 280px; max-width: 95vw'
            : 'min-width: 400px'
        "
      >
        <q-toolbar class="bg-primary text-white">
          <q-icon name="bar_chart" class="q-mr-sm" />
          <q-toolbar-title>Resumen de Uso</q-toolbar-title>
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <q-list bordered separator :loading="loadingSummary">
            <q-item v-for="item in usageSummary" :key="item.command">
              <q-item-section avatar>
                <q-icon name="terminal" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{
                  item.commandLabel
                }}</q-item-label>
                <q-item-label caption>
                  {{ item.useCount }} uso(s) — {{ item.totalSpent }} créditos
                  gastados
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="!usageSummary.length && !loadingSummary">
              <q-item-section class="text-grey text-center">
                Sin registros de uso
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import doxPage from "./index";
export default {
  ...doxPage,

  computed: {
    /**
     * Genera el src de la foto DNI desde result.image o result.data.photo
     */
    dniPhotoSrc() {
      if (!this.result || !this.result.data || !this.result.data.personal)
        return null;
      // Prioridad 1: result.image (viene del controller)
      if (this.result.image && this.result.image.base64) {
        return (
          "data:" +
          (this.result.image.mimeType || "image/jpeg") +
          ";base64," +
          this.result.image.base64
        );
      }
      // Prioridad 2: result.data.photo (viene del parser dentro de data)
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

    /**
     * Genera columnas dinámicas para q-table a partir del primer objeto del array
     */
    getDataColumns(dataArray) {
      if (!dataArray || !dataArray.length) return [];
      const firstRow = dataArray[0];
      return Object.keys(firstRow).map((key) => ({
        name: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        field: key,
        sortable: true,
        align: "left",
      }));
    },

    /**
     * Maneja drop de foto por drag & drop
     */
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

.result-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "Courier New", monospace;
  font-size: 13px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  max-height: 400px;
  overflow-y: auto;
}

.person-card {
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: visible;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

// Mobile: cards más compactas
@media (max-width: 599px) {
  .person-card {
    .person-card-body {
      min-height: auto;
    }

    .person-info {
      padding: 4px 8px !important;
    }

    .person-name {
      font-size: 12px;
      line-height: 1.2;
    }
  }

  .result-text {
    font-size: 11px;
    padding: 8px;
    max-height: 300px;
  }
}

.photo-zoom-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;

  .photo-zoom-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .photo-zoom-overlay {
    opacity: 1;
  }
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

  .result-text {
    background: #1e1e1e;
    color: #ddd;
  }

  .person-card {
    &:hover {
      box-shadow: 0 4px 16px rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
