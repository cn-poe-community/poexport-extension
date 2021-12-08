document.body.addEventListener(
    'click',
    async (e) => {
        let text = await navigator.clipboard.readText();
        if (isItemCode(text)) {
            let transResult = translate(text);
            if (transResult.success) {
                await navigator.clipboard.writeText(transResult.result);
            } else {
                console.log("POE-TX-EXPORT: ", transResult.error);
            }
        }
    }
);

function isItemCode(text) {
    return text.startsWith("物品类别:");
}

function translate(text) {
    //TODO
    return {
        "success": true,
        "result": "123"
    };
}