<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="option-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="payments" class="q-mr-sm" aria-hidden="true" />
          {{ option ? "Editar método de pago" : "Nuevo método de pago" }}
        </div>
      </q-card-section>

      <q-form @submit="onSubmit">
        <q-card-section class="q-gutter-y-sm">
          <q-input
            v-model="form.nom_payment_opc"
            label="Nombre *"
            name="nom_payment_opc"
            hint="Ejemplo: Yape"
            autocomplete="off"
            outlined
            dense
            counter
            maxlength="100"
            lazy-rules
            :rules="paymentOptionRules.name"
          />
          <q-input
            v-model="form.desc_payment_opc"
            label="Descripción"
            name="desc_payment_opc"
            hint="Ejemplo: Paga desde tu celular"
            autocomplete="off"
            outlined
            dense
            counter
            maxlength="255"
            lazy-rules
            :rules="paymentOptionRules.text"
          />
          <q-input
            v-model="form.detalles_payment_opc"
            label="Número o cuenta"
            name="detalles_payment_opc"
            hint="Lo que el cliente copia para pagar. Ejemplo: Celular: 987 654 321"
            autocomplete="off"
            spellcheck="false"
            outlined
            dense
            counter
            maxlength="255"
            lazy-rules
            :rules="paymentOptionRules.text"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            :disable="saving"
            @click="$emit('update:modelValue', false)"
          />
          <q-btn
            type="submit"
            unelevated
            color="primary"
            label="Guardar"
            :loading="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  cleanPaymentOptionForm,
  paymentOptionFormFromOption,
  paymentOptionRules,
} from "../helpers";

export default {
  props: {
    modelValue: Boolean,
    // null = new payment option
    option: Object,
    saving: Boolean,
  },
  emits: ["update:modelValue", "save"],
  setup() {
    return { paymentOptionRules };
  },
  data() {
    return {
      form: paymentOptionFormFromOption(null),
    };
  },
  watch: {
    // Start with a fresh form every time the dialog opens
    modelValue(isOpen) {
      if (isOpen) this.resetForm();
    },
  },
  methods: {
    resetForm() {
      this.form = paymentOptionFormFromOption(this.option);
    },
    // q-form only calls this when every rule passes
    onSubmit() {
      // Enter pressed twice while saving
      if (this.saving) return;
      this.$emit("save", cleanPaymentOptionForm(this.form));
    },
  },
};
</script>

<style scoped>
.option-card {
  width: 100%;
  max-width: 480px;
}
</style>
