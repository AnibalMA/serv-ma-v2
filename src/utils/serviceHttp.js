import axios from "axios";
import { LocalStorage } from "quasar";
import { useUserStore } from "src/stores/user";
import { Notify } from "quasar";
import { Loading } from "quasar";
// import router from 'src/router';

const axios_servma = axios.create({ baseURL: process.env.API_BACKEND });
const axios_servma_b = axios.create({ baseURL: process.env.API_BACKEND_B });
const getHeaders = () => {
  const oUser = LocalStorage.getItem("-oUI");
  const oHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (oUser) {
    oHeaders.Authorization = `Bearer ${useUserStore().getUser().sToken}`;
  }
  return oHeaders;
};
axios_servma.interceptors.request.use(
  (config) => {
    config.headers = getHeaders() || {};
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const verify_token = (response) => {
  if (response.request.status === 401) {
    LocalStorage.clear();

    useUserStore().logout();
    // router().replace('/');
    Loading.hide();

    Notify.create({
      color: "red-8",
      textColor: "white",
      icon: "error",
      message: "Sesión expirada",
    });
    window.location.hash = "#/login";
  }
  return response;
};
const serviceHttp = {
  get(url) {
    return new Promise((resolve, reject) => {
      axios_servma
        .get(url)
        .then((response) => {
          resolve(verify_token(response));
        })
        .catch((error) => {
          reject(verify_token(error));
        });
    });
  },
  post(url, data, options) {
    return new Promise((resolve, reject) => {
      axios_servma
        .post(url, data, options ? options : null)
        .then((response) => {
          resolve(verify_token(response));
        })
        .catch((error) => {
          reject(verify_token(error));
        });
    });
  },
  put(url, data) {
    return new Promise((resolve, reject) => {
      axios_servma
        .put(url, data)
        .then((response) => {
          resolve(verify_token(response));
        })
        .catch((error) => {
          reject(verify_token(error));
        });
    });
  },
  delete(url) {
    return new Promise((resolve, reject) => {
      axios_servma
        .delete(url)
        .then((response) => {
          resolve(verify_token(response));
        })
        .catch((error) => {
          reject(verify_token(error));
        });
    });
  },
  patch(url, data) {
    return new Promise((resolve, reject) => {
      axios_servma
        .patch(url, data)
        .then((response) => {
          resolve(verify_token(response));
        })
        .catch((error) => {
          reject(verify_token(error));
        });
    });
  },
  head(url) {
    return new Promise((resolve, reject) => {
      axios_servma
        .head(url)
        .then((response) => {
          resolve(verify_token(response));
        })
        .catch((error) => {
          reject(verify_token(error));
        });
    });
  },
  options(url) {
    return new Promise((resolve, reject) => {
      axios_servma
        .options(url)
        .then((response) => {
          resolve(verify_token(response));
        })
        .catch((error) => {
          reject(verify_token(error));
        });
    });
  },
};
const serviceHttpB = {
  get(url) {
    return new Promise((resolve, reject) => {
      axios_servma_b
        .get(url)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  post(url, data, options) {
    return new Promise((resolve, reject) => {
      axios_servma_b
        .post(url, data, options ? options : null)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  put(url, data) {
    return new Promise((resolve, reject) => {
      axios_servma_b
        .put(url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  delete(url) {
    return new Promise((resolve, reject) => {
      axios_servma_b
        .delete(url)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  patch(url, data) {
    return new Promise((resolve, reject) => {
      axios_servma_b
        .patch(url, data)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  head(url) {
    return new Promise((resolve, reject) => {
      axios_servma_b
        .head(url)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  options(url) {
    return new Promise((resolve, reject) => {
      axios_servma_b
        .options(url)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

export { serviceHttp, serviceHttpB };
