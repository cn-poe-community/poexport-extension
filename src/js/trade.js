import {
    Translator
} from "exporter-of-exile-cn-translator";

const translator = new Translator();

chrome.storage.local.get({ goodsTransEnabled: true }, (res) => {
    if (res.goodsTransEnabled) {
        document.body.addEventListener(
            'click',
            async () => {
                let text = await navigator.clipboard.readText();
                if (isItemCode(text)) {
                    let res = translate(text);
                    await navigator.clipboard.writeText(res);
                }
            }
        );
    }
});

function isItemCode(text) {
    return text.startsWith("物品类别:");
}

function translate(text) {
    return translator.translateGoods(text);
}