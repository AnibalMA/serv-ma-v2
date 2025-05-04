<template>
  <q-page class="flex-center">
    <div class="col-12 q-pa-sm">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Boletas Pendientes</div>
          <div class="text-subtitle2">Agrupadas por usuario</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-tree
            :nodes="boletasPendientesTree"
            node-key="id"
            label-key="label"
            children-key="children"
            default-expand-all
          >
            <template v-slot:default-header="prop">
              <div class="row items-center">
                <div>
                  <q-icon
                    v-if="prop.node.icon"
                    :name="prop.node.icon"
                    size="28px"
                    class="q-mr-sm"
                    :color="prop.node.iconColor || 'primary'"
                  />
                  {{ prop.node.label }}
                  <q-badge
                    v-if="prop.node.count"
                    color="primary"
                    class="q-ml-sm"
                  >
                    {{ prop.node.count }}
                  </q-badge>
                </div>
                <q-space />
                <div
                  v-if="prop.node.actions"
                  class="col-xs-12 col-sm-4 col-md-12 row justify-end q-gutter-md"
                >
                  <q-btn
                    v-for="(action, index) in prop.node.actions"
                    :key="index"
                    :icon="action.icon"
                    :color="action.color"
                    dense
                    round
                    size="md"
                    class="q-ml-md"
                    @click.stop="action.handler(prop.node)"
                  >
                    <q-tooltip>{{ action.tooltip }}</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>
          </q-tree>
        </q-card-section>

        <q-card-section v-if="!boletasPendientesTree.length">
          <div class="full-width row flex-center text-cyan-8 q-gutter-sm">
            <span style="font-weight: bold; font-size: 15px">
              No existen boletas pendientes
            </span>
            <q-icon size="2em" name="sentiment_dissatisfied" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script src="./index.js" />
