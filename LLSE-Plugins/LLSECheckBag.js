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
    [2,2,2],
    {}
); 

const Version = "2.2.2";
const langpath = "./plugins/LLSECheckBag/language.json";   //语言文件路径
const defaultlanguage = JSON.stringify({               //默认语言文件
    "command.description":"查询玩家背包",
    "command.playeronly":"该命令只能由玩家执行！",
    "command.checkonlineplayers":"查询在线玩家背包",
    "command.checkallllayers":"查询全部玩家背包",
    "command.error":"你没有权限执行此命令！",
    "command.select.mode":"请选择查询模式",
    "command.search.players.queries":"搜索玩家并查询",
    "command.select.query.players":"请选择你要查询的玩家",
    "command.recover.backpack":"恢复上一次查包前背包",
    "command.view.target.backpack":"将玩家背包复制到自身背包",
    "command.cover.target.backpack":"用自身背包覆盖玩家背包",
    "command.checkplayer.sbtitle":"已选择玩家 {1}请选择你要进行的操作",           //引入变量部分
    "command.search.players":"搜索玩家",
    "command.delete.all.target.data":"删除玩家全部数据",
    "command.operation.succeeded":"§l§e[LLSECheckBag] §r§b操作成功",
    "command.operation.failed":"操作失败",
    "command.unable.to.query.yourself":"§l§e[LLSECheckBag] §r§c自己查自己好玩吗？",
    "command.search.complete.please.select":"搜索结果如下请选择你要查询的玩家",
    "command.please.enter.content":"请输入内容",
    "command.target.loss":"§l§e[LLSECheckBag] §r§c目标玩家已离线，请使用查询全部玩家来查询离线玩家背包",
    "command.confirm.override":"你确定要覆盖玩家 {1} 的背包吗？",
    "command.confirm.target.deletion":"你确定要删除玩家 {1} 的全部数据吗？",
    "command.confirm":"确认",
    "command.no":"我再想想",
    "command.target.online.deletion.failed":"§l§e[LLSECheckBag] §r§c操作失败！目标玩家在线，无法删除数据！",
    "error.no.data":"§l§e[LLSECheckBag] §r§c无上次背包数据",
    "error.re.enter":"重新输入",
    "error.please.enter.the.content":"你没有输入任何内容请重新输入！",
    "command.quitcheckbag":"退出查包",
    "error.query.yielded.no.results":"没有找到与你输入结果匹配的玩家！",
    "command.query.by.name":"输入玩家名来搜索并查询玩家背包",
    "command.enter.name":"你要查询的玩家的真实名字",
    "command.please.select.a.search.mode":"请选择搜索模式",
    "command.fuzzy.search":"模糊搜索",
    "command.precise.search":"精准搜索",
    "data.notfound":"§l§e[LLSECheckBag] §r§c目标玩家没有数据"
})
const lang = data.openConfig(langpath, "json", defaultlanguage);    //打开语言文件

function tr(string) { 
    let Str = lang.get(string);           //读取语言
    if (Str != undefined) {
        return Str;
    }
    else return "Language File Not Found! \nPlease delete old language file and restart to generate a new one."
}

if (File.exists("./plugins/LLSECheckBag/data.json")) {                  //旧的数据库已弃用，删除数据库。
    File.delete("./plugins/LLSECheckBag/data.json");
};

logger.info("加载成功，作者： Tsubasa6848、铭记mingji");
logger.info("当前版本： " + Version);

mc.listen("onServerStarted", () => {                                           
    let cmd = mc.newCommand("checkbag", tr("command.description"), PermType.GameMasters);  
    cmd.setAlias("cb");                                                        
    cmd.overload();                                                          
    cmd.setCallback((cmd, ori, out, res) => {
        if (ori.player == null) {                                         
            return out.error(tr("command.playeronly"));
        }
        else {
            if (ori.player.isOP()) {                       //再次验证，防execute绕过权限组
                CheckBagForm(ori.player);
                return;
            }
            else {
                return out.error(tr("command.error"));
            }                                                        
        }
    });
    cmd.setup();                                                            
});

function CheckBagForm(pl) {      
    let fm = mc.newSimpleForm();
    fm.setTitle(tr("command.description"));
    fm.setContent(tr("command.select.mode"));
    fm.addButton(tr("command.checkonlineplayers"));
    fm.addButton(tr("command.checkallllayers"));
    fm.addButton(tr("command.search.players.queries"));
    fm.addButton(tr("command.recover.backpack"));
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
                ResumeBag(pl, true); 
                break;
            default:
                break;
        }
    });
}

function CheckAllPlayers(pl) { 
    let fm = mc.newSimpleForm();
    let pldata = data.getAllPlayerInfo();
    fm.setTitle(tr("command.checkallllayers"));
    fm.setContent(tr("command.select.query.players"))
    pldata.forEach((player) => {
        fm.addButton(player.name); 
    });
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) { 
            CheckBagForm(pl);
        }
        else {
            if (pldata[arg].uuid == pl.uuid) {
                pl.tell(tr("command.unable.to.query.yourself"));
                return;
            }
            CheckPlayer(pl, pldata[arg]); 
            return;
        }
    });
}

function CheckOnlinePlayers(pl) {
    let fm = mc.newSimpleForm();
    fm.setTitle(tr("command.checkonlineplayers"));
    fm.setContent(tr("command.select.query.players"))
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
                pl.tell(tr("command.unable.to.query.yourself"));
                return;
            }
            if (OnlinePlayers[arg].uuid != undefined) {
                CheckPlayer(pl, SearchData(OnlinePlayers[arg]));
            }
            else {
                pl.tell(tr("command.target.loss"));
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
    fm.setTitle(tr("command.description"));
    fm.setContent(tr("command.checkplayer.sbtitle").replace("{1}", pldt.name))
    fm.addButton(tr("command.view.target.backpack"));  
    fm.addButton(tr("command.cover.target.backpack")); 
    fm.addButton(tr("command.delete.all.target.data")); 
    pl.sendForm(fm, (pl, arg) => {
        switch (arg) {
            case 0:
                CopyBag(pl, pldt);
                break;
            case 1:
                pl.sendModalForm(tr("command.cover.target.backpack"),tr("command.confirm.override").replace("{1}", pldt.name),tr("command.confirm"),tr("command.no"),(pl,arg) => {
                    if (arg == 1) {
                        WriteBag(pl, pldt); 
                    }
                    else {
                        CheckPlayer(pl, pldt);
                    }
                });
                break;
            case 2:
                pl.sendModalForm(tr("command.delete.all.target.data"),tr("command.confirm.target.deletion").replace("{1}", pldt.name),tr("command.confirm"),tr("command.no"),(pl,arg) => {
                    if (arg == 1) {
                        let plnbt = mc.getPlayerNbt(pldt.uuid);
                        if (plnbt == null) {
                            pl.tell(tr("data.notfound"));
                            return;
                        }
                        if (mc.getPlayer(pldt.xuid) == null) {
                            mc.deletePlayerNbt(pldt.uuid);
                            pl.tell(tr("command.operation.succeeded"));
                        }
                        else {
                            pl.tell(tr("command.target.online.deletion.failed"));
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
    if (File.exists(`./plugins/LLSECheckBag/db/${pl.uuid}`)) {
        ResumeBag(pl, false);
    }
    SaveBag(pl);
    let plnbt = mc.getPlayerNbt(pldt.uuid);
    if (plnbt == null) {
        pl.tell(tr("data.notfound"));
        return;
    } 
    mc.setPlayerNbtTags(pl.uuid, plnbt, ["Offhand", "Inventory", "Armor", "EnderChestInventory"]);
    pl.tell(tr("command.operation.succeeded"));
}

function WriteBag(pl, pldt) {
    let plnbt = mc.getPlayerNbt(pl.uuid);
    if (mc.getPlayerNbt(pldt.uuid) == null) {
        pl.tell(tr("data.notfound"));
        return;
    } 
    mc.setPlayerNbtTags(pldt.uuid, plnbt, ["Offhand", "Inventory", "Armor", "EnderChestInventory"]);
    pl.tell(tr("command.operation.succeeded"));
}

function ResumeBag(pl, lg) {
    let plsnbt = File.readFrom(`./plugins/LLSECheckBag/db/${pl.uuid}`);
    if (plsnbt == undefined && lg == true) {
        pl.tell(tr("error.no.data"));
    }
    else {
        let plnbt = NBT.parseSNBT(plsnbt);
        mc.setPlayerNbtTags(pl.uuid, plnbt, ["Offhand", "Inventory", "Armor", "EnderChestInventory"]);
        File.delete(`./plugins/LLSECheckBag/db/${pl.uuid}`);
    }
}

function SearchForm(pl) {
    let fm = mc.newCustomForm();
    fm.setTitle(tr("command.search.players"));
    fm.addLabel(tr("command.search.players.queries"));
    fm.addInput(tr("command.enter.name"), tr("command.please.enter.content"));
    fm.addDropdown(tr("command.please.select.a.search.mode"), [tr("command.fuzzy.search"), tr("command.precise.search")], 0);
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) {
            CheckBagForm(pl);
            return;
        }
        switch (arg[2]) {
            case 0:
                let list = GenSearchList(arg[1]);
                if (arg[1] == "") {
                    pl.sendModalForm(tr("command.please.enter.content"),tr("error.please.enter.the.content"),tr("error.re.enter"),tr("command.quitcheckbag"),(pl,arg) => {
                        if (arg == 1) {
                            SearchForm(pl);
                        }
                    });
                }
                else if (list.length == 0) {
                    pl.sendModalForm(tr("error.query.yielded.no.results"),tr("error.please.enter.the.content"),tr("error.re.enter"),tr("command.quitcheckbag"),(pl,arg) => {
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
                    pl.sendModalForm(tr("command.please.enter.content"),tr("error.please.enter.the.content"),tr("error.re.enter"),tr("command.quitcheckbag"),(pl,arg) => {
                        if (arg == 1) {
                            SearchForm(pl);
                        }
                    });
                }
                else if (GetDB(arg[1]) == null) {
                    pl.sendModalForm(tr("command.operation.failed"),tr("error.query.yielded.no.results"),tr("error.re.enter"),tr("command.quitcheckbag"),(pl,arg) => {
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
    fm.setTitle(tr("command.checkallllayers"));
    fm.setContent(tr("command.search.complete.please.select"))
    pldata.forEach((player) => {
        fm.addButton(player.name);
    });
    pl.sendForm(fm, (pl, arg) => {
        if (arg == null) {
            CheckBagForm(pl);
        }
        else {
            if (pldata[arg].uuid == pl.uuid) {
                pl.tell(tr("command.unable.to.query.yourself"));
                return;
            }
            CheckPlayer(pl, pldata[arg]);
            return;
        }
    });
}