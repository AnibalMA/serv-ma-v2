// src/pages/dox/index.js
import data from "./data";
import methods from "./methods";

export default {
  name: "DoxPage",
  data,
  methods,
  mounted() {
    this.loadCommands();
  },
};
