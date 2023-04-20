ll.registerPlugin(
    "FakeSeed",
    "隐藏服务器真实种子",
    [1, 0, 0],
    {"Author": "Tsubasa6848"}
); 

logger.info("FakeSeed Loaded!");
logger.info("Author: Tsubasa6848");

let original = NativeFunction.fromSymbol("?write@StartGamePacket@@UEBAXAEAVBinaryStream@@@Z").hook((a1, a2) =>{
    a1.offset(48).int64 = 114514;
    return original.call(a1, a2);
});