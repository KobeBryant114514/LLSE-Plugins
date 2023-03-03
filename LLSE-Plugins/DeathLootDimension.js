ll.registerPlugin(
    "DeathLootDimension",
    "Drop Death Loot in Specified Dimensions",
    [1,0,0],
    {"Author":"Tsubasa6848"}
); 

logger.info("DeathLootDimension Loaded!");
logger.info("Author: Tsubasa6848");

const config_path = "./plugins/DeathLootDimension/config.json";
var isDeathDrop = false;
const config = data.openConfig(config_path, "json", JSON.stringify({
    "LootDimensions":{
        "Overworld": false,
        "Nether": true,
        "The_End": true
    }
}));

function CheckLootDim(dimid) {
    switch (dimid) {
        case 0:
            return config.get("LootDimensions")["Overworld"];
        case 1:
            return config.get("LootDimensions")["Nether"];
        case 2:
            return config.get("LootDimensions")["The_End"];
        default:
            return true;
    }
}

let PlayerDeathEvent = NativeFunction.fromSymbol("?die@ServerPlayer@@UEAAXAEBVActorDamageSource@@@Z").hook((a1, a2) => {
    isDeathDrop = true;
    let pl = a1.asPlayer();
    if (CheckLootDim(pl.pos.dimid) == false) {
        let plnbt = mc.getPlayerNbt(pl.uuid);
        let res = PlayerDeathEvent.call(a1, a2);
        isDeathDrop = false;
        mc.setPlayerNbtTags(pl.uuid, plnbt, ["Offhand", "Inventory", "Armor"]);
        plnbt.destroy();
        return res;
    }
    let res = PlayerDeathEvent.call(a1, a2);
    isDeathDrop = false;
    return res;
});

let PlayerDropEvent = NativeFunction.fromSymbol("?drop@Player@@UEAA_NAEBVItemStack@@_N@Z").hook((a1, a2, a3) => {
    if (isDeathDrop == true) {
        let pl = a1.asPlayer();
        if (CheckLootDim(pl.pos.dimid) == false) {
            return false;
        }
        else {
            return PlayerDropEvent.call(a1, a2, a3);
        }
    }
    else return PlayerDropEvent.call(a1, a2, a3);
});