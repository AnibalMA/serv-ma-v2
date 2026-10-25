import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError } from "axios";

const logout = vi.fn();

vi.mock("src/stores/user", () => ({
  useUserStore: () => ({ logout }),
}));

vi.mock("quasar", () => ({
  Loading: { hide: vi.fn() },
  Notify: { create: vi.fn() },
}));

import { Loading, Notify } from "quasar";
import { serviceHttp } from "src/utils/serviceHttp";

// Fake adapters so no real HTTP request is made
function respondWith(status) {
  return (config) => {
    const response = { status, data: {}, headers: {}, config };
    if (status < 400) return Promise.resolve(response);
    return Promise.reject(
      new AxiosError("Request failed", "ERR_BAD_REQUEST", config, {}, response)
    );
  };
}

function networkError(config) {
  return Promise.reject(new AxiosError("Network Error", "ERR_NETWORK", config));
}

describe("serviceHttp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = "";
  });

  it("returns the response on success", async () => {
    serviceHttp.defaults.adapter = respondWith(200);
    const { status } = await serviceHttp.get("/getBoletas");
    expect(status).toBe(200);
    expect(logout).not.toHaveBeenCalled();
  });

  it("logs out and goes to login on 401", async () => {
    serviceHttp.defaults.adapter = respondWith(401);

    await expect(serviceHttp.get("/getBoletas")).rejects.toBeInstanceOf(
      AxiosError
    );
    expect(logout).toHaveBeenCalledTimes(1);
    expect(Loading.hide).toHaveBeenCalled();
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Sesión expirada" })
    );
    expect(window.location.hash).toBe("#/login");
  });

  it("does not log out on 401 from the login request (wrong password)", async () => {
    serviceHttp.defaults.adapter = respondWith(401);

    await expect(serviceHttp.post("/loginUser", {})).rejects.toBeInstanceOf(
      AxiosError
    );
    expect(logout).not.toHaveBeenCalled();
  });

  it("does not log out on 401 from the Google login request", async () => {
    serviceHttp.defaults.adapter = respondWith(401);

    await expect(serviceHttp.post("/loginGoogle", {})).rejects.toBeInstanceOf(
      AxiosError
    );
    expect(logout).not.toHaveBeenCalled();
  });

  it("does not crash when there is no response (network error)", async () => {
    serviceHttp.defaults.adapter = networkError;

    await expect(serviceHttp.get("/getBoletas")).rejects.toMatchObject({
      code: "ERR_NETWORK",
    });
    expect(logout).not.toHaveBeenCalled();
  });

  it("passes the extra config of post (e.g. responseType)", async () => {
    let usedConfig;
    serviceHttp.defaults.adapter = (config) => {
      usedConfig = config;
      return respondWith(200)(config);
    };

    await serviceHttp.post(
      "/getPdfBoleta",
      { id: 1 },
      { responseType: "arraybuffer" }
    );
    expect(usedConfig.responseType).toBe("arraybuffer");
  });
});
