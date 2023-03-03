/**
 * 拦截主世界TNT爆炸破坏方块并提升爆炸伤害。
 * 插件作者  @Tsubasa6848
 * 
 * 本插件通过LLSE的NativeAPI对主世界TNT爆炸破坏方块进行拦截，同时作为补偿提高主世界TNT爆炸伤害。
 * 本插件开源，作为一个LLSE的NativeAPI使用示例，希望可以帮助更多不会使用C++但是希望通过LLSE实现更多功能的开发者。
 * 
 * LLSE的NativeAPI并不完善，并且不适合操作性能敏感型函数。
 * 有能力开发原生插件（C++）的开发者请尽量使用原生插件开发。
 * 
 * 本插件仅作为一个使用示例，功能并不完善，有需求请自行修改
 * 
 * 允许对本插件进行二次开发。
 */

ll.registerPlugin(                       //注册插件
    "FuckOverworldTNTDestory",
    "Disable TNT Explosion Destory Blocks",
    [1,0,0],
    {"Author":"Tsubasa6848"}
); 


////////////////////   Hook爆炸事件（绝大多数爆炸）   /////////////////////
let normal_explode = NativeFunction.fromSymbol("?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z")       //从函数符号进行Hook找到此函数
.hook((a1, a2, a3, a4, a5, a6, a7, a8, a9) => {                                                                             //Hook函数头部，此函数有9个参数。
    if (a3.isNull()) {    //如果a3是nullptr（空指针，不等于LLSE里面的null，不可以写成 "a3 == null" 或者 "a3 == undefined" ），则为方块爆炸（原版只有床爆炸属于此类）
        return normal_explode.call(a1, a2, a3, a4, a5, a6, a7, a8, a9);          //本插件并不需要拦截此类型爆炸，执行原函数使得爆炸正常发生。    ##可以直接return使得BDS无法接收到此事件，函数不会执行，相当于拦截（完全拦截）。
    }
    else {                //如果a3不是nullptr，则为实体爆炸。
        let en = a3.asEntity();          //a3为C++中的实体指针类型，转化为LLSE的实体对，以方便进行进一步操作（a3不是LLSE的实体对象，必须进行一次转化才能在LLSE里面使用）
        if (en.type == "minecraft:tnt" && en.pos.dimid == 0) {    //如果是TNT并且在主世界
            a5 = 6;                 //a5为爆炸强度（a3为Int，脚本引擎会自动转化为原生数据类型），TNT爆炸强度为4，此处改为6（末地水晶的值）    
            a6 = false;             //a6为是否产生火焰（a4为Boolean，脚本引擎会自动转化为原生数据类型），改为false
            a7 = false;             //a7为是否破坏方块（a5为Boolean，脚本引擎会自动转化为原生数据类型），改为false
            //LLSE里面的Number和Boolean会自动转化为原生函数中对应的类型，无需手动转化。
            return normal_explode.call(a1, a2, a3, a4, a5, a6, a7, a8, a9);       //执行修改过的原函数，改变原来的爆炸。（相当于拦截了破坏但是不阻止正常爆炸发生）
        }
        else return normal_explode.call(a1, a2, a3, a4, a5, a6, a7, a8, a9);      //如果不是主世界的TNT，不做任何修改，直接执行原函数。
    }
});
//通过LLSE事件监听器直接拦截，本质上属于是前面提到的直接return，会完全拦截爆炸。在LLSE中如需仅爆炸不破坏，请使用上述Hook方法实现。


//其它爆炸处理如下（本插件仅拦截主世界TNT爆炸，故以下内容已注释掉，如需使用请取消注释）

//////////////////    Hook重生锚使用     //////////////////////
//let respawn_anchor_explode = NativeFunction.fromSymbol("?explode@RespawnAnchorBlock@@CAXAEAVPlayer@@AEBVBlockPos@@AEAVBlockSource@@AEAVLevel@@@Z").hook((a1, a2, a3, a4) => {
//    return;           //重生锚触发爆炸不属于之前Hook的爆炸，单独处理
//});
//重生锚由于爆炸函数特殊性，无法仅拦截爆炸破坏，因此你可以直接使用LLSE事件监听器拦截，无需使用Hook方法。以上仅为Hook示例。

//////////////////    Hook凋灵破坏方块     //////////////////////
//let wither_explode = NativeFunction.fromSymbol("?_destroyBlocks@WitherBoss@@AEAAXAEAVLevel@@AEBVAABB@@AEAVBlockSource@@HW4WitherAttackType@1@@Z").hook((a1, a2, a3, a4, a5, a6) => {
//    return;
//});                  //凋灵直接破坏方块（仅凋灵本体直接接触破坏）不属于之前Hook的爆炸，（这个本质上是接触破坏，本质上不属于爆炸）单独处理。
//这本质不是爆炸，也不存在仅爆炸不破坏，它仅有破坏，因此也无需使用Hook方法，可以使用LLSE事件监听器拦截。
//凋灵生成/死亡/进入第二阶段发生的大爆炸以及凋灵发射的凋灵头颅的爆炸属于之前Hook的正常爆炸类型。


///////// 其它 /////////
/**
 * NativeAPI并不完善，并且不适合操作性能敏感型函数。
 * NativeAPI仅适合操作少量性能不敏感的函数，写小型插件可以提高开发效率。
 * 请不要对使用NativeAPI的插件执行命令 "ll reload <plugin>" ，否则可能导致服务器崩溃。
 * 请在使用NativeAPI之前确保你对BDS底层函数有充分的了解，否则十分可能导致崩溃。
 * 在Hook一个函数后，要保证原函数功能正常执行，需要进行NativeHook.call()才能保证原函数正常执行，否则等于拦截该函数。
 * 以上示例中由于原生函数返回值为Void，因此拦截为直接return，在Hook其它函数时请注意原生函数返回值，做出相应调整。
 * 并不是所有的函数都可以拦截，部分函数拦截后可能导致游戏异常甚至崩溃，使用前请确保你对原生函数有充分了解。
 * 如果你希望改进NativeAPI功能，欢迎到LiteLoaderBDS仓库进行PR。
 */