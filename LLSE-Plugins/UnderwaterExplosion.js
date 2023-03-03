ll.registerPlugin(
    "UnderwaterExplosion",
    "Set Explosion Allowed Underwater",
    [1,0,0],
    {"Author":"Tsubasa6848"}
); 

let setAllowUnderwater = NativeFunction.fromSymbol("?setAllowUnderwater@Explosion@@QEAAX_N@Z").hook((a1, a2) => {
    a2 = true;
    return setAllowUnderwater.call(a1, a2);
});

logger.info("UnderwaterExplosion Loaded!");