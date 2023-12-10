import { useUserStore } from "src/stores/user";
import { serviceHttp } from "../../utils/serviceHttp";
// import { date } from "quasar";
export default {
  getList(sState, iUId) {
    this.$q.loading.show();

    serviceHttp
      .get(`/getBoleta${iUId ? "/" + iUId : ""}?bEstado=${sState}`)
      .then(({ data }) => {
        console.log(data);

        this.$q.loading.hide();

        this.arr_boletas = data?.data || [];

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });

          console.log(this.arr_boletas);
          // useUserStore().setUser(data?.data || {});

          // this.$router.replace("/dashboard");
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // console.log("Iniciando sesión...");
  },
  forgotPassword() {
    // Lógica para recuperar la contraseña
    console.log("Olvidaste tu contraseña?");
  },
  // formatDate: function (val) {
  //     return val ? date.formatDate(val, 'DD/MM/YYYY') : '-';
  // },
  // formatPrice(value) {
  //     let val = (value / 1).toFixed(2)
  //     return `S/.${val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
  // },
  onSelectOpt: function (opt) {
    this.getList(opt.value);
  },
  onViewBoleta: function (oBoleta) {
    // console.log(oBoleta);
    this.$q.loading.show({ message: "Obteniendo la boleta..." });

    serviceHttp
      .post(
        "/getPdfBoleta",
        { id: oBoleta.id },
        {
          responseType: "arraybuffer",
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        this.$q.loading.hide();
        window.open(url);
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
      });
    // this.$router.push({ name: "boleta", params: { boleta: oBoleta } });
  },
  onDownloadBoleta: function (oBoleta) {
    this.$q.loading.show({ message: "Descargando..." });

    serviceHttp
      .post(
        "/getPdfBoleta",
        { id: oBoleta.id },
        {
          responseType: "arraybuffer",
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );

        this.$q.loading.hide();

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Boleta_${oBoleta.cod_boleta}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
      });
  },
};
