<template>
  <div class="export-tab"></div>
</template>
<script>
import axios from "axios";
import {
  translateItems,
  translatePassiveSkills,
} from "poe-cn-export-translator";

export default {
  name: "ExportTab",
  data: function () {
    return {
      connStatus: false,
    };
  },
  methods: {
    appendLog(item) {
      let log = document.querySelector(".export-tab");
      let doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
      log.appendChild(item);
      if (doScroll) {
        log.scrollTop = log.scrollHeight - log.clientHeight;
      }
    },
    getCharacters(accountName, realm, callback) {
      const path = "/character-window/get-characters";

      let form = new FormData();
      form.append("accountName", accountName);
      form.append("realm", realm);

      axios
        .post(path, form)
        .then(function (res) {
          let data = res.data;
          callback(data);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    viewProfile(accountName, callback) {
      const path = `/account/view-profile/${encodeURI(accountName)}`;
      axios
        .get(path)
        .then(function (res) {
          let data = res.data;
          callback(data);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getPassiveSkills(accountName, character, realm, callback) {
      const path = "/character-window/get-passive-skills";

      let form = new FormData();
      form.append("accountName", accountName);
      form.append("character", character);
      form.append("realm", realm);

      axios
        .post(path, form)
        .then(function (res) {
          let data = res.data;
          callback(data);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getItems(accountName, character, realm, callback) {
      const path = "/character-window/get-items";

      let form = new FormData();
      form.append("accountName", accountName);
      form.append("character", character);
      form.append("realm", realm);

      axios
        .post(path, form)
        .then(function (res) {
          let data = res.data;
          callback(data);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
  mounted() {
    let tab = this;
    if (window["WebSocket"]) {
      let conn = new WebSocket("ws://localhost:8655/ws");
      conn.onopen = function () {
        var item = document.createElement("div");
        item.innerHTML = "<b>Connect success.</b>";
        tab.appendLog(item);
      };
      conn.onclose = function () {
        var item = document.createElement("div");
        item.innerHTML = "<b>Connection closed.</b>";
        tab.appendLog(item);
      };
      conn.onmessage = function (evt) {
        var message = evt.data;
        let url = new URL(message, "https://poe.game.qq.com/");
        let pathname = url.pathname;
        if (pathname === "/character-window/get-characters") {
          let accountName = url.searchParams.get("accountName");
          let realm = url.searchParams.get("realm");
          tab.getCharacters(accountName, realm, function (data) {
            conn.send(JSON.stringify(data));
          });
        } else if (pathname.startsWith("/account/view-profile/")) {
          let tokens = pathname.split("/");
          let accountName = decodeURI(tokens[tokens.length - 1]);
          tab.viewProfile(accountName, function (data) {
            conn.send(data);
          });
        } else if (pathname === "/character-window/get-passive-skills") {
          let accountName = url.searchParams.get("accountName");
          let character = url.searchParams.get("character");
          let realm = url.searchParams.get("realm");
          tab.getPassiveSkills(accountName, character, realm, function (data) {
            translatePassiveSkills(data);
            conn.send(JSON.stringify(data));
          });
        } else if (pathname === "/character-window/get-items") {
          let accountName = url.searchParams.get("accountName");
          let character = url.searchParams.get("character");
          let realm = url.searchParams.get("realm");
          tab.getItems(accountName, character, realm, function (data) {
            translateItems(data);
            conn.send(JSON.stringify(data));
          });
        }
      };
    } else {
      var item = document.createElement("div");
      item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
      tab.appendLog(item);
    }
  },
};
</script>
