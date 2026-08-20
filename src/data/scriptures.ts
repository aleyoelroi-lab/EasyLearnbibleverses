export interface StageNarrative {
  stageId: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  themeVerseRef: string;
  themeVerseText: string;
  oilSymbolismTeaching: string;
  questTitle: string;
  questDescription: string;
  interactiveChallenge: {
    type: 'ear_discernment' | 'confession_decision' | 'kingdom_investment' | 'midnight_vigil';
    question: string;
    options: {
      id: string;
      label: string;
      verseHint?: string;
      isCorrect: boolean;
      consequenceGood: string;
      consequenceBad: string;
    }[];
  };
  rewardFaith: number;
}

export const STAGE_NARRATIVES: Record<string, StageNarrative> = {
  prologue_call: {
    stageId: 'prologue_call',
    stageNumber: 0,
    title: 'The Peaceful World & The Bride of Light',
    subtitle: 'Awakening on the Island of Remembrance',
    themeVerseRef: 'John 3:16',
    themeVerseText: '“For God so loved the world that He gave His one and only begotten Son, that whoever believes in Him shall not perish but have eternal life.”',
    oilSymbolismTeaching: 'The Oil of the Lamp represents the Holy Spirit, prayer, and genuine love dwelling within the heart. It cannot be bought at the final hour from others; it must be gathered daily in communion with God.',
    questTitle: 'The Awakening of the Bride',
    questDescription: 'You awaken on the peaceful shores of the Sanctuary Island with no memory of worldly sorrow. The voice of the Spirit whispers your true identity: You are called to be the Bride of Light, holding the lamp of faith.',
    interactiveChallenge: {
      type: 'ear_discernment',
      question: 'Do you receive this call to walk in the light and kindle your lantern?',
      options: [
        {
          id: 'accept_light',
          label: '“Here I am, Lord; let my lamp shine before all.” (Matthew 5:16)',
          isCorrect: true,
          consequenceGood: 'Your lantern ignites with radiant amber warmth. Faith Points +150! The path opens to the Sanctuary Grove.',
          consequenceBad: '',
        },
      ],
    },
    rewardFaith: 150,
  },

  stage1_talents: {
    stageId: 'stage1_talents',
    stageNumber: 1,
    title: 'The Parable of the Talents',
    subtitle: 'Faithful Stewardship in the Peaceful Grove',
    themeVerseRef: 'Matthew 25:21, Revelation 2:29',
    themeVerseText: '“His master replied, ‘Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things. Come and share your master’s happiness!’”\n\n“Whoever has an ear, let them hear what the Spirit says to the churches.”',
    oilSymbolismTeaching: 'Oil is not passive knowledge—it is the active multiplication of the gifts and grace God has given you. Hiding your talent in the dirt leaves your lamp dry when the master returns.',
    questTitle: 'Quest 1: Invest the Master’s Talents',
    questDescription: 'Explore the sanctuary island to gather the 5 Master’s Talents scattered across the ancient altars and water fountains. Then listen closely to the Scripture obelisk.',
    interactiveChallenge: {
      type: 'ear_discernment',
      question: '“Whoever has an ear, let them hear what the Spirit says.” How do you respond to the Master’s Word?',
      options: [
        {
          id: 'hear_and_obey',
          label: '👂 [HEAR] “Speak, Lord, for Your servant is listening.” (1 Samuel 3:10) — Multiply the Talents in love.',
          isCorrect: true,
          consequenceGood: 'Blessing unlocked! The oil reservoir in your lantern fills to overflowing. Faith Points +300!',
          consequenceBad: '',
        },
        {
          id: 'refuse_hear',
          label: '🚫 [NOT HEAR] Close ears, bury the talent in pride, and ignore the Spirit’s counsel.',
          isCorrect: false,
          consequenceGood: '',
          consequenceBad: 'Warning! Ignoring the Word plunges the soul into outer darkness and burning regret. Repent and choose to Hear!',
        },
      ],
    },
    rewardFaith: 300,
  },

  stage2_confession: {
    stageId: 'stage2_confession',
    stageNumber: 2,
    title: 'The Great Confession & The Hidden Treasure',
    subtitle: 'Surrendering All for the Unshakable Land',
    themeVerseRef: 'Matthew 13:44-46 & Romans 10:9',
    themeVerseText: '“The kingdom of heaven is like treasure hidden in a field. When a man found it, he hid it again, and then in his joy went and sold all he had and bought that field.”\n\n“If you declare with your mouth, ‘Jesus is Lord,’ and believe in your heart that God raised Him from the dead, you will be saved.”',
    oilSymbolismTeaching: 'True oil requires full surrender. When you sell the fleeting pleasures of this world to buy the True Land, your foundation is anchored on the Rock that no flood or wildfire can destroy.',
    questTitle: 'Quest 2: The Confession of Faith & Buying the Land',
    questDescription: 'The sky turns to a stormy evening. Shadow apparitions tempt you with despair. Stand before the Cross Altar, declare Jesus Christ as your Lord and Savior, and purchase the eternal Land Deed.',
    interactiveChallenge: {
      type: 'confession_decision',
      question: '“Do you accept the Lord Jesus Christ as your personal Lord and Savior?”',
      options: [
        {
          id: 'confess_yes',
          label: '✝️ [YES] “Jesus is my Lord, Savior, and Redeemer. I seek Him with all my heart!”',
          isCorrect: true,
          consequenceGood: 'Joy surges like living water! Demonic shadows flee in terror. Your spirit is liberated to buy the Eternal Land.',
          consequenceBad: '',
        },
        {
          id: 'confess_no',
          label: '❌ [NO] Rely on worldly self-righteousness and reject the Savior’s hand.',
          isCorrect: false,
          consequenceGood: '',
          consequenceBad: 'Despair and torment encroach as demonic lies whisper gloom. You realize only Jesus can heal your soul!',
        },
      ],
    },
    rewardFaith: 500,
  },

  stage3_midnight: {
    stageId: 'stage3_midnight',
    stageNumber: 3,
    title: 'The Midnight Cry & The King on the White Horse',
    subtitle: 'The 10 Virgins, The Dragon, and the Heavenly Chariots',
    themeVerseRef: 'Matthew 25:6, Revelation 19:11-16',
    themeVerseText: '“At midnight the cry rang out: ‘Here’s the bridegroom! Come out to meet him!’”\n\n“I saw heaven standing open and there before me was a white horse, whose rider is called Faithful and True... The armies of heaven were following Him, riding on white horses and dressed in fine linen, white and clean.”',
    oilSymbolismTeaching: 'At midnight, 5 foolish virgins had lamps but no extra oil. When the Bridegroom arrived, their lamps sputtered and died. The 5 wise virgins trimmed their bright lamps and were ushered into the Marriage Supper of the Lamb!',
    questTitle: 'Quest 3: Stand with the 5 Wise Brides & Welcome the King',
    questDescription: 'Midnight thunderstorm rages. The ancient Dragon of darkness tries to snuff out the lamps. Keep your flame burning, revive the 5 wise sister brides with your oil, and witness the King on the White Horse descend with fiery chariots of angels to shatter the darkness forever.',
    interactiveChallenge: {
      type: 'midnight_vigil',
      question: 'The Midnight Cry echoes across the islands! Will you trim your lamp and stand steadfast in vigilance?',
      options: [
        {
          id: 'trim_lamp_watch',
          label: '🔥 “Lord, our lamps are trimmed and full of oil! Even so, come Lord Jesus!” (Revelation 22:20)',
          isCorrect: true,
          consequenceGood: 'The sky breaks with blinding golden lightning! The King on the White Horse arrives with His heavenly army! The Dragon is bound and defeated!',
          consequenceBad: '',
        },
      ],
    },
    rewardFaith: 1000,
  },

  epilogue_word: {
    stageId: 'epilogue_word',
    stageNumber: 4,
    title: 'The Word Made Flesh & The Radiant Dawn',
    subtitle: 'The Eternal Marriage Feast of the Lamb',
    themeVerseRef: 'John 1:1, 1:14',
    themeVerseText: '“In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through Him all things were made; without Him nothing was made that has been made. In Him was life, and that life was the light of all mankind.”\n\n“The Word became flesh and made His dwelling among us. We have seen His glory, the glory of the one and only Son, who came from the Father, full of grace and truth.”',
    oilSymbolismTeaching: 'The mystery of the oil is revealed: Jesus Christ is the Eternal Word, the True Light that darkness can never overcome. Abiding in Him keeps your lantern eternally radiant.',
    questTitle: 'The Epilogue: Eternal Communion',
    questDescription: 'The storm has completely passed into a radiant, warm golden morning. Walk with the King of Kings into the Golden Sanctuary.',
    interactiveChallenge: {
      type: 'kingdom_investment',
      question: '“The Spirit and the Bride say, ‘Come!’ Let anyone who is thirsty come and take the free gift of the water of life.”',
      options: [
        {
          id: 'enter_feast',
          label: '👑 “Amen! Glory, honor, and praise to the Lamb upon the Throne!”',
          isCorrect: true,
          consequenceGood: 'You have entered the Eternal Feast of the Lamb with full oil and unquenched joy!',
          consequenceBad: '',
        },
      ],
    },
    rewardFaith: 2000,
  },
};
