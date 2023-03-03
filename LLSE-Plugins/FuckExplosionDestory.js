ll.registerPlugin(
    "FuckExplosionDestory",
    "Disable Explosion Destory Blocks",
    [1,0,0],
    {"Author":"Tsubasa6848"}
); 

let normal_explode = NativeFunction.fromSymbol("?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z").hook((a1, a2, a3, a4, a5, a6, a7, a8, a9) => {
    a6 = false;
    a7 = false;
    return normal_explode.call(a1, a2, a3, a4, a5, a6, a7, a8, a9);
});

let respawn_anchor_explode = NativeFunction.fromSymbol("?explode@RespawnAnchorBlock@@CAXAEAVPlayer@@AEBVBlockPos@@AEAVBlockSource@@AEAVLevel@@@Z").hook((a1, a2, a3, a4) => {
    return;
});

let wither_explode = NativeFunction.fromSymbol("?_destroyBlocks@WitherBoss@@AEAAXAEAVLevel@@AEBVAABB@@AEAVBlockSource@@HW4WitherAttackType@1@@Z").hook((a1, a2, a3, a4, a5, a6) => {
    return;
});