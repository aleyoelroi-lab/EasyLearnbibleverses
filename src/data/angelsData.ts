export interface CelestialAngel {
  id: string;
  name: string;
  title: string;
  order: string;
  symbol: string;
  color: string;
  secondaryColor: string;
  verseRef: string;
  verseText: string;
  scriptureTeaching: string;
  proclamation: string;
  blessingName: string;
  blessingDesc: string;
  blessingEffect: {
    type: 'oil_boost' | 'rescue_recharge' | 'sp_boost' | 'faith_boost' | 'armor_blessing';
    value: number;
  };
  visualIcon: 'sword' | 'trumpet' | 'flame' | 'censer' | 'wings';
}

export const CELESTIAL_ANGELS: CelestialAngel[] = [
  {
    id: 'archangel_michael',
    name: 'Archangel Michael',
    title: 'The Great Prince & Commander of Heavenly Armies',
    order: 'Archangel of Warfare & Deliverance',
    symbol: '⚔️',
    color: '#f59e0b', // Radiant Gold
    secondaryColor: '#ef4444',
    verseRef: 'Revelation 12:7-8 & Daniel 10:13',
    verseText: '“And war broke out in heaven: Michael and his angels fought with the dragon; and the dragon and his angels fought, but they did not prevail, nor was a place found for them in heaven any longer.”',
    scriptureTeaching: 'Michael stands as the defender of God’s people against the ancient Dragon, wielding the sword of righteousness to ensure that darkness can never triumph over the elect.',
    proclamation: '“Fear not, faithful pilgrim! The Dragon is already cast down by the blood of the Lamb and the word of our testimony. Stand firm in the armor of God!”',
    blessingName: 'Deliverance of Michael',
    blessingDesc: 'Restores +1 Angel of the Lord battle rescue charges and grants +25 Shield Armor against dark afflictions.',
    blessingEffect: {
      type: 'rescue_recharge',
      value: 1,
    },
    visualIcon: 'sword',
  },
  {
    id: 'archangel_gabriel',
    name: 'Archangel Gabriel',
    title: 'The Messenger of the Lord & Trumpeter of Zion',
    order: 'Archangel of Divine Revelation & The Call',
    symbol: '🎺',
    color: '#38bdf8', // Sky Celestial Blue
    secondaryColor: '#e0e7ff',
    verseRef: 'Luke 1:19 & Matthew 24:31',
    verseText: '“I am Gabriel, who stands in the presence of God, and was sent to speak to you and bring you these glad tidings... And He will send His angels with a great sound of a trumpet, and they will gather together His elect.”',
    scriptureTeaching: 'Gabriel announces the glorious mysteries of God from the birth of Christ to the final Seventh Trumpet that heralds the eternal Kingdom of God.',
    proclamation: '“Behold, the Bridegroom comes! Go out to meet Him with trimmed lamps and rejoicing hearts! The kingdoms of this world have become the kingdoms of our Lord!”',
    blessingName: 'Trumpet of the Midnight Cry',
    blessingDesc: 'Refills your holy consecrated oil reserve by +45% and illuminates your lantern radius with divine brilliance.',
    blessingEffect: {
      type: 'oil_boost',
      value: 45,
    },
    visualIcon: 'trumpet',
  },
  {
    id: 'archangel_uriel',
    name: 'Archangel Uriel',
    title: 'The Flame of God & Keeper of the Golden Censer',
    order: 'Archangel of Sanctification & Intercession',
    symbol: '🏺',
    color: '#a855f7', // Mystic Purple & Amber
    secondaryColor: '#fde047',
    verseRef: 'Revelation 8:3-4',
    verseText: '“Another angel, having a golden censer, came and stood at the altar. He was given much incense, that he should offer it with the prayers of all the saints upon the golden altar which was before the throne.”',
    scriptureTeaching: 'Uriel presents the heartfelt prayers, tears, and intercessions of the faithful saints before the mercy seat of God in holy worship.',
    proclamation: '“Your prayers have ascended as sweet incense before the throne of the Almighty! Not a single tear shed in the pilgrimage of faith has been forgotten.”',
    blessingName: 'Incense of the Saints',
    blessingDesc: 'Restores +60 Spirit Points (SP) to empower all Scripture Read Aloud proclamations.',
    blessingEffect: {
      type: 'sp_boost',
      value: 60,
    },
    visualIcon: 'censer',
  },
  {
    id: 'seraph_living_fire',
    name: 'Seraph of Living Flame',
    title: 'Six-Winged Seraph of the Throne of Glory',
    order: 'Seraphim of Heavenly Worship',
    symbol: '🔥',
    color: '#fb923c', // Burning Ember Gold
    secondaryColor: '#f43f5e',
    verseRef: 'Isaiah 6:2-3, 6-7',
    verseText: '“Above it stood seraphim; each one had six wings: with two he covered his face, with two he covered his feet, and with two he flew. And one cried to another and said: ‘Holy, holy, holy is the Lord of hosts; the whole earth is full of His glory!’”',
    scriptureTeaching: 'The Seraphim burn with the unquenchable holiness and purity of God’s presence, touching hearts with coals from the heavenly altar to cleanse iniquity.',
    proclamation: '“Holy, holy, holy is the Lord God Almighty, who was and is and is to come! Receive the burning coal of righteousness to keep your lamp ablaze!”',
    blessingName: 'Altar Coal of Purity',
    blessingDesc: 'Cleanses all dark afflictions (Lust, Pride, Greed, Sloth) and adds +100 Faith Score to your pilgrimage tally.',
    blessingEffect: {
      type: 'faith_boost',
      value: 100,
    },
    visualIcon: 'flame',
  },
  {
    id: 'guardian_angel_elect',
    name: 'Guardian Angel of the Narrow Way',
    title: 'Ministering Spirit of the Heirs of Salvation',
    order: 'Guardian Host of Divine Refuge',
    symbol: '🕊️',
    color: '#10b981', // Emerald Heavenly Light
    secondaryColor: '#6ee7b7',
    verseRef: 'Psalm 91:11-12 & Hebrews 1:14',
    verseText: '“For He shall give His angels charge over you, to keep you in all your ways. In their hands they shall bear you up, lest you dash your foot against a stone. Are they not all ministering spirits sent forth to minister for those who will inherit salvation?”',
    scriptureTeaching: 'Angels watch over every step of the believer, protecting them against hidden snares and demonic arrows along the steep pilgrimage road.',
    proclamation: '“The Lord has stationed His chariot of fire round about you! Walk boldly in faith, for no weapon formed against you shall prosper.”',
    blessingName: 'Shield of the Ministering Spirit',
    blessingDesc: 'Fully restores health to 100% and grants divine swiftness across all wilderness trails.',
    blessingEffect: {
      type: 'armor_blessing',
      value: 100,
    },
    visualIcon: 'wings',
  },
];
