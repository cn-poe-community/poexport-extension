<template>
  <exporter :initialAccountName="getInitialAccountName()"></exporter>
</template>
<script>
import Exporter from "./components/Exporter.vue";

export default {
  name: "Export",
  components: {
    exporter: Exporter,
  },
  methods: {
    getInitialAccountName() {
      let pattern = new RegExp("/account/view-profile/([^/?]+)");
      let match = pattern.exec(window.location.href);
      if (match) {
        return (decodeURI(match[1]));
      }
      return "";
    },
  },
};
</script>
