import { describe, it, expect, vi } from "vitest";

vi.mock("quasar", () => ({ date: {} }));
vi.mock("stores/user", () => ({ useUserStore: vi.fn() }));
vi.mock("src/utils/serviceHttp", () => ({ serviceHttp: {} }));

import adminTicketsPage from "src/pages/admin-tickets/index";

const { methods } = adminTicketsPage;

// Minimal stand-in for the component's "this"
function createPage(ticketForm, selectedService = null) {
  return {
    ticketForm: {
      tipo: null,
      usuario: { id: 7, nom_usuario: "Ana" },
      descripcion: "",
      monto: 0,
      desc_perfil: "",
      nuevo_pin: "",
      dia_pago: null,
      ...ticketForm,
    },
    selectedService,
    needsService: methods.needsService,
    loadUserServices: vi.fn(),
  };
}

function missingField(page) {
  return methods.getMissingFieldMessage.call(page, page.ticketForm.tipo);
}

describe("admin-tickets required fields", () => {
  it.each(["CAMBIAR_PIN", "CAMBIAR_PERFIL", "BAJA_SERVICIO", "CAMBIAR_PAYDAY"])(
    "%s asks for a service when none is selected",
    (tipo) => {
      const page = createPage({
        tipo,
        nuevo_pin: "1234",
        desc_perfil: "Perfil 1",
        dia_pago: 10,
      });
      expect(missingField(page)).toBe("Seleccione un servicio");
    }
  );

  it.each([null, "", 0, 32, 15.5])(
    "CAMBIAR_PAYDAY rejects the day %s",
    (diaPago) => {
      const page = createPage(
        { tipo: "CAMBIAR_PAYDAY", dia_pago: diaPago },
        { value: 1 }
      );
      expect(missingField(page)).toBe("Ingrese un día de pago válido (1-31)");
    }
  );

  it("CAMBIAR_PAYDAY accepts a day between 1 and 31", () => {
    const page = createPage(
      { tipo: "CAMBIAR_PAYDAY", dia_pago: 31 },
      { value: 1 }
    );
    expect(missingField(page)).toBe("");
  });

  it("BAJA_USUARIO does not need a service", () => {
    expect(missingField(createPage({ tipo: "BAJA_USUARIO" }))).toBe("");
  });

  it("CREAR_DESCUENTO needs an amount and a description", () => {
    const noAmount = createPage({
      tipo: "CREAR_DESCUENTO",
      monto: 0,
      descripcion: "Promo",
    });
    const noDescription = createPage({
      tipo: "CREAR_DESCUENTO",
      monto: 10,
      descripcion: "  ",
    });
    const ok = createPage({
      tipo: "CREAR_DESCUENTO",
      monto: 10,
      descripcion: "Promo",
    });

    expect(missingField(noAmount)).toBe(
      "El monto del descuento debe ser mayor a 0"
    );
    expect(missingField(noDescription)).toBe(
      "Ingrese una descripción para el descuento"
    );
    expect(missingField(ok)).toBe("");
  });
});

describe("admin-tickets loads services when the type changes", () => {
  const onTipoChange = adminTicketsPage.watch["ticketForm.tipo"];

  it("loads the services of the user already selected", () => {
    const page = createPage({ tipo: "CAMBIAR_PIN" });

    onTipoChange.call(page, "CAMBIAR_PIN");

    expect(page.loadUserServices).toHaveBeenCalledWith(page.ticketForm.usuario);
  });

  it("does nothing without a user or for types without a service", () => {
    const noUser = createPage({ tipo: "CAMBIAR_PIN", usuario: null });
    const noService = createPage({ tipo: "BAJA_USUARIO" });

    onTipoChange.call(noUser, "CAMBIAR_PIN");
    onTipoChange.call(noService, "BAJA_USUARIO");

    expect(noUser.loadUserServices).not.toHaveBeenCalled();
    expect(noService.loadUserServices).not.toHaveBeenCalled();
  });
});
