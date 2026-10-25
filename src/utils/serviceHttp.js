import axios from "axios";
import { useUserStore } from "src/stores/user";
import { Loading, Notify } from "quasar";

const serviceHttp = axios.create({
  baseURL: process.env.API_BACKEND,
  timeout: 60000,
  withCredentials: true,
});

// A 401 from a login request means "wrong credentials", not "session expired"
function isSessionExpired(error) {
  const status = error?.response?.status;
  const url = error?.config?.url || "";
  const isLoginRequest =
    url.includes("/loginUser") || url.includes("/loginGoogle");
  return status === 401 && !isLoginRequest;
}

function goToLogin() {
  useUserStore().logout();
  Loading.hide();
  Notify.create({
    color: "red-8",
    textColor: "white",
    icon: "error",
    message: "Sesión expirada",
  });
  window.location.hash = "#/login";
}

serviceHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isSessionExpired(error)) {
      goToLogin();
    }
    return Promise.reject(error);
  }
);

export { serviceHttp };
