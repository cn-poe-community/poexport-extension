<template>
  <div class="export-tab"></div>
</template>
<script>
import axios from "axios";
import { Translator } from "exporter-of-exile-cn-translator";

export default {
  name: "ExportTab",
  data: function () {
    return {
      connStatus: false,
      translator: new Translator(),
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
    getLeagueShowText(league) {
      let showText = league;
      showText = showText.replace("永久", "Standard");
      showText = showText.replace("虚空", "Void");
      showText = showText.replace("赛季", "");
      showText = showText.replace("（独狼）", "(SSF)");
      showText = showText.replace("（专家）", "(HC)");
      showText = showText.replace("（独狼专家）", "(SSF HC)");

      return showText;
    },
  },
  mounted() {
    let tab = this;
    chrome.storage.local.get({ listenPort: 8655 }, (res) => {
      const listenPort = res.listenPort;
      if (window["WebSocket"]) {
        let conn = new WebSocket(`ws://localhost:${listenPort}/ws`);
        conn.onopen = function () {
          var item = document.createElement("div");
          item.innerHTML = "<b>连接成功。</b>";
          tab.appendLog(item);
        };
        conn.onclose = function () {
          var item = document.createElement("div");
          item.innerHTML = "<b>连接已关闭。</b>";
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
              for (let character of data) {
                character.league = tab.getLeagueShowText(character.league);
              }
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
            tab.getPassiveSkills(
              accountName,
              character,
              realm,
              function (data) {
                tab.translator.translatePassiveSkills(data);
                conn.send(JSON.stringify(data));
              }
            );
          } else if (pathname === "/character-window/get-items") {
            let accountName = url.searchParams.get("accountName");
            let character = url.searchParams.get("character");
            let realm = url.searchParams.get("realm");
            tab.getItems(accountName, character, realm, function (data) {
              tab.translator.translateItems(data);
              conn.send(JSON.stringify(data));
            });
          }
        };
      } else {
        var item = document.createElement("div");
        item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
        tab.appendLog(item);
      }
    });
  },
};
</script>
