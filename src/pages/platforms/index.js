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
  },
};
