ll.registerPlugin("AntiSpam", "聊天管理插件",
{ "major": 1, "minor": 1, "revision": 0 }, {});

logger.setTitle('AntiSpam');
logger.setConsole(true); 

const version = '1.1.0';

const config_path = "./plugins/AntiSpam/config.json"

const config_file = {ConfigVersion:"1.1.0",BasicConfig:{Commands:["w","tell","msg","me"],SpamWords:["@e"],MaxMessageLength:50},SpamPunish:{MuteTime:30,MuteReason:"恶意刷屏",UseCustomPunish:false,CustomPunishCommand:""},Language:{kickmsg:"你因为{reason}被踢出游戏"}}

const config = data.openConfig(config_path, "json", JSON.stringify(config_file))

const PunishConfig = config.get("SpamPunish")
const Basic = config.get("BasicConfig")
const lang = config.get("Language")
const ConfVersion = config.get("ConfigVersion")

if(ConfVersion != version){
    logger.warn("The language file is out-dated, running auto update.")
    File.delete(config_path)
    new JsonConfigFile(config_path,config_file)
}

if(PunishConfig.UseCustomPunish == false){
    if(ll.require("Mute.js") == false){
        mc.runcmdEx('ll unload AntiSpam')
        throw new Error("未检测到前置依赖插件 Mute.js ，插件无法正常使用。\n                请安装前置插件或关闭插件内置刷屏处罚系统。\n                Closing AntiSpam...")
    }
    else{
        const MuteAPI = {
            MutePlayer:ll.import("MutePlayer","MutePlayer"),
            UnmutePlayer:ll.import("UnmutePlayer","UnmutePlayer"),
            CheckMute:ll.import("IfPlayerisMuted","IfPlayerisMuted")
        }

        function DefaultPunish(pl) {
            if(MuteAPI.CheckMute(pl) == true){
                pl.kick(lang.kickmsg
                    .replace("{reason}", PunishConfig.MuteReason))
            }
            else{
                MuteAPI.MutePlayer(pl,PunishConfig.MuteTime,PunishConfig.MuteReason)
            }
        }        
        
        logger.info('Current Version: ', version)
        logger.info('Author: Tsubasa6848')
        logger.info('AntiSpam Plugin Loaded!')
        
        mc.listen("onPlayerCmd",function(pl,cmd){
            for(let t = 0; t <= Basic.Commands.length-1;t++){
                if(cmd.includes(Basic.Commands[t])){
                    for(let i = 0; i <= Basic.SpamWords.length-1; i++){
                        if(cmd.includes(Basic.SpamWords[i])){
                            DefaultPunish(pl)
                            return false
                        }
                    }
                };
            }
        });
        
        mc.listen("onChat", (pl,msg) => {
            for(let t = 0; t <= Basic.Commands.length-1;t++){
                if(msg.includes(Basic.Commands[t])){
                    for(let i = 0; i <= Basic.SpamWords.length-1; i++){
                        if(msg.includes(Basic.SpamWords[i])){
                            DefaultPunish(pl)
                            return false
                        }
                    }
                };
            }
            let message = Array.from(msg)
            if(message.length >= Basic.MaxMessageLength){
                DefaultPunish(pl)
            }
        });
    }
}
else if(PunishConfig.UseCustomPunish == true){
    logger.info('Current Version: ', version)
    logger.info('Author: Tsubasa6848')
    logger.info('AntiSpam Plugin Loaded!')

    mc.listen("onPlayerCmd",function(pl,cmd){
        for(let t = 0; t <= Basic.Commands.length-1;t++){
            if(cmd.includes(Basic.Commands[t])){
                for(let i = 0; i <= Basic.SpamWords.length-1; i++){
                    if(cmd.includes(Basic.SpamWords[i])){
                        mc.runcmdEx(PunishConfig.CustomPunishCommand
                            .replace("{player}", pl.realName))
                        return false
                    }
                }
            };
        }
    });
    
    mc.listen("onChat", (pl,msg) => {
        for(let t = 0; t <= Basic.Commands.length-1;t++){
            if(msg.includes(Basic.Commands[t])){
                for(let i = 0; i <= Basic.SpamWords.length-1; i++){
                    if(msg.includes(Basic.SpamWords[i])){
                        mc.runcmdEx(PunishConfig.CustomPunishCommand
                            .replace("{player}", pl.realName))
                        return false
                    }
                }
            };
        }
        let message = Array.from(msg)
        if(message.length >= Basic.MaxMessageLength){
            mc.runcmdEx(PunishConfig.CustomPunishCommand
                .replace("{player}", pl.realName))
        }
    });
}