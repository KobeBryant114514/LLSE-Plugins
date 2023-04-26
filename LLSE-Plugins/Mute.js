ll.registerPlugin("Mute", "禁言插件",
{ "major": 1, "minor": 5, "revision": 0 }, {});

logger.setTitle("Mute");
logger.setConsole(true); 

const version = "1.5.0";
const data_path = "./plugins/Mute/data.json";
const config_path = "./plugins/Mute/config.json";
const lang_path = "./plugins/Mute/language/" ;
const Chinese = JSON.stringify({
    "language_version":"1.5.0",
    "language":{
        "cmd_mute":"禁言玩家。",
        "cmd_mutegui":"打开禁言玩家GUI。",
        "cmd_unmute":"解除玩家禁言。",
        "error_no":"没有与选择器匹配的目标",
        "error_too_many":"选择器选择的目标过多！",
        "error_muted":"无法禁言该玩家，该玩家已经被禁言",
        "error_not_mute":"该玩家未被禁言！",
        "error_not_player":"该命令只能由玩家执行！",
        "player":"玩家",
        "success_mute":"已被成功禁言",
        "success_unmute":"已被解除禁言",
        "mute_timeout":"的禁言已结束",
        "gui_mute":"禁言菜单",
        "gui_select":"请选择目标玩家",
        "gui_opt":"请选择你要进行操作",
        "gui_opt_mute":"禁言玩家",
        "gui_opt_unmute":"解除玩家禁言",
        "gui_no_player":"你没有选择目标玩家！",
        "gui_close":"禁言菜单已关闭，没有收到任何操作！",
        "gui_no_mode":"你没有选择目标操作！",
        "gui_reason":"请输入禁言原因",
        "gui_muteplayer":"您正在禁言玩家 ",
        "gui_time":"请输入禁言时长（分钟）",
        "gui_reason_default":"禁言原因（可不填）",
        "gui_time_default":"禁言时长（不填默认永久禁言）",
        "gui_time_error":"禁言时长必须是正整数",
        "error":"未知错误"
    }
});

if(!File.exists(lang_path + "/zh-CN.json")){
    new JsonConfigFile(lang_path + "/zh-CN.json",Chinese);
};

const config_file = {language:"zh-CN"};
const defaultConfig = {Banned_Commands:["w","tell","msg","me"],mutelist:[]};
const config = data.openConfig(data_path, "json", JSON.stringify(defaultConfig));
const lang_choose = data.openConfig(config_path, "json", JSON.stringify(config_file));
const select_language = lang_choose.get("language");
const langdata = data.openConfig(lang_path + select_language + ".json", "json");
const lang = langdata.get("language");
const conf = data.openConfig("./plugins/Mute/data.json", "json", "{}");
const lang_version = langdata.get("language_version");

if(lang_version != "1.5.0" || lang_version == undefined){
    if(select_language == "zh-CN"){logger.warn("语言文件已过时，正在自动更新。");}
    else{logger.warn("The language file is out-dated, auto updating.");}
    File.delete(lang_path + "/zh-CN.json");
    new JsonConfigFile(lang_path + "/zh-CN.json",Chinese);
}

if(select_language == "zh-CN"){
    logger.info("当前版本: ", version);
    logger.info("作者: Tsubasa6848");
    logger.info("Mute禁言插件 加载成功!");
}
else{
    logger.info("Current Version: ", version);
    logger.info("Plugin Author: Tsubasa6848");
    logger.info("Mute has been Successfully Loaded!");
}

mc.listen("onServerStarted", () => {
    let cmd = mc.newCommand("mute",lang.cmd_mute, PermType.GameMasters);
    cmd.mandatory("player", ParamType.Player);
    cmd.optional("minutes",ParamType.Int)
    cmd.optional("reason",ParamType.String)
    cmd.overload(["player","minutes","reason"]);
    cmd.overload(["player","reason"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        if(res.player.length == 0){
            return out.error(lang.error_no);
        }
        else if(res.player.length >= 2){
            return out.error(lang.error_too_many);
        }
        else{
            let pl = res.player[0]
            if(MutePlayer(pl, res.minutes, res.reason)) return out.success(lang.player+pl.realName+lang.success_mute);
            else return out.error(lang.error_muted);
        };
    });
    cmd.setup();
});

mc.listen("onServerStarted", () => {
    let cmd = mc.newCommand("mutegui",lang.cmd_mutegui, PermType.GameMasters);
    cmd.overload([]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        if(_ori.player == null){
            return out.error(lang.error_not_player);
        }
        else{
            MuteGui(_ori.player);
            return;
        }
    });
    cmd.setup();
});

mc.listen("onServerStarted", () => {
    let cmd = mc.newCommand("unmute",lang.cmd_unmute, PermType.GameMasters);
    cmd.mandatory("player", ParamType.Player);
    cmd.overload(["player"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        if(res.player.length == 0){
            return out.error(lang.error_no);
        }
        else if(res.player.length >= 2){
            return out.error(lang.error_too_many);
        }
        else{
            let pl = res.player[0];
            if(UnmutePlayer(pl)) return out.success(lang.player+pl.realName+lang.success_unmute);
            else return out.error(lang.error_not_mute);
        };
    });
    cmd.setup();
});

function MuteGui(pl) {
    let online = mc.getOnlinePlayers();
    let onlineplayers = new Array(online.length);
        for(let i = 0;i <= online.length-1; i++){
            onlineplayers[i] = online[i].realName;
        }
    let fm = mc.newCustomForm();
    let opt = [lang.gui_opt_mute,lang.gui_opt_unmute];
    fm.setTitle(lang.gui_mute);
    fm.addDropdown(lang.gui_select,onlineplayers);
    fm.addDropdown(lang.gui_opt,opt);
    pl.sendForm(fm,(pl,data) => {
        if(data == null){
            pl.sendText(lang.gui_close);
            return;
        }
        else if(data[0] == undefined){
            pl.sendText(lang.gui_no_player);
            return;
        }
        else if(data[1] == undefined){
            pl.sendText(lang.gui_no_mode);
            return;
        }
        else if(data[1] == 0){
            let player = online[data[0]];
            if(IfPlayerisMuted(player) == false){
                MuteAddGui(pl,player);
            }
            else{
                pl.sendText(lang.error_muted);
                return;
            }
        }
        else if(data[1] == 1){
            if(UnmutePlayer(online[data[0]]) == true){
                pl.sendText(lang.player+online[data[0]].realName+lang.success_unmute);
                return;
            }
            else{
                pl.sendText(lang.error_not_mute);
                return;
            }
        }
    })
}

function MuteAddGui(pl,player) {
    let fm = mc.newCustomForm();
    fm.setTitle(lang.gui_mute);
    fm.addLabel(lang.gui_muteplayer + player.realName);
    fm.addInput(lang.gui_reason,lang.gui_reason_default);
    fm.addInput(lang.gui_time,lang.gui_time_default);
    pl.sendForm(fm,(pl,data) => {
        if(data == null){
            pl.sendText(lang.gui_close);
            return;
        }
        else if(!isNaN(parseFloat(data[2])) && isFinite(data[2]) == true){
            if(data[2] % 1 === 0){
                if(data[2] >=0){
                    if(MutePlayer(player,data[2],data[1]) == true){
                        pl.sendText(lang.player+player.realName+lang.success_mute);
                        return;
                    }
                    else{
                        pl.sendText(lang.error_muted);
                        return;
                    }
                }
                else{
                    pl.sendText(lang.gui_time_error);
                    return;
                }
            }
            else{
                pl.sendText(lang.gui_time_error);
                return;
            }
        }
        else{
            pl.sendText(lang.gui_time_error);
            return;
        }
    })
}

function IfPlayerisMuted(pl) {
    let mutelist = conf.get("mutelist", []);
    for (var i in mutelist) {
        if (mutelist[i].name == pl.realName || mutelist[i].xuid == pl.xuid) {
            return true;
        }
    }
    return false;
}

ll.export(IfPlayerisMuted,"Mute","IfPlayerisMuted");

function MutePlayer(pl, minutes, reason) {
    pl.setAbility(15,true);
    let name = pl.realName;
    while (name.startsWith("\""))
        name = name.substr(1);
    while (name.endsWith("\""))
        name = name.substr(0, name.length - 1);
    let muteInfo = {};
    if (pl) {
        muteInfo.name = pl.realName;
        muteInfo.xuid = pl.xuid;
    }
    if (minutes) {
        muteInfo.endTime = FormatDate(new Date().getTime() + minutes * 60000);
    }
    if (reason) {
        muteInfo.reason = reason;
    }
    let mutelist = conf.get("mutelist", []);
    for (var i in mutelist) {
        if (mutelist[i].name == name) {
            if (muteInfo.xuid)
                mutelist[i].xuid = muteInfo.xuid;
            if (muteInfo.endTime)
                mutelist[i].endTime = muteInfo.endTime;
            if (muteInfo.reason)
                mutelist[i].reason = muteInfo.reason;
            conf.set("mutelist", mutelist);
            return false;
        }
    }
    mutelist.push(muteInfo);
    conf.set("mutelist", mutelist);
    return true;
}

ll.export(MutePlayer,"Mute","MutePlayer");

function UnmutePlayer(pl) {
    pl.setAbility(15,false);
    let mutelist = conf.get("mutelist", []);
    for (var i in mutelist) {
        if (mutelist[i].name == pl.realName || mutelist[i].xuid == pl.xuid) {
            mutelist.splice(i, 1);
            conf.set("mutelist", mutelist);
            return true;
        }
    }
    return false;
}

ll.export(UnmutePlayer,"Mute","UnmutePlayer")

function FormatDate(value) {
    var date = new Date(value);
    var y = date.getFullYear(),
        m = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        i = date.getMinutes(),
        s = date.getSeconds();
    if (m < 10) { m = "0" + m; }
    if (d < 10) { d = "0" + d; }
    if (h < 10) { h = "0" + h; }
    if (i < 10) { i = "0" + i; }
    if (s < 10) { s = "0" + s; }
    var time = y + "-" + m + "-" + d + " " + h + ":" + i + ":" + s;
    return time;
}

setInterval(function () {
    let mutelist = conf.get("mutelist", []);
    for (let i in mutelist) {
        if (new Date(mutelist[i].endTime).getTime() <= new Date().getTime()) {
            logger.warn(lang.player+mutelist[i].name+lang.mute_timeout);
            mutelist.splice(i, 1);
            conf.set("mutelist", mutelist);
        }
    }
}, 60000);

mc.listen("onPlayerCmd",function(pl,cmd){
    for(let t = 0; t < config.get("Banned_Commands").length;t++){
        if(cmd.includes(config.get("Banned_Commands")[t])){
            let mutelist = conf.get("mutelist", []);
            for (var i in mutelist) {
                if (mutelist[i].name == pl.realName || mutelist[i].xuid == pl.xuid) {
                    if(mutelist[i].endTime == null && mutelist[i].reason == null){
                        pl.tell(lang.return_muted);
                        return false;
                    }
                    else if(mutelist[i].endTime != null && mutelist[i].reason == null){
                        pl.tell(lang.return_muted+"\n"+lang.return_endtime +mutelist[i].endTime);
                        return false;
                    }
                    else if(mutelist[i].endTime != null && mutelist[i].reason != null){
                        pl.tell(lang.return_muted+lang.return_reason+mutelist[i].reason+"\n"+lang.return_endtime +mutelist[i].endTime);
                        return false;
                    }
                    else if(mutelist[i].endTime == null && mutelist[i].reason != null){
                        pl.tell(lang.return_muted+lang.return_reason+mutelist[i].reason);
                        return false;
                    }
                    else{
                        pl.tell(lang.return_muted);
                        return false;
                    }
                }
            }
        }
    }
});

mc.listen("onJoin", (pl) => {
    if(IfPlayerisMuted(pl) == true){
        pl.setAbility(15,true);
    }
})