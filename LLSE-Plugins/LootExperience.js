ll.registerPlugin(
    /* name */ "LootExperience",
    /* introduction */ "死亡清空经验",
    /* version */ [1,0,1],
    /* otherInformation */ {}
); 


mc.listen("onPlayerDie", (pl,sc) => {
    pl.setTotalExperience(0);
})