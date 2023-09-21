ll.registerPlugin(
    "ExperimentsEditor",
    "Edit World Experiments",
    [1, 0, 0],
    { "Author": "Tsubasa6848" }
);

//检测前置插件 GMLib 是否存在
if (ll.hasExported("GMLib_ModAPI", "setExperimentEnabled")) {
    //检查版本，不同的版本有不同的实验性 ID
    if (mc.getBDSVersion().startsWith("v1.20.1") && mc.getBDSVersion() != "v1.20.1") {
        //导入API
        const GMLib = {
            setExperimentEnabled: ll.import("GMLib_ModAPI", "setExperimentEnabled"),
            getExperimentEnabled: ll.import("GMLib_ModAPI", "getExperimentEnabled")
        };

        function Arg2ID(arg) {
            switch (arg) {
                case 1:
                    return 5;
                case 2:
                    return 7;
                case 3:
                    return 8;
                case 4:
                    return 9;
                case 5:
                    return 10;
                case 6:
                    return 11;
                case 7:
                    return 13;
                case 8:
                    return 15;
                default:
                    return 0;
            }
        };

        function Arg2Name(arg) {
            switch (arg) {
                case 1:
                    return "短暂潜行和爬行";
                case 2:
                    return "假日创造者功能";
                case 3:
                    return "自定义生物群系";
                case 4:
                    return "即将推出的创作者功能";
                case 5:
                    return "测试版 API";
                case 6:
                    return "Molang 功能";
                case 7:
                    return "实验相机";
                case 8:
                    return "配方解锁";
                default:
                    return "未知（不存在的实验性玩法）";
            }
        };

        function MainForm(pl) {
            let fm = mc.newCustomForm();
            fm.setTitle("实验性玩法");
            fm.addLabel("修改实验性玩法设置");
            for (let i = 1; i <= 8; i++) {
                fm.addSwitch(Arg2Name(i), GMLib.getExperimentEnabled(Arg2ID(i)));
            }
            pl.sendForm(fm, (pl, arg) => {
                if (arg == null) {
                    pl.tell("§c表单已关闭")
                }
                pl.sendModalForm("实验性玩法", "\n你确认要修改实验性玩法？\n\n不建议随意关闭一个已经启用的实验性玩法，这可能引发Addons错误和造成存档损坏。\n\n请谨慎操作。", "确认修改", "我再想想", (pl, res) => {
                    if (res == true) {
                        for (let i = 1; i <= 8; i++) {
                            GMLib.setExperimentEnabled(Arg2ID(i), arg[i]);
                        }
                        pl.tell("§a已成功修改实验性玩法！\n请退出并重新连接服务器来保证客户端实验性玩法生效！\n部分实验性内容可能需要重启服务器才能正常生效！");
                    }
                    else {
                        MainForm(pl);
                    }
                });
            });
        };

        mc.listen("onServerStarted", () => {
            let cmd = mc.newCommand("experiments", "编辑实验性玩法", PermType.GameMasters);
            cmd.overload();
            cmd.setCallback((cmd, ori, out, res) => {
                if (ori.player == null) {
                    return out.error("该命令只能由玩家执行！");
                }
                else {
                    if (ori.player.isOP()) {                       //再次验证，防execute绕过权限组
                        MainForm(ori.player);
                        return;
                    }
                    else {
                        return out.error("你没有权限使用此命令！");
                    }
                }
            });
            cmd.setup();
        });
    }
    else {
        logger.error("BDS 版本不匹配！ 本插件支持 BDS - 1.20.1x");
        logger.error("由于实验性玩法在每个版本有所变化，请使用正确的插件版本");
        logger.error("如果强行加载这会导致无法修改到指定的实验性项目（实验性 ID 可能有所变化）");
    }
}
else {
    logger.error("无法注册合成表！未找到前置插件 GMLib 或 GMLib 版本过低！");
    logger.error("请安装前置插件 GMLib 1.2.0 以上版本！");
};