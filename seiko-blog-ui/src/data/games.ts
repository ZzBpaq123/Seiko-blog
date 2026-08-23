export interface Game {
    id: string;
    title: string;
    chineseName: string;
    englishName: string;
    tags: string[];
    accentColor: string;
    accentTextColor: string;
    description: string;
    developer: string;
    released: string;
    backgroundImage: string;
    images: string[];
    iconSet?: string[];
    officialUrl?: string;
    wikiUrl?: string;
}

export const games: Game[] = [
    {
        id: "league-of-legends",
        title: "League of Legends",
        chineseName: "英雄联盟",
        englishName: "League of Legends",
        tags: ["MOBA", "竞技", "团队", "策略", "对战"],
        accentColor: "#a9ffdf",
        accentTextColor: "#004534",
        description:
            "踏入符文之地，一片魔法与科技交织、秩序与混沌对峙的奇幻大陆。作为召唤师，你将驾驭各具传奇的英雄，征战于正义之地。从德玛西亚的庄严城邦到诺克萨斯的铁血疆场，从艾欧尼亚的灵韵山林到皮尔特沃夫与祖安的双城对峙，宏大的势力纷争与英雄宿命在此交织。唯有精准的战术抉择、默契的团队协作与极致的操作博弈，方能突破防线，摧毁敌方枢纽水晶，赢得最终胜利。",
        developer: "Riot Games",
        released: "2009-10-27",
        backgroundImage:
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80",
        images: ["/ig.jpg", "/uzi.jpg"],
        officialUrl: "https://lol.qq.com/main.shtml",
        wikiUrl: "https://leagueoflegends.fandom.com/zh/wiki/",
    },
    {
        id: "tft",
        title: "金铲铲之战",
        chineseName: "金铲铲之战",
        englishName: "Teamfight Tactics",
        tags: ["自走棋", "策略", "回合制", "博弈"],
        accentColor: "#ffd700",
        accentTextColor: "#5c4b00",
        description:
            "置身于英雄联盟宇宙为依托的自走棋策略战场。八位召唤师同台竞技，通过招募英雄、构筑羁绊、排兵布阵、运筹经济，在一轮轮博弈中淘汰对手，角逐最终胜者。从经典时空裂痕到创新赛季主题，每一局都是充满变数的全新战术对决。",
        developer: "Riot Games",
        released: "2019-06-26",
        backgroundImage:
            "https://game-spider-1305605832.cos.ap-beijing.myqcloud.com/%E9%87%91%E9%93%B2%E9%93%B2%E4%B9%8B%E6%88%98%2Fbilibili_column%2F2025_06%2Fimages%2F41910364%2Fnew_dyn%2F36577b218dc585b193e9fdd54d3a54f31654134899.jpg",
        images: [
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
            "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&q=80",
        ],
        officialUrl: "https://jcc.qq.com/#/index",
        wikiUrl: "https://www.tftplay.com/",
    },
    {
        id: "oxygen-not-included",
        title: "Oxygen Not Included",
        chineseName: "缺氧",
        englishName: "Oxygen Not Included",
        tags: ["单机", "生存策略", "沙盒建造", "经营"],
        accentColor: "#70ddff",
        accentTextColor: "#002c37",
        description:
            "深入地底小行星内部，一群复制人必须管理稀缺资源才能生存。这不仅仅是殖民地建造游戏；它是一个热力学和大气压模拟。从设计复杂的液体冷却系统到从空气中清除二氧化碳，档案突出了在太空真空环境中生命的脆弱本质。",
        developer: "Klei Entertainment",
        released: "2019-07-30",
        backgroundImage: "/oxygen-not-included.jpg",
        images: ["/oni-1.png", "/oni-2.png"],
        officialUrl: "https://www.klei.com/games/oxygen-not-included",
        wikiUrl: "https://oxygennotincluded.fandom.com/zh/wiki/",
    },
    {
        id: "dont-starve",
        title: "Don't Starve",
        chineseName: "饥荒",
        englishName: "Don't Starve",
        tags: ["生存", "沙盒", "荒野", "建造"],
        accentColor: "#bf81ff",
        accentTextColor: "#32005c",
        description:
            "被恶魔麦斯威尔困住并传送到一个神秘的荒野世界，威尔逊必须运用他的智慧和周围的环境来生存。档案注意到「永恒领域」的存在，这是一个夜晚带来恐怖、理智像饥饿一样珍贵的领域。每一次植物收获、每一次点燃火焰，都是对逼近黑暗的缓期执行。",
        developer: "Klei Entertainment",
        released: "2013-04-23",
        backgroundImage: "/dont-starve.jpg",
        images: ["/ds-1.png", "/ds-2.png"],
        officialUrl: "https://www.klei.com/games/dont-starve/",
        wikiUrl: "https://dontstarve.huijiwiki.com/wiki/",
    },
    {
        id: "civilization-vi",
        title: "Civilization VI",
        chineseName: "文明 VI",
        englishName: "Civilization VI",
        tags: ["单机", "回合策略", "历史模拟"],
        accentColor: "#00eab7",
        accentTextColor: "#004534",
        description:
            "建立一个经得起时间考验的帝国。文明 VI 引入了「非堆叠城市」，区域现在占据自己的地块，允许深度的地理战略。从游牧时代的黎明到信息时代的遥远未来，档案通过文化、科学和征服追踪文明的兴衰。",
        developer: "Firaxis Games",
        released: "2016-10-21",
        backgroundImage: "/civilization-vi.jpg",
        images: ["/cv-1.png", "/cv-2.png"],
        iconSet: ["architecture", "rocket", "theater", "swords"],
        officialUrl: "https://civilization.2k.com/",
        wikiUrl: "https://civilization.fandom.com/zh/wiki/",
    },
];

export const surfaceColors = [
    "bg-game-surface", // surface-container-low for odd
    "bg-game-bg",      // surface for even
];