// Character Database & Special Powers
const CHARACTERS = [
    {
        id: "kage",
        name: "KAGE",
        title: "Shadow Shinobi",
        avatar: "🥷",
        element: "VOID",
        color: "#a855f7", // Purple shadow
        glowColor: "rgba(168, 85, 247, 0.7)",
        eyeColor: "#c084fc",
        weapon: "Twin Shadow Katanas",
        hp: 950,
        speed: 1.2,
        power: 1.05,
        defense: 0.95,
        bio: "Master of forbidden shadow arts who bends spacetime to strike from the abyss.",
        special1: {
            id: "shadow_step",
            name: "SHADOW STEP",
            icon: "⚡",
            desc: "Teleports behind the opponent instantly and delivers a surprise backslash.",
            cooldown: 4.5,
            energyCost: 25,
            damage: 90,
            type: "teleport"
        },
        special2: {
            id: "shuriken_storm",
            name: "SHURIKEN STORM",
            icon: "✦",
            desc: "Flings 3 piercing shadow shurikens that seek the target.",
            cooldown: 3.5,
            energyCost: 20,
            damage: 80,
            type: "projectile"
        },
        ultimate: {
            id: "void_execution",
            name: "VOID EXECUTION",
            icon: "☠️",
            desc: "Pulls opponent into the dark void, unleashing a barrage of fatal slashes.",
            damage: 320,
            type: "ultimate"
        }
    },
    {
        id: "ignis",
        name: "IGNIS",
        title: "Infernal Warlock",
        avatar: "🔥",
        element: "HELLFIRE",
        color: "#ef4444", // Fiery red
        glowColor: "rgba(239, 68, 68, 0.8)",
        eyeColor: "#fbbf24",
        weapon: "Hellfire Claws",
        hp: 1000,
        speed: 1.0,
        power: 1.25,
        defense: 0.95,
        bio: "Ancient necromancer consumed by the netherflame, incinerating all who stand in his way.",
        special1: {
            id: "fireball",
            name: "HELLFIRE BLAST",
            icon: "🔥",
            desc: "Hurls a blazing sphere of netherfire that explodes on impact.",
            cooldown: 3.0,
            energyCost: 20,
            damage: 100,
            type: "projectile"
        },
        special2: {
            id: "flame_pillar",
            name: "FLAME PILLAR",
            icon: "🌋",
            desc: "Summons a soaring volcanic pillar beneath the opponent's feet.",
            cooldown: 5.0,
            energyCost: 30,
            damage: 110,
            type: "pillar"
        },
        ultimate: {
            id: "infernal_dragon",
            name: "INFERNAL DRAGON",
            icon: "🐉",
            desc: "Summons a gigantic apocalyptic flame dragon that consumes the battlefield.",
            damage: 350,
            type: "ultimate"
        }
    },
    {
        id: "volt",
        name: "RAIDEN VOLT",
        title: "Thunder Monk",
        avatar: "⚡",
        element: "LIGHTNING",
        color: "#06b6d4", // Electric cyan
        glowColor: "rgba(6, 182, 212, 0.8)",
        eyeColor: "#67e8f9",
        weapon: "Storm Quarterstaff",
        hp: 920,
        speed: 1.3,
        power: 1.0,
        defense: 0.9,
        bio: "Ascetic warrior channeling raw thunderbolts through divine martial momentum.",
        special1: {
            id: "lightning_dash",
            name: "VOLT SURGE",
            icon: "⚡",
            desc: "Surges forward like a lightning bolt, crashing through the opponent.",
            cooldown: 3.5,
            energyCost: 20,
            damage: 85,
            type: "dash"
        },
        special2: {
            id: "thunder_strike",
            name: "HEAVEN'S BOLT",
            icon: "🌩️",
            desc: "Calls down a high-voltage lightning strike directly from the heavens.",
            cooldown: 4.5,
            energyCost: 25,
            damage: 105,
            type: "pillar"
        },
        ultimate: {
            id: "storm_overload",
            name: "STORM OVERLOAD",
            icon: "⚡⚡",
            desc: "Overcharges the atmosphere, unleashing chained lightning that paralyzes and wrecks.",
            damage: 310,
            type: "ultimate"
        }
    },
    {
        id: "frost",
        name: "FROST",
        title: "Glacial Assassin",
        avatar: "❄️",
        element: "FROST",
        color: "#38bdf8", // Ice Blue
        glowColor: "rgba(56, 189, 248, 0.8)",
        eyeColor: "#e0f2fe",
        weapon: "Twin Cryo Daggers",
        hp: 960,
        speed: 1.15,
        power: 1.1,
        defense: 1.0,
        bio: "Cold-blooded huntress from the frozen peaks who paralyzes victims in sub-zero ice.",
        special1: {
            id: "ice_spikes",
            name: "GLACIAL SPIKES",
            icon: "❄️",
            desc: "Shoots sharp ice shards across the ground that temporarily freeze the target.",
            cooldown: 4.0,
            energyCost: 25,
            damage: 85,
            type: "projectile",
            freezeDuration: 1.2
        },
        special2: {
            id: "frost_clone",
            name: "ICE DECOY",
            icon: "💎",
            desc: "Creates a crystalline ice barrier that blocks damage and shatters back.",
            cooldown: 5.0,
            energyCost: 30,
            damage: 95,
            type: "counter"
        },
        ultimate: {
            id: "absolute_zero",
            name: "ABSOLUTE ZERO",
            icon: "🧊",
            desc: "Encases the foe in a massive glacier block, then shatters it into razor ice shards.",
            damage: 330,
            type: "ultimate"
        }
    },
    {
        id: "titan",
        name: "TITAN",
        title: "Iron Colossus",
        avatar: "🗿",
        element: "EARTH & STEEL",
        color: "#eab308", // Golden Bronze
        glowColor: "rgba(234, 179, 8, 0.8)",
        eyeColor: "#fde047",
        weapon: "Colossal War Hammer",
        hp: 1200,
        speed: 0.85,
        power: 1.35,
        defense: 1.25,
        bio: "A behemoth forged of stone and enchanted steel whose ground slams cause seismic quakes.",
        special1: {
            id: "earthquake",
            name: "GROUND SLAM",
            icon: "💥",
            desc: "Slams hammer into earth, triggering a violent seismic shockwave across the arena.",
            cooldown: 4.0,
            energyCost: 20,
            damage: 100,
            type: "ground"
        },
        special2: {
            id: "iron_bastion",
            name: "TITANIC TACKLE",
            icon: "🛡️",
            desc: "Unstoppable armored shoulder charge that absorbs attacks and bowls over the enemy.",
            cooldown: 5.0,
            energyCost: 25,
            damage: 115,
            type: "dash"
        },
        ultimate: {
            id: "tectonic_cataclysm",
            name: "TECTONIC CATACLYSM",
            icon: "⛰️",
            desc: "Leaps into the stratosphere and meteor-smashes down, fracturing the entire bedrock.",
            damage: 360,
            type: "ultimate"
        }
    }
];

window.CHARACTERS = CHARACTERS;
