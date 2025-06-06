import fs from "fs";
import * as glob from "glob";
import { execSync } from "child_process";

function loadOriginalScript() {
  const files = glob.sync(".output/monkey/assets/monkey-*.js");

  if (files.length !== 1) {
    console.error(`错误：找到 ${files.length} 个匹配文件，预期只有 1 个`);
    process.exit(1);
  }

  const inputFile = files[0];
  console.log(`找到原始脚本文件: ${inputFile}`);

  const content = fs.readFileSync(inputFile, "utf-8");

  return content;
}

function pnpmList(manager = "pnpm") {
  try {
    const cmd =
      manager === "pnpm"
        ? "pnpm list --depth=0 --json"
        : "npm list --depth=0 --json";

    const output = execSync(cmd, { encoding: "utf-8" });
    const data = JSON.parse(output);
    return data[0];
  } catch (err) {
    throw new Error(`无法通过 ${manager} 获取依赖: ${err.message}`);
  }
}

const headersTemplate = `
// ==UserScript==
// @name         PoExport
// @namespace    https://github.com/cn-poe-community/poexport-extension
// @version      {version}
// @description  流放之路国服导出工具。
// @author       me1ting
// @match        https://poe.game.qq.com/my-account
// @match        https://poe.game.qq.com/account/view-profile/*
// @match        https://poe.game.qq.com/forum
// @icon         https://poecdn.game.qq.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvU2NvdXRpbmdSZXBvcnQiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/584635f3c8/ScoutingReport.png
// @require      https://unpkg.com/cn-poe-translator@{dependancies.cn-poe-translator}/dist/translator.global.js
// @require      https://unpkg.com/cn-poe-export-db@{dependancies.cn-poe-export-db}/dist/db.global.js
// @require      https://unpkg.com/pob-building-creator@{dependancies.pob-building-creator}/dist/creator.global.js
// @require      https://unpkg.com/pako@{dependancies.pako}/dist/pako_deflate.min.js
// @require      https://unpkg.com/axios@{dependancies.axios}/dist/axios.min.js
// @require      https://unpkg.com/vue@{dependancies.vue}/dist/vue.global.prod.js
// @grant        none
// @license      MIT
// ==/UserScript==
`;

function renderTemplate(template, data) {
  return template.replace(/\{([\w.-]+)\}/g, (_, key) => {
    if (data[key] !== undefined) {
      return data[key];
    }
    if (key.startsWith("dependancies.")) {
      const depName = key.split(".")[1];
      if (data.dependancies[depName] !== undefined) {
        return data.dependancies[depName];
      }
    }
    throw new Error(`未找到占位符 ${key} 的值`);
  });
}

function buildHeaders() {
  let info = {
    version: "0.0.0",
    dependancies: {
      "cn-poe-translator": "0.0.0",
      "cn-poe-export-db": "0.0.0",
      "pob-building-creator": "0.0.0",
      pako: "0.0.0",
      axios: "0.0.0",
      vue: "0.0.0",
    },
  };

  const result = pnpmList();
  info.version = result.version;
  for (const key in info.dependancies) {
    if (result.dependencies[key]) {
      info.dependancies[key] = result.dependencies[key].version;
    } else if (result.devDependencies[key]) {
      info.dependancies[key] = result.devDependencies[key].version;
    } else {
      console.warn(`警告：未找到依赖 ${key} 的版本信息`);
    }
  }

  return renderTemplate(headersTemplate, info);
}

function buildBody(content) {
  const lines = content.split("\n");
  if (
    !lines[2].includes(
      `var __vite_style__ = document.createElement("style");`,
    ) ||
    !lines[4].includes(`document.head.appendChild(__vite_style__);`)
  ) {
    console.error("错误：未找到 Vite 样式注入代码");
  }

  const styleRegex = /__vite_style__.textContent\s*=\s*"([^"]*)";/;
  const match = lines[3].match(styleRegex);

  if (!match) {
    console.error("错误：未找到匹配的样式内容");
    process.exit(1);
  }

  let styleContent = match[1];

  if (!content.includes("{style_place_holder}")) {
    console.error("错误：未找到样式占位符 {style_place_holder}");
    process.exit(1);
  }

  let newContent = lines.slice(0, 2).concat(lines.slice(5)).join("\n");

  newContent = newContent.replace(/{style_place_holder}/g, styleContent);

  return newContent;
}

function build() {
  console.log("开始构建 Monkey 脚本...");
  const headers = buildHeaders();
  const body = buildBody(loadOriginalScript());

  const outputFile = ".output/monkey/monkey.js";
  fs.writeFileSync(outputFile, headers + "\n" + body, "utf-8");

  console.log(`构建完成，输出文件: ${outputFile}`);
}

build();
