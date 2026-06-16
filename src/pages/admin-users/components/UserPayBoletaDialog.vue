<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card dialog-card--md">
      <q-card-section class="bg-green-8 text-white">
        <div class="text-h6">
          <q-icon name="payments" class="q-mr-sm" />
          Registrar pago — {{ selectedUser?.nom_usuario }}
          {{ selectedUser?.ape_usuario }}
        </div>
        <div class="text-caption q-mt-xs">Cobrador recaudó del usuario</div>
      </q-card-section>

      <q-tabs
        v-model="modoPayBoleta"
        dense
        active-color="green-8"
        indicator-color="green-8"
        align="justify"
        :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-7'"
        @update:model-value="
          () => {
            payBoletaForm.idBoleta = [];
            payBoletaForm.idDetalle = [];
            payBoletaForm.bAll = false;
            payBoletaForm.montoCancelado = 0;
          }
        "
      >
        <q-tab name="boletas" icon="receipt_long" label="Por boleta" />
        <q-tab name="items" icon="list" label="Por servicio" />
      </q-tabs>

      <q-separator />

      <q-card-section>
        <div v-if="loadingPayBoletas" class="flex flex-center q-py-lg">
          <q-spinner-dots size="40px" color="primary" />
        </div>

        <template v-else>
          <template v-if="modoPayBoleta === 'boletas'">
            <div v-if="userPayBoletas.length" class="q-mb-md">
              <div :class="$q.dark.isActive ? 'text-caption text-grey-6 q-mb-xs' : 'text-caption text-grey-7 q-mb-xs'">
                Boletas pendientes
              </div>
              <q-list bordered separator dense>
                <q-item
                  v-for="b in userPayBoletas"
                  :key="b.id"
                  tag="label"
                  clickable
                >
                  <q-item-section side>
                    <q-checkbox
                      v-model="payBoletaForm.idBoleta"
                      :val="b.id"
                      :disable="payBoletaForm.bAll"
                      color="green-8"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{
                      b.cod_boleta || `#${b.id}`
                    }}</q-item-label>
                    <q-item-label caption>
                      Saldo: S/.
                      {{
                        Number(
                          (b.monto_facturado || 0) - (b.monto_cancelado || 0)
                        ).toFixed(2)
                      }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge
                      color="orange"
                      :label="`S/. ${Number(b.monto_facturado || 0).toFixed(
                        2
                      )}`"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <q-checkbox
                v-model="payBoletaForm.bAll"
                label="Pagar todas las pendientes"
                class="q-mt-sm"
                color="green-8"
                @update:model-value="
                  (v) => {
                    if (v) payBoletaForm.idBoleta = [];
                  }
                "
              />
            </div>

            <div v-else class="text-center q-py-sm text-grey-6 q-mb-md">
              <q-icon name="check_circle" size="2rem" color="green" />
              <div class="q-mt-xs">No hay boletas pendientes</div>
            </div>

            <q-input
              v-model.number="payBoletaForm.montoCancelado"
              label="Monto a cancelar (S/.)"
              outlined
              dense
              type="number"
              min="0.01"
              step="0.01"
              :rules="[(v) => v > 0 || 'Ingrese un monto mayor a 0']"
            />
          </template>

          <template v-else>
            <div v-if="userPayBoletas.length">
              <div :class="$q.dark.isActive ? 'text-caption text-grey-6 q-mb-sm' : 'text-caption text-grey-7 q-mb-sm'">
                Selecciona los servicios a marcar como pagados
              </div>

              <div v-for="b in userPayBoletas" :key="b.id" class="q-mb-sm">
                <div
                  class="row items-center q-px-sm q-py-xs rounded-borders bg-grey-2"
                >
                  <q-checkbox
                    :model-value="areAllDetallesSelected(b)"
                    :indeterminate="areSomeDetallesSelected(b)"
                    color="green-8"
                    dense
                    @update:model-value="(v) => toggleBoletaDetalles(b, v)"
                  />
                  <span class="text-weight-medium text-body2 q-ml-sm">
                    {{ b.cod_boleta || `#${b.id}` }}
                  </span>
                  <q-space />
                  <q-badge
                    color="orange"
                    :label="`Saldo: S/. ${Number(
                      (b.monto_facturado || 0) - (b.monto_cancelado || 0)
                    ).toFixed(2)}`"
                  />
                </div>

                <q-list
                  v-if="b.detalles && b.detalles.length"
                  dense
                  bordered
                  separator
                  class="q-mt-xs"
                >
                  <q-item
                    v-for="d in b.detalles"
                    :key="d.id"
                    tag="label"
                    clickable
                    dense
                  >
                    <q-item-section side>
                      <q-checkbox
                        v-model="payBoletaForm.idDetalle"
                        :val="d.id"
                        color="green-8"
                        dense
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ d.desc_perfil || "Servicio" }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <template
                        v-if="
                          b.descuentos &&
                          b.descuentos.length &&
                          b.detalles.length === 1
                        "
                      >
                        <div class="column items-end q-gutter-y-none">
                          <span
                            class="text-caption text-grey-5"
                            style="text-decoration: line-through"
                          >
                            S/. {{ Number(d.monto_servicio || 0).toFixed(2) }}
                          </span>
                          <q-badge
                            color="green-8"
                            :label="`S/. ${(
                              Number(b.monto_facturado || 0) -
                              Number(b.monto_cancelado || 0)
                            ).toFixed(2)}`"
                          />
                          <span class="text-caption text-blue-grey-5"
                            >desc. incluido</span
                          >
                        </div>
                      </template>
                      <template v-else>
                        <q-badge
                          color="green-8"
                          :label="`S/. ${Number(
                            d.monto_servicio || 0
                          ).toFixed(2)}`"
                        />
                      </template>
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-for="d in b.descuentos"
                    :key="`desc-${d.id}`"
                    dense
                    disable
                  >
                    <q-item-section side>
                      <q-icon name="sell" color="blue-grey-5" size="xs" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-blue-grey-6 text-caption">
                        {{ d.notas || "Descuento" }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <span class="text-caption text-blue-grey-6">
                        S/. {{ Number(d.monto_servicio || 0).toFixed(2) }}
                      </span>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-caption text-grey-6 q-pl-xl q-mt-xs">
                  Sin servicios pendientes
                </div>
              </div>

              <div class="row justify-end items-center q-mt-sm q-gutter-x-sm">
                <span
                  v-if="montoDescuentoAplicado !== '0.00'"
                  class="text-caption text-blue-grey-6"
                >
                  (incl. descuento S/. {{ montoDescuentoAplicado }})
                </span>
                <span class="text-subtitle2 text-weight-bold text-green-8">
                  Total a pagar: S/. {{ montoSeleccionado }}
                </span>
              </div>
            </div>

            <div v-else class="text-center q-py-sm text-grey-6">
              <q-icon name="check_circle" size="2rem" color="green" />
              <div class="q-mt-xs">No hay boletas pendientes</div>
            </div>
          </template>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Registrar pago"
          color="green-8"
          icon="payments"
          @click="$emit('save-pay-boleta', payBoletaForm, modoPayBoleta)"
          :disable="
            loadingPayBoletas ||
            (modoPayBoleta === 'boletas' &&
              ((!payBoletaForm.bAll && !payBoletaForm.idBoleta.length) ||
                !payBoletaForm.montoCancelado ||
                payBoletaForm.montoCancelado <= 0)) ||
            (modoPayBoleta === 'items' && !payBoletaForm.idDetalle.length)
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
    loadingPayBoletas: Boolean,
    userPayBoletas: Array,
  },
  emits: ["update:modelValue", "cancel", "save-pay-boleta"],
  data() {
    return {
      modoPayBoleta: "boletas",
      payBoletaForm: {
        id_usuario: null,
        montoCancelado: 0,
        bAll: false,
        idBoleta: [],
        idDetalle: [],
      },
    };
  },
  watch: {
    selectedUser: {
      immediate: true,
      handler(user) {
        if (user?.id) {
          this.payBoletaForm.id_usuario = user.id;
        }
      },
    },
  },
  computed: {
    montoSeleccionado() {
      let total = 0;
      for (const boleta of this.userPayBoletas) {
        const detalles = boleta.detalles || [];
        const selectedIds = this.payBoletaForm.idDetalle;
        const selectedFromBoleta = detalles.filter((d) =>
          selectedIds.includes(d.id)
        );
        if (!selectedFromBoleta.length) continue;
        if (selectedFromBoleta.length === detalles.length) {
          total +=
            parseFloat(boleta.monto_facturado || 0) -
            parseFloat(boleta.monto_cancelado || 0);
        } else {
          for (const d of selectedFromBoleta) {
            total += parseFloat(d.monto_servicio || 0);
          }
        }
      }
      return total.toFixed(2);
    },
    montoDescuentoAplicado() {
      let totalDesc = 0;
      for (const boleta of this.userPayBoletas) {
        const detalles = boleta.detalles || [];
        const selectedIds = this.payBoletaForm.idDetalle;
        const selectedFromBoleta = detalles.filter((d) =>
          selectedIds.includes(d.id)
        );
        if (
          selectedFromBoleta.length === detalles.length &&
          detalles.length > 0
        ) {
          for (const d of boleta.descuentos || []) {
            totalDesc += parseFloat(d.monto_servicio || 0);
          }
        }
      }
      return totalDesc.toFixed(2);
    },
  },
  methods: {
    areAllDetallesSelected(boleta) {
      const ids = (boleta.detalles || []).map((d) => d.id);
      return (
        ids.length > 0 &&
        ids.every((id) => this.payBoletaForm.idDetalle.includes(id))
      );
    },
    areSomeDetallesSelected(boleta) {
      const ids = (boleta.detalles || []).map((d) => d.id);
      return (
        ids.some((id) => this.payBoletaForm.idDetalle.includes(id)) &&
        !this.areAllDetallesSelected(boleta)
      );
    },
    toggleBoletaDetalles(boleta, selected) {
      const ids = (boleta.detalles || []).map((d) => d.id);
      if (selected) {
        const current = new Set(this.payBoletaForm.idDetalle);
        ids.forEach((id) => current.add(id));
        this.payBoletaForm.idDetalle = [...current];
      } else {
        this.payBoletaForm.idDetalle = this.payBoletaForm.idDetalle.filter(
          (id) => !ids.includes(id)
        );
      }
    },
  },
};
</script>
