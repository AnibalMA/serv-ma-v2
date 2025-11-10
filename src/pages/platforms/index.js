import { serviceHttp } from "../../utils/serviceHttp";

export default {
  data() {
    return {
      platforms: [],
      loading: false,
      searchTerm: "",
    };
  },

  computed: {
    filteredPlatforms() {
      if (!this.searchTerm) return this.platforms;

      const search = this.searchTerm.toLowerCase();
      return this.platforms.filter(
        (platform) =>
          platform.nombre.toLowerCase().includes(search) ||
          platform.cod_plataforma.toLowerCase().includes(search)
      );
    },
  },

  async mounted() {
    await this.loadPlatforms();
  },

  methods: {
    async loadPlatforms() {
      this.loading = true;

      try {
        const { data } = await serviceHttp.get("/platforms");

        if (data?.ok) {
          this.platforms = data.data || [];
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data.sMessage || "Plataformas cargadas exitosamente",
          });
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al cargar plataformas",
          });
        }
      } catch (error) {
        console.error("Error loading platforms:", error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error de conexión al cargar plataformas",
        });
      } finally {
        this.loading = false;
      }
    },

    getGroupStatusColor(grupo) {
      const activeAccounts = grupo.cuentas.filter(
        (c) => c.id_estado === 1
      ).length;
      const totalAccounts = grupo.cuentas.length;

      if (activeAccounts === totalAccounts) return "green";
      if (activeAccounts > 0) return "orange";
      return "red";
    },

    getGroupStatusIcon(grupo) {
      const activeAccounts = grupo.cuentas.filter(
        (c) => c.id_estado === 1
      ).length;
      const totalAccounts = grupo.cuentas.length;

      if (activeAccounts === totalAccounts) return "check_circle";
      if (activeAccounts > 0) return "warning";
      return "error";
    },

    calculateGroupTotal(grupo) {
      return grupo.perfiles.reduce((total, perfil) => {
        return total + parseFloat(perfil.monto || 0);
      }, 0);
    },

    getTotalProfiles(platform) {
      if (platform) {
        return platform.grupos.reduce((total, grupo) => {
          return total + grupo.perfiles.length;
        }, 0);
      }

      // Para estadísticas generales
      return this.platforms.reduce((total, platform) => {
        return total + this.getTotalProfiles(platform);
      }, 0);
    },

    getPlatformTotal(platform) {
      return platform.grupos.reduce((total, grupo) => {
        return total + this.calculateGroupTotal(grupo);
      }, 0);
    },

    getTotalGroups() {
      return this.platforms.reduce((total, platform) => {
        return total + platform.grupos.length;
      }, 0);
    },

    getTotalRevenue() {
      return this.platforms.reduce((total, platform) => {
        return total + this.getPlatformTotal(platform);
      }, 0);
    },

    copyPerfilInfo(platform, grupo, perfil) {
      // Encontrar la cuenta asociada al grupo
      const cuenta =
        grupo.cuentas && grupo.cuentas.length > 0 ? grupo.cuentas[0] : null;

      // Crear el texto formateado para WhatsApp
      let text = `📱 *${platform.nombre}*\n\n`;
      // text += `━━━━━━━━━━━━━━━━━━━\n`;

      if (cuenta) {
        text += `📧 *Correo:* \n${cuenta.correo_acc}\n\n`;
        text += `🔑 *Contraseña:* \n${cuenta.pass_acc || "••••••••"}\n\n`;
        text += `\n`;
      }

      text += `👤 *Perfil:* ${perfil.perfil}\n\n`;
      // text += `� *Usuario:* ${perfil.usuario}\n`;

      if (perfil.pin && perfil.pin !== "-") {
        text += `🔒 *PIN:* ${perfil.pin}\n\n`;
      }

      // text += `💰 *Monto:* ${perfil.monto_pagar}\n`;
      text += `📅 *Día de pago:* ${perfil.payday}\n\n`;
      text += `\n⚠️ (*) Solo se debe usar en un dispositivo en simultáneo\n`;

      // text += `\n━━━━━━━━━━━━━━━━━━━`;

      // Copiar al portapapeles
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "content_copy",
            message: "Información del perfil copiada",
            position: "top",
          });
        })
        .catch((err) => {
          console.error("Error al copiar:", err);
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: "Error al copiar la información",
            position: "top",
          });
        });
    },
  },
};
