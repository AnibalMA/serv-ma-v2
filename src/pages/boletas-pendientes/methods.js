import { useUserStore } from "src/stores/user";
import { serviceHttp } from "../../utils/serviceHttp";

export default {
  getBoletasPendientes() {
    this.$q.loading.show();

    serviceHttp
      .get(`/getAllPendingBoletas`)
      .then(({ data }) => {
        console.log(data);

        this.$q.loading.hide();

        if (data?.ok) {
          // Transformar los datos para el árbol
          this.boletasPendientesTree = this.transformDataToTree(data);

          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message:
              data?.sMessage || "Boletas pendientes cargadas correctamente",
          });
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al cargar boletas pendientes",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error al cargar boletas pendientes",
        });
      });
  },

  transformDataToTree(data) {
    // Adaptación para el nuevo formato JSON
    const tree = [];

    // Verificar si existe la estructura esperada
    if (!data || !data.data_agrupada || !data.data_agrupada.usuarios) {
      console.error("Formato de datos inesperado:", data);
      return [];
    }

    const usuarios = data.data_agrupada.usuarios;

    // Iterar sobre cada usuario
    Object.keys(usuarios).forEach((userId) => {
      const userInfo = usuarios[userId];
      const boletas = userInfo.boletas || [];

      // Crear nodo de usuario
      const userNode = {
        id: `user-${userInfo.id_usuario}`,
        label: `${userInfo.nombre_usuario || ""} - S/.${
          userInfo.total_pendiente
        } - Vto: ${
          userInfo.fecha_vencimiento
            ? new Date(userInfo.fecha_vencimiento).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "No determinado"
        }`,
        icon: "person",
        iconColor: "primary",
        count: userInfo.cantidad_boletas,
        children: [],
      };

      // Agregar boletas como hijos
      boletas.forEach((boleta) => {
        userNode.children.push({
          id: `boleta-${boleta.id}`,
          label: `${boleta.cod_boleta} - S/.${boleta.monto_facturado} - Vto: ${
            boleta.fecha_vencimiento
              ? new Date(boleta.fecha_vencimiento).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "∞"
          }`,
          icon: "receipt",
          iconColor: boleta.desc_estado === "Pendiente" ? "orange" : "green",
          boletaData: boleta,
          actions: [
            {
              icon: "visibility",
              color: "red",
              tooltip: "Ver boleta",
              handler: (node) => this.onViewBoleta(node.boletaData),
            },
            {
              icon: "cloud_download",
              color: "primary",
              tooltip: "Descargar boleta",
              handler: (node) => this.onDownloadBoleta(node.boletaData),
            },
          ],
        });
      });

      // Agregar nodo de usuario al árbol solo si tiene boletas
      if (boletas.length > 0) {
        tree.push(userNode);
      }
    });

    return tree;
  },

  onViewBoleta(oBoleta) {
    this.$q.loading.show({ message: "Obteniendo la boleta..." });

    serviceHttp
      .post(
        "/getPdfBoleta",
        { id: oBoleta.id_boleta },
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
  },

  onDownloadBoleta(oBoleta) {
    this.$q.loading.show({ message: "Descargando..." });

    serviceHttp
      .post(
        "/getPdfBoleta",
        { id: oBoleta.id_boleta },
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
