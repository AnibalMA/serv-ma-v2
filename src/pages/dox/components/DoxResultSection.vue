<template>
  <div class="q-mt-lg" v-if="result || resultError">
    <q-separator class="q-mb-md" />

    <q-banner v-if="resultError" rounded class="bg-red-1 text-red-9 q-mb-md">
      <template v-slot:avatar>
        <q-icon name="error" color="red" />
      </template>
      {{ resultError }}
    </q-banner>

    <div v-if="result && result.ok">
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

      <q-card v-if="result.text" class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            <q-icon name="description" class="q-mr-xs" />
            Resultado
          </div>
          <pre class="result-text">{{ result.text }}</pre>
        </q-card-section>
      </q-card>

      <q-card v-if="result.data" class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            <q-icon name="table_chart" class="q-mr-xs" />
            Datos Extraídos
          </div>

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

          <template
            v-else-if="
              result.data.persons &&
              Array.isArray(result.data.persons) &&
              result.data.persons.length &&
              result.data.persons.some((p) => p.similarityPercent != null)
            "
          >
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
              :class="$q.dark.isActive ? 'text-caption text-grey-6 q-mb-md' : 'text-caption text-grey-7 q-mb-md'"
            >
              {{ result.data.description }}
            </div>

            <div class="row q-col-gutter-sm">
              <div
                v-for="(person, idx) in result.data.persons"
                :key="idx"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card bordered flat class="person-card">
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
                  >
                    #{{ person.ranking || idx + 1 }}
                  </q-badge>

                  <q-card-section horizontal class="person-card-body">
                    <q-card-section class="col-auto q-pa-sm">
                      <div
                        v-if="person.photo"
                        class="photo-zoom-wrapper"
                        @click="$emit('open-photo-zoom', person)"
                      >
                        <q-img
                          :src="
                            'data:' +
                            (person.photoMimeType || 'image/png') +
                            ';base64,' +
                            person.photo
                          "
                          :width="$q.screen.lt.sm ? '70px' : (person.photoWidth || 120) + 'px'"
                          style="border-radius: 8px; border: 2px solid #e0e0e0; cursor: pointer"
                          :ratio="person.photoWidth && person.photoHeight ? person.photoWidth / person.photoHeight : undefined"
                        />
                        <div class="photo-zoom-overlay">
                          <q-icon name="search" :size="$q.screen.lt.sm ? '18px' : '24px'" color="white" />
                        </div>
                      </div>
                      <q-avatar v-else :size="$q.screen.lt.sm ? '60px' : '100px'" color="grey-4" text-color="grey-7" icon="person" />
                    </q-card-section>

                    <q-card-section class="col q-pa-sm person-info">
                      <div class="text-weight-bold q-mb-xs person-name" :class="$q.screen.lt.sm ? 'text-caption' : 'text-subtitle2'" style="line-height: 1.3">
                        {{ person.fullName || "Sin nombre" }}
                      </div>
                      <div v-if="person.dni" class="q-mb-xs">
                        <q-icon name="badge" :size="$q.screen.lt.sm ? '13px' : '16px'" color="grey-7" class="q-mr-xs" />
                        <span :class="$q.screen.lt.sm ? 'text-caption' : 'text-body2'">DNI: <strong>{{ person.dni }}</strong></span>
                      </div>
                      <div v-if="person.age" class="q-mb-xs">
                        <q-icon name="cake" :size="$q.screen.lt.sm ? '13px' : '16px'" color="grey-7" class="q-mr-xs" />
                        <span :class="$q.screen.lt.sm ? 'text-caption' : 'text-body2'">{{ person.age }} años</span>
                      </div>
                      <div v-if="person.department" class="q-mb-xs">
                        <q-icon name="location_on" :size="$q.screen.lt.sm ? '13px' : '16px'" color="grey-7" class="q-mr-xs" />
                        <span :class="$q.screen.lt.sm ? 'text-caption' : 'text-body2'">{{ person.department }}</span>
                      </div>
                      <div v-if="person.similarityPercent != null" class="q-mt-xs">
                        <div class="row items-center q-mb-xs">
                          <q-icon name="compare" :size="$q.screen.lt.sm ? '13px' : '16px'" class="q-mr-xs" :color="person.similarityPercent >= 80 ? 'green' : person.similarityPercent >= 50 ? 'orange' : 'red'" />
                          <span :class="['text-caption text-weight-bold', person.similarityPercent >= 80 ? 'text-green' : person.similarityPercent >= 50 ? 'text-orange' : 'text-red']">{{ person.similarityPercent }}%</span>
                        </div>
                        <q-linear-progress :value="person.similarityPercent / 100" :color="person.similarityPercent >= 80 ? 'green' : person.similarityPercent >= 50 ? 'orange' : 'red'" rounded :size="$q.screen.lt.sm ? '5px' : '8px'" track-color="grey-3" />
                      </div>
                    </q-card-section>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </template>

          <template
            v-else-if="
              result.data.persons &&
              Array.isArray(result.data.persons) &&
              result.data.persons.length
            "
          >
            <div class="row q-col-gutter-sm q-mb-md items-center">
              <div class="col-auto">
                <q-chip icon="people" color="teal" text-color="white" dense>
                  {{ result.data.totalResults || result.data.persons.length }} resultado{{
                    (result.data.totalResults || result.data.persons.length) !== 1 ? "s" : ""
                  }}
                </q-chip>
              </div>
            </div>

            <div v-if="result.data.persons.length === 0" class="text-center q-pa-lg text-grey-6">
              <q-icon name="search_off" size="48px" class="q-mb-sm" />
              <div class="text-subtitle1">No se encontraron coincidencias</div>
            </div>

            <div class="row q-col-gutter-sm">
              <div v-for="(person, idx) in result.data.persons" :key="person.dni || idx" class="col-12 col-sm-6 col-md-4">
                <q-card bordered flat class="person-card">
                  <q-card-section horizontal class="person-card-body">
                    <q-card-section class="col-auto q-pa-sm">
                      <div v-if="person.photo" class="photo-zoom-wrapper" @click="$emit('open-photo-zoom', person)">
                        <q-img :src="'data:' + (person.photoMimeType || 'image/jpeg') + ';base64,' + person.photo" :width="$q.screen.lt.sm ? '70px' : '100px'" style="border-radius: 8px; border: 2px solid #e0e0e0; cursor: pointer" />
                        <div class="photo-zoom-overlay"><q-icon name="search" :size="$q.screen.lt.sm ? '18px' : '24px'" color="white" /></div>
                      </div>
                      <q-avatar v-else :size="$q.screen.lt.sm ? '60px' : '100px'" color="grey-4" text-color="grey-7" icon="person" />
                    </q-card-section>
                    <q-card-section class="col q-pa-sm person-info">
                      <div class="text-weight-bold q-mb-xs person-name" :class="$q.screen.lt.sm ? 'text-caption' : 'text-subtitle2'" style="line-height: 1.3">{{ person.fullName || "Sin nombre" }}</div>
                      <div v-if="person.dni" class="q-mb-xs">
                        <q-icon name="badge" :size="$q.screen.lt.sm ? '13px' : '16px'" color="grey-7" class="q-mr-xs" />
                        <span :class="$q.screen.lt.sm ? 'text-caption' : 'text-body2'">DNI: <strong>{{ person.dni }}</strong><span v-if="person.digitoVerificador" class="text-grey-6"> - {{ person.digitoVerificador }}</span></span>
                      </div>
                      <div v-if="person.edad" class="q-mb-xs">
                        <q-icon name="cake" :size="$q.screen.lt.sm ? '13px' : '16px'" color="grey-7" class="q-mr-xs" />
                        <span :class="$q.screen.lt.sm ? 'text-caption' : 'text-body2'">{{ person.edad }} años</span>
                      </div>
                    </q-card-section>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </template>

          <template v-else-if="result.data.personal && result.data.personal.dni">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-card bordered flat class="text-center" :class="$q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md'">
                  <div v-if="dniPhotoSrc" class="q-mb-sm photo-zoom-wrapper" style="display: inline-block" @click="$emit('open-photo-zoom', { photo: (result.image && result.image.base64) || result.data.photo, photoMimeType: (result.image && result.image.mimeType) || result.data.photoMimeType || 'image/jpeg', fullName: (result.data.personal.nombres || '') + ' ' + (result.data.personal.apellidos || '') })">
                    <img :src="dniPhotoSrc" :style="$q.screen.lt.sm ? 'width: 120px; border-radius: 10px; border: 2px solid #e0e0e0; cursor: pointer' : 'width: 200px; border-radius: 12px; border: 3px solid #e0e0e0; cursor: pointer'" />
                    <div class="photo-zoom-overlay"><q-icon name="search" size="24px" color="white" /></div>
                  </div>
                  <div v-else><q-avatar :size="$q.screen.lt.sm ? '80px' : '120px'" color="grey-4" text-color="grey-7" icon="person" /></div>
                  <div :class="$q.screen.lt.sm ? 'text-subtitle1' : 'text-h6'" class="text-weight-bold q-mt-sm">{{ result.data.personal.nombres || "" }}</div>
                  <div :class="$q.screen.lt.sm ? 'text-body2' : 'text-subtitle1'" class="text-grey-8">{{ result.data.personal.apellidos || "" }}</div>
                  <q-chip color="primary" text-color="white" icon="badge" class="q-mt-sm" :dense="$q.screen.lt.sm">DNI: {{ result.data.personal.dni }}{{ result.data.personal.digitoVerificador ? " - " + result.data.personal.digitoVerificador : "" }}</q-chip>
                  <div v-if="result.data.nacimiento && result.data.nacimiento.edad" class="q-mt-xs"><q-chip outline color="teal" icon="cake" dense>{{ result.data.nacimiento.edad }} años</q-chip></div>
                </q-card>
              </div>

              <div class="col-12 col-md-8">
                <q-card bordered flat class="q-mb-sm" v-if="Object.keys(result.data.personal).length">
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-weight-bold text-primary q-mb-xs"><q-icon name="person" class="q-mr-xs" /> Datos Personales</div>
                    <div class="row q-col-gutter-xs">
                      <div v-for="(val, key) in result.data.personal" :key="key" class="col-12 col-sm-6" v-show="key !== 'photo' && key !== 'photoMimeType'">
                        <div class="text-caption text-grey-7">{{ formatDniKey(key) }}</div>
                        <div class="text-body2 text-weight-medium">{{ val }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card bordered flat class="q-mb-sm" v-if="result.data.nacimiento && Object.keys(result.data.nacimiento).length">
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-weight-bold text-orange-8 q-mb-xs"><q-icon name="cake" class="q-mr-xs" /> Nacimiento</div>
                    <div class="row q-col-gutter-xs">
                      <div v-for="(val, key) in result.data.nacimiento" :key="key" class="col-12 col-sm-6">
                        <div class="text-caption text-grey-7">{{ formatDniKey(key) }}</div>
                        <div class="text-body2 text-weight-medium">{{ val }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card bordered flat class="q-mb-sm" v-if="result.data.documentacion && Object.keys(result.data.documentacion).length">
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-weight-bold text-purple-8 q-mb-xs"><q-icon name="description" class="q-mr-xs" /> Documentación</div>
                    <div class="row q-col-gutter-xs">
                      <div v-for="(val, key) in result.data.documentacion" :key="key" class="col-12 col-sm-6">
                        <div class="text-caption text-grey-7">{{ formatDniKey(key) }}</div>
                        <div class="text-body2 text-weight-medium">{{ val }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card bordered flat class="q-mb-sm" v-if="result.data.direccion && Object.keys(result.data.direccion).length">
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-weight-bold text-green-8 q-mb-xs"><q-icon name="home" class="q-mr-xs" /> Dirección</div>
                    <div class="row q-col-gutter-xs">
                      <div v-for="(val, key) in result.data.direccion" :key="key" class="col-12 col-sm-6">
                        <div class="text-caption text-grey-7">{{ formatDniKey(key) }}</div>
                        <div class="text-body2 text-weight-medium">{{ val }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card bordered flat class="q-mb-sm" v-if="result.data.ubicacion && Object.keys(result.data.ubicacion).length">
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-weight-bold text-blue-8 q-mb-xs"><q-icon name="location_on" class="q-mr-xs" /> Ubicación</div>
                    <div class="row q-col-gutter-xs">
                      <div v-for="(val, key) in result.data.ubicacion" :key="key" class="col-12 col-sm-6">
                        <div class="text-caption text-grey-7">{{ formatDniKey(key) }}</div>
                        <div class="text-body2 text-weight-medium">{{ val }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card bordered flat class="q-mb-sm" v-if="result.data.actas && Object.keys(result.data.actas).length">
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-weight-bold text-red-8 q-mb-xs"><q-icon name="article" class="q-mr-xs" /> Actas / Certificados</div>
                    <div class="row q-col-gutter-sm">
                      <div v-for="(val, key) in result.data.actas" :key="key" class="col-auto">
                        <q-chip outline :color="val > 0 ? 'teal' : 'grey'" dense>{{ formatDniKey(key) }}: {{ val }}</q-chip>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card bordered flat class="q-mb-sm" v-if="result.data.hijos != null">
                  <q-card-section class="q-py-sm row items-center">
                    <q-icon name="family_restroom" size="24px" color="indigo" class="q-mr-sm" />
                    <div class="text-subtitle2 text-weight-bold text-indigo">Hijos:</div>
                    <q-chip class="q-ml-sm" color="indigo" text-color="white" dense>{{ result.data.hijos }}</q-chip>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </template>

          <template v-else-if="typeof result.data === 'object' && !Array.isArray(result.data)">
            <q-list bordered separator>
              <q-item v-for="(val, key) in result.data" :key="key" dense>
                <q-item-section><q-item-label class="text-weight-bold">{{ key }}</q-item-label></q-item-section>
                <q-item-section side><q-item-label>{{ typeof val === 'object' ? JSON.stringify(val) : val }}</q-item-label></q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-card-section>
      </q-card>

      <q-card v-if="result.pdf" class="q-mb-md">
        <q-card-section :class="$q.screen.lt.sm ? 'column q-gutter-sm' : 'row items-center'">
          <div :class="$q.screen.lt.sm ? '' : ''" class="row items-center">
            <q-icon name="picture_as_pdf" :size="$q.screen.lt.sm ? '24px' : '32px'" color="red" class="q-mr-sm" />
            <div>
              <div :class="$q.screen.lt.sm ? 'text-body2 text-weight-bold' : 'text-subtitle1 text-weight-bold'">Documento PDF</div>
              <div class="text-caption text-grey ellipsis" style="max-width: 200px">{{ result.pdf.fileName }}</div>
            </div>
          </div>
          <q-space v-if="!$q.screen.lt.sm" />
          <q-btn color="red" icon="download" :label="$q.screen.lt.sm ? 'Descargar' : 'Descargar PDF'" :size="$q.screen.lt.sm ? 'sm' : 'md'" :class="$q.screen.lt.sm ? 'full-width' : ''" @click="$emit('download-pdf')" />
        </q-card-section>
      </q-card>

      <q-card v-if="result.image && !(result.data && result.data.personal && result.data.personal.dni)" class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm"><q-icon name="image" class="q-mr-xs" /> Imagen</div>
          <q-img :src="'data:' + result.image.mimeType + ';base64,' + result.image.base64" :style="$q.screen.lt.sm ? 'max-width: 100%; border-radius: 8px' : 'max-width: 500px; border-radius: 8px'" class="shadow-2" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    result: Object,
    resultError: String,
    dniPhotoSrc: String,
  },
  emits: ["open-photo-zoom", "download-pdf"],
  methods: {
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
    formatDniKey(key) {
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },
  },
};
</script>

<style lang="scss" scoped>
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

.body--dark {
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
