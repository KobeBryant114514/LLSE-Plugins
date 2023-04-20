ll.registerPlugin(
    "AntiDragonEggCopy",
    "阻止末地折跃门复制龙蛋",
    [1, 0, 0],
    {"Author": "Tsubasa6848"}
);

logger.info("FakeSeed Loaded!");
logger.info("Author: Tsubasa6848");

let original = NativeFunction.fromSymbol("?teleportEntity@EndGatewayBlockActor@@QEAAXAEAVActor@@@Z").hook((a1, a2) => {
    let en = a2.asEntity();
    if (en.isItemEntity()) {
        let item = en.toItem();
        if (item.type == "minecraft:dragon_egg") {
            en.remove();
            return;
        }
    }
    return original.call(a1, a2);
});