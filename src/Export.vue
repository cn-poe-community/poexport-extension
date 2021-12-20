<template>
  <exporter :initialAccountName="getInitialAccountName()"></exporter>
</template>
<script>
import Exporter from "./components/Exporter.vue";

export default {
  name: "Index",
  components: {
    exporter: Exporter,
  },
  methods: {
    getInitialAccountName() {
      let pattern = new RegExp("/account/view-profile/([^/]+)/characters");
      let match = pattern.exec(window.location.href);
      if (match) {
        return (decodeURI(match[1]));
      }
      return "";
    },
  },
};
</script>
