import {
    translateGoods
} from "poe-cn-export-translator";

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
    return translateGoods(text);
}