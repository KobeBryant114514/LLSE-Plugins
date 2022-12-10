/**
 * LLSECheckBag
 * 一个可查询离线玩家背包的插件。
 * 
 * 作者： @Tsubasa6848 @铭记mingji
 * 本插件开源，作为我对我新加入到LiteLoader的离线玩家nbt的API测试 @Tsubasa6848
 * 但是未经许可，你不得对本插件进行转载、整合或二次开发。不要作恶！！
 * 本插件由 @铭记mingji 创建，主体部分由 @Tsubasa6848 完成。
 * 插件的后续维护请找 @铭记mingji
 */

ll.registerPlugin(
    "LLSECheckBag",
    "可查所有玩家背包的查包插件",
    [2,1,0],
    {}
); 

const Version = "2.1.0";

if (File.exists("./plugins/LLSECheckBag/data.json")) {                  //旧的数据库已弃用，删除数据库。
    File.delete("./plugins/LLSECheckBag/data.json");
};

logger.info("加载成功，作者： Tsubasa6848、铭记mingji");
logger.info("当前版本： " + Version);

mc.listen("onServerStarted", () => {                                           
    let cmd = mc.newCommand("checkbag", "查询玩家背包", PermType.GameMasters);  
    cmd.setAlias("cb");                                                        
    cmd.overload();                                                          
    cmd.setCallback((cmd, ori, out, res) => {
        if (ori.player == null) {                                         
            return out.error("该命令只能由玩家执行！");
        }
        else {
            if (ori.player.isOP()) {                       //再次验证，防execute绕过权限组
                CheckBagForm(ori.player);
                return;
            }
            else {
                return out.error("你没有权限执行此命令！");
            }                                                        
        }
    });
    cmd.setup();                                                            
});

function CheckBagForm(pl) {      
    let fm = mc.newSimpleForm();
    fm.setTitle(`查询玩家背包`);
    fm.setContent(`请选择查询模式`);
    fm.addButton(`查询在线玩家`);
    fm.addButton(`查询全部玩家`);
    fm.addButton(`搜索玩家并查询`);
    fm.addButton(`恢复上一次查包前背包`);
    pl.sendForm(fm, (pl, id) => {
        switch (id) {
            case 0:
                CheckOnlinePlayers(pl); 
                break;
            case 1:
                CheckAllPlayers(pl);   
                break;
            case 2:
                SearchForm(pl);
                break;
            case 3:
                ResumeBag(pl); 
                break;
            default:
                break;
        }
    });
}

function CheckAllPlayers(pl) { 
    let fm = mc.newSimpleForm();
    let pldata = data.getAllPlayerInfo();
    fm.setTitle(`查询全部玩家背包`);
    fm.setContent(`请选择你要查询的玩家`)
    pldata.forEach((player) => {
        fm.addButton(player.name); 
    });
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) { 
            CheckBagForm(pl);
        }
        else {
            if (pldata[arg].uuid == pl.uuid) {
                pl.tell(`§l§e[LLSECheckBag] §r§c自己查自己好玩吗？`);
                return;
            }
            CheckPlayer(pl, pldata[arg]); 
            return;
        }
    });
}

function CheckOnlinePlayers(pl) {
    let fm = mc.newSimpleForm();
    fm.setTitle(`查询在线玩家背包`);
    fm.setContent(`请选择你要查询的玩家`)
    let OnlinePlayers = mc.getOnlinePlayers();
    OnlinePlayers.forEach((player) => {
        fm.addButton(player.realName);
    });
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) {
            CheckBagForm(pl);
        }
        else {
            if (OnlinePlayers[arg].uuid == pl.uuid) {
                pl.tell(`§l§e[LLSECheckBag] §r§c自己查自己好玩吗？`);
                return;
            }
            if (OnlinePlayers[arg].uuid != undefined) {
                CheckPlayer(pl, SearchData(OnlinePlayers[arg]));
            }
            else {
                pl.tell(`§l§e[LLSECheckBag] §r§c目标玩家已离线，请使用查询全部玩家来查询离线玩家背包。`);
            }
            return;
        }
    });
}

function SearchData(pl) {
    let pldata = data.getAllPlayerInfo();
    for(let i in pldata) {
        if (pl.uuid == pldata[i].uuid) { 
            return pldata[i];
        }
    }
}

function CheckPlayer(pl, pldt) {    
    let fm = mc.newSimpleForm();
    fm.setTitle(`查询玩家背包`);
    fm.setContent(`已选择玩家 ${pldt.name}\n请选择你要进行的操作`)
    fm.addButton(`将玩家背包复制到自身背包`);  
    fm.addButton(`用自身背包覆盖玩家背包`); 
    fm.addButton(`删除玩家全部数据`); 
    pl.sendForm(fm, (pl, arg) => {
        switch (arg) {
            case 0:
                CopyBag(pl, pldt);
                break;
            case 1:
                pl.sendModalForm("覆盖玩家背包",`你确定要覆盖玩家 ${pldt.name} 的背包吗？\n\n本操作不可撤销！`,"确认覆盖","我再想想",(pl,arg) => {
                    if (arg == 1) {
                        WriteBag(pl, pldt); 
                    }
                    else {
                        CheckPlayer(pl, pldt);
                    }
                });
                break;
            case 2:
                pl.sendModalForm("删除玩家全部数据",`你确定要删除玩家 ${pldt.name} 的全部数据吗？\n本操作不可撤销！`,"确认删除","我再想想",(pl,arg) => {
                    if (arg == 1) {
                        if (mc.getPlayer(pldt.xuid) == null) {
                            mc.deletePlayerNbt(pldt.uuid);
                            pl.tell("§l§e[LLSECheckBag] §r§a操作成功！");
                        }
                        else {
                            pl.tell("§l§e[LLSECheckBag] §r§c操作失败！目标玩家在线，无法删除数据！");
                            CheckBagForm(pl);
                        }
                    }
                    else {
                        CheckPlayer(pl, pldt);
                    }
                });
                break;
            default:
                CheckBagForm(pl);
                break;
        }
    });
}

function SaveBag(pl) {
    let plsnbt = mc.getPlayerNbt(pl.uuid).toSNBT();
    File.writeTo(`./plugins/LLSECheckBag/db/${pl.uuid}`, plsnbt);
}

function CopyBag(pl, pldt) {
    SaveBag(pl);
    let plnbt = mc.getPlayerNbt(pldt.uuid);
    mc.setPlayerNbtTags(pl.uuid, plnbt, ["Offhand", "Inventory", "Armor", "EnderChestInventory"]);
    pl.tell("§l§e[LLSECheckBag] §r§a操作成功！");
}

function WriteBag(pl, pldt) {
    let plnbt = mc.getPlayerNbt(pl.uuid);
    mc.setPlayerNbtTags(pldt.uuid, plnbt, ["Offhand", "Inventory", "Armor", "EnderChestInventory"]);
    pl.tell("§l§e[LLSECheckBag] §r§a操作成功！");
}

function ResumeBag(pl) {
    let plsnbt = File.readFrom(`./plugins/LLSECheckBag/db/${pl.uuid}`);
    if (plsnbt == null) {
        pl.tell(`§l§e[LLSECheckBag] §r§c无上次背包数据`);
    }
    else {
        let plnbt = NBT.parseSNBT(plsnbt);
        mc.setPlayerNbtTags(pl.uuid, plnbt, ["Offhand", "Inventory", "Armor", "EnderChestInventory"]);
    }
}

function SearchForm(pl) {
    let fm = mc.newCustomForm();
    fm.setTitle(`搜索玩家`);
    fm.addLabel(`输入玩家名来搜索并查询玩家背包`);
    fm.addInput(`你要查询的玩家的真实名字`, `请输入玩家真实名字`);
    fm.addDropdown(`请选择搜索模式`, ["模糊搜索", "精准搜索"], 0);
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) {
            CheckBagForm(pl);
            return;
        }
        switch (arg[2]) {
            case 0:
                let list = GenSearchList(arg[1]);
                if (arg[1] == "") {
                    pl.sendModalForm("请输入内容",`你没有输入任何内容！\n请重新输入！`,"重新输入","退出查包",(pl,arg) => {
                        if (arg == 1) {
                            SearchForm(pl);
                        }
                    });
                }
                else if (list.length == 0) {
                    pl.sendModalForm("没有找到匹配的玩家",`没有找到与你输入结果匹配的玩家！`,"重新输入","退出查包",(pl,arg) => {
                        if (arg == 1) {
                            SearchForm(pl);
                        }
                    });
                }
                else {
                    SearchListForm(pl, list);
                }
                break;
            case 1:
                if (arg[1] == "") {
                    pl.sendModalForm("请输入内容",`你没有输入任何内容！\n请重新输入！`,"重新输入","退出查包",(pl,arg) => {
                        if (arg == 1) {
                            SearchForm(pl);
                        }
                    });
                }
                else if (GetDB(arg[1]) == null) {
                    pl.sendModalForm("玩家不存在",`你要查询的玩家 ${arg[1]} 不存在！\n\n请确保你输入了正确的玩家真实名字并确保大小写正确！`,"重新输入","退出查包",(pl,arg) => {
                        if (arg == 1) {
                            SearchForm(pl);
                        }
                    });
                }
                else {
                    let pldt = GetDB(arg[1]);
                    CheckPlayer(pl, pldt);
                }
                break;
            default:
                CheckBagForm(pl);
                return;
        }
    });
}

function GetDB(realName) {
    let pldata = data.getAllPlayerInfo();
    for(let i in pldata) {
        if (realName == pldata[i].name) { 
            return pldata[i];
        }
    }
    return null;
}

function GenSearchList(key) {
    let pldata = data.getAllPlayerInfo();
    let res = [];
    for(let i in pldata) {
        if (pldata[i].name.includes(key)) { 
            res.push(pldata[i]);
        }
    }
    return res;
}

function SearchListForm(pl, pldata) {
    let fm = mc.newSimpleForm();
    fm.setTitle(`查询全部玩家背包`);
    fm.setContent(`搜索结果如下\n请选择你要查询的玩家`)
    pldata.forEach((player) => {
        fm.addButton(player.name);
    });
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) {
            CheckBagForm(pl);
        }
        else {
            if (pldata[arg].uuid == pl.uuid) {
                pl.tell(`§l§e[LLSECheckBag] §r§c自己查自己好玩吗？`);
                return;
            }
            CheckPlayer(pl, pldata[arg]);
            return;
        }
    });
}