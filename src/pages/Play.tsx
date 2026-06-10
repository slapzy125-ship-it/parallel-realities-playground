import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import PenaltyKick from '@/components/minigames/PenaltyKick'
import MagicDuel from '@/components/minigames/MagicDuel'
import CombatStrike from '@/components/minigames/CombatStrike'
import HackTerminal from '@/components/minigames/HackTerminal'
import MatchReport from '@/components/game/MatchReport'
import SeasonSummary from '@/components/game/SeasonSummary'
import TrophyPopup from '@/components/game/TrophyPopup'
import ChapterCard from '@/components/game/ChapterCard'
import TransferWindow from '@/components/game/TransferWindow'
import SaveSlots from '@/components/game/SaveSlots'
import { supabase } from '@/integrations/supabase/client'
import { useSubscription } from '@/hooks/useSubscription'
import { PaywallGate } from '@/components/PaywallGate'

const FREE_WORLD_IDS = new Set(['arcane', 'champions'])
const FREE_SCENE_CAP = 5

const TRAITS = ['Ambitious','Loyal','Brave','Competitive','Intelligent','Creative','Confident','Curious','Ruthless','Charismatic']
const GOALS = ['Become a Legend','Gain Power','Build an Empire','Become Rich','Save the World','Discover the Unknown']
const NATIONALITIES = ['English','Spanish','French','German','Brazilian','Argentine','Portuguese','Italian','Dutch','Belgian','Croatian','Senegalese','Nigerian','Moroccan','Japanese','American','Mexican','Colombian','Australian','Scottish','Welsh','Irish','Swedish','Norwegian']

// Per-world act structure. Each act = one chapter. `scenes` = how many scenes belong to that act.
// Longer worlds → fuller arcs. Champions Legacy covers an entire football career (age 16 → 45).
const WORLD_ACTS: Record<string, Array<{name:string, scenes:number}>> = {
  arcane:     [{name:'The Arrival',scenes:10},{name:'The Forbidden Floor',scenes:10},{name:'The Vanishing',scenes:10},{name:'The Weight of Secrets',scenes:10},{name:'The Trials',scenes:12},{name:'The Betrayal',scenes:12},{name:'The Reckoning',scenes:14}],
  champions:  [{name:'The Trial',scenes:10},{name:'First Contract',scenes:12},{name:'Breaking Through',scenes:12},{name:'The Transfer',scenes:14},{name:'Peak Years',scenes:16},{name:'The Final Push',scenes:12},{name:'Legacy Season',scenes:12}],
  galactic:   [{name:'First Flight',scenes:10},{name:'Choosing Sides',scenes:12},{name:'The War Begins',scenes:14},{name:'Behind Enemy Lines',scenes:12},{name:'The Turning Point',scenes:14}],
  dragonfall: [{name:'The Tournament',scenes:10},{name:'The Alliance',scenes:12},{name:'Fire and Blood',scenes:14},{name:'The Dragon Bond',scenes:12},{name:'The Final War',scenes:14}],
  shadow:     [{name:'The Initiation',scenes:10},{name:'The First Contract',scenes:12},{name:'Into the Dark',scenes:14},{name:'The Brotherhood Test',scenes:12},{name:'The Reckoning',scenes:14}],
  neon:       [{name:'First Breach',scenes:10},{name:'Going Deeper',scenes:12},{name:'Corporate Enemy',scenes:14},{name:'The Network',scenes:12},{name:'Endgame',scenes:14}],
  odyssey:    [{name:"The Oracle's Call",scenes:10},{name:'The First Trial',scenes:12},{name:'Divine Favour',scenes:14},{name:'The Dark Road',scenes:12},{name:'The Eternal Gate',scenes:14}],
  hero:       [{name:'Licence Granted',scenes:10},{name:'First Response',scenes:12},{name:'Rising Ranks',scenes:14},{name:'The Crisis',scenes:12},{name:'Final Stand',scenes:14}],
  greed:      [{name:'The Cold Call',scenes:10},{name:'First Commission',scenes:10},{name:'Moving Up',scenes:12},{name:'Your Own Book',scenes:12},{name:'The Inner Circle',scenes:12},{name:'The Investigation',scenes:12},{name:'The Reckoning',scenes:12}],
}
const DEFAULT_ACTS = [{name:'Beginning',scenes:10},{name:'Rising',scenes:12},{name:'Crisis',scenes:14},{name:'Confrontation',scenes:12},{name:'Legend',scenes:14}]

const getWorldActs = (worldId?:string) => (worldId && WORLD_ACTS[worldId]) || DEFAULT_ACTS
const getActRanges = (worldId?:string) => {
  const acts = getWorldActs(worldId)
  let start = 0
  return acts.map((a, i) => {
    const range:[number,number] = [start, start + a.scenes - 1]
    start += a.scenes
    return {id: i + 1, name: a.name, range, scenes: a.scenes}
  })
}
const getAct = (p:number, worldId?:string) => {
  const ranges = getActRanges(worldId)
  return ranges.find(a => p >= a.range[0] && p <= a.range[1]) ?? ranges[ranges.length - 1]
}
const getTotalScenes = (worldId?:string) => getWorldActs(worldId).reduce((s,a) => s + a.scenes, 0)

// Chapter names derived from act names — every act IS a chapter.
const CHAPTER_NAMES: Record<string,string[]> = Object.fromEntries(
  Object.entries(WORLD_ACTS).map(([k, acts]) => [k, acts.map(a => a.name)])
)


const WORLD_NEWS_SOURCE: Record<string,string> = {
  arcane:'The Daily Arcane',
  champions:'Transfer Central',
  galactic:'Galactic Broadcast Network',
  dragonfall:'The Kingdom Herald',
  shadow:'The Underground Wire',
  neon:'NeonNet Feed',
  odyssey:"The Oracle's Echo",
  hero:'Hero Watch Daily',
  greed:'The Floor Report',
}

const WAND_WOODS = [
  {name:'Ashwood',trait:'Ambitious',bonus:'Spellcasting +8',statKey:'Spellcasting',statVal:8,desc:'Favours those who seek greatness. Powerful but demanding.'},
  {name:'Willow',trait:'Loyal',bonus:'Control +8',statKey:'Control',statVal:8,desc:'Chooses wizards of quiet strength. Deeply loyal to its owner.'},
  {name:'Rowan',trait:'Brave',bonus:'Courage +8',statKey:'Courage',statVal:8,desc:'Associated with protectors. Never chooses a coward.'},
  {name:'Blackthorn',trait:'Competitive',bonus:'Spellcasting +6',statKey:'Spellcasting',statVal:6,desc:'A warrior wand. Fights hardest when its owner is challenged.'},
  {name:'Elder',trait:'Intelligent',bonus:'Knowledge +10',statKey:'Knowledge',statVal:10,desc:'Rare and dangerous. Seeks the most learned wizards.'},
  {name:'Vine',trait:'Creative',bonus:'Knowledge +7',statKey:'Knowledge',statVal:7,desc:'Hidden depths. Chooses those who seek something greater.'},
  {name:'Maple',trait:'Confident',bonus:'HousePoints +8',statKey:'HousePoints',statVal:8,desc:'Travels well with those who are sure of themselves.'},
  {name:'Cedar',trait:'Curious',bonus:'Knowledge +6',statKey:'Knowledge',statVal:6,desc:'Drawn to those with sharp minds and seeking hearts.'},
  {name:'Yew',trait:'Ruthless',bonus:'Spellcasting +9',statKey:'Spellcasting',statVal:9,desc:'Associated with power over life and death.'},
  {name:'Hawthorn',trait:'Charismatic',bonus:'HousePoints +6',statKey:'HousePoints',statVal:6,desc:'A wand of contradictions. Suits those of complex character.'},
]
const WAND_CORES = [
  {name:'Dragon Heartstring',bonus:'Raw Power',statKey:'Spellcasting',statVal:5,desc:'Produces the most powerful spells. Can be prone to accidents.'},
  {name:'Phoenix Feather',bonus:'Versatility',statKey:'Control',statVal:5,desc:'Capable of the greatest range of magic. Difficult to tame.'},
  {name:'Unicorn Hair',bonus:'Consistency',statKey:'Control',statVal:4,desc:'Most faithful of all cores. Least prone to dark magic.'},
  {name:'Basilisk Scale',bonus:'Dark Resistance',statKey:'Courage',statVal:4,desc:'Rare and powerful. Connects to ancient magic.'},
  {name:'Thunderbird Feather',bonus:'Defense',statKey:'Control',statVal:5,desc:'Excels at protective spells and sensing danger.'},
]
const WAND_LENGTHS = [
  {name:'Short (9 inch)',bonus:'Precision +6',statKey:'Control',statVal:6,desc:'Quick and precise. Better control, slightly less raw power.'},
  {name:'Standard (11 inch)',bonus:'Balanced',statKey:'Spellcasting',statVal:3,desc:'The most common length. Reliable in all situations.'},
  {name:'Long (13 inch)',bonus:'Power +6',statKey:'Spellcasting',statVal:6,desc:'More powerful spells but requires greater skill to control.'},
  {name:'Unusual (14 inch)',bonus:'Unique Magic',statKey:'Knowledge',statVal:5,desc:'Unusual length for an unusual wizard. Unpredictable power.'},
]

const SABER_COLORS = [
  {color:'Blue',hex:'#4FC3F7',meaning:'Guardian — Defender of the innocent.',faction:'Vanguard Alliance',stats:{Combat:5,Diplomacy:8}},
  {color:'Green',hex:'#66BB6A',meaning:'Consular — Seeker of wisdom and balance.',faction:'Celestial Order',stats:{Diplomacy:8,GalacticRep:5}},
  {color:'Red',hex:'#EF5350',meaning:'Dark Side — Power above all else.',faction:'Iron Dominion',stats:{Combat:12,GalacticRep:-5}},
  {color:'Yellow',hex:'#FDD835',meaning:'Sentinel — Balance between guardian and consular.',faction:'Vanguard Alliance',stats:{Combat:6,Diplomacy:6}},
  {color:'Purple',hex:'#AB47BC',meaning:'Unique Path — Between light and dark.',faction:'Nova Syndicate',stats:{Combat:8,Diplomacy:4}},
  {color:'White',hex:'#F5F5F5',meaning:'Purified — Claimed from darkness. Strongest will.',faction:'Celestial Order',stats:{Combat:7,Diplomacy:7}},
  {color:'Orange',hex:'#FFA726',meaning:'Merchant of Peace — Negotiator first.',faction:'Nova Syndicate',stats:{Credits:500,Diplomacy:10}},
]

const CYBERNETIC_IMPLANTS = [
  {name:'Neural Interface',icon:'🧠',bonus:'Hacking +12, Influence +5',stats:{Hacking:12,Influence:5},desc:'Direct neural link to any digital system. Side effect: data bleeds into dreams.'},
  {name:'Reflex Booster',icon:'⚡',bonus:'Street Rep +8',stats:{Hacking:3,StreetRep:8},desc:'Synthetic nerve fiber in your spine. Reaction time 0.3 seconds. Drawback: chronic insomnia.'},
  {name:'Optical Implant',icon:'👁️',bonus:'Hacking +6, Influence +6',stats:{Hacking:6,Influence:6},desc:'Replaces one eye with a scanner. Reads biometrics and detects lies. People notice it.'},
  {name:'Subdermal Armor',icon:'🛡️',bonus:'Street Rep +6',stats:{StreetRep:6,Influence:3},desc:'Graphene weave under skin. Stops blades. Makes you look slightly inhuman up close.'},
  {name:'Voice Modulator',icon:'🎙️',bonus:'Influence +12',stats:{Influence:12,Hacking:4},desc:'Vocal cord replacement. Can mimic any voice perfectly. People find it unsettling.'},
  {name:'Cortex Bomb',icon:'💣',bonus:'Corporate Power +8',stats:{CorporatePower:8,StreetRep:10},desc:'A last resort device. Everyone who matters knows you have it. That is the point.'},
]

const GREEK_WEAPONS = [
  {name:'Spear of Ares',icon:'🔱',bonus:'Strength +12',stats:{Strength:12,Courage:5},faction:'Stormforged',desc:'Forged in the fires of war. Ares gifts this only to those who have proven themselves in blood.'},
  {name:'Bow of Artemis',icon:'🏹',bonus:'Exploration +10',stats:{Wisdom:8,Exploration:10},faction:'Dawnseekers',desc:'Carved from a sacred silver tree. Never misses a target the hunter truly means to hit.'},
  {name:'Aegis Shield Fragment',icon:'🛡️',bonus:'Courage +8',stats:{Courage:8,Wisdom:6},faction:'Celestial Keepers',desc:'A shard of Zeus\'s own shield. Carries divine protection and divine attention.'},
  {name:'Caduceus Staff',icon:'🪄',bonus:'Wisdom +12',stats:{Wisdom:12,MythicRep:5},faction:'Moonwardens',desc:'Hermes lends this to those who walk between worlds. Opens doors that should be closed.'},
  {name:'Hephaestus Gauntlet',icon:'⚒️',bonus:'Artifact Power +10',stats:{Strength:8,ArtifactPower:10},faction:'Stormforged',desc:'The forge-god\'s own gauntlet. Can repair any weapon. Can also destroy them.'},
]

const DRAGON_BREEDS = [
  {name:'Crimson Ember',icon:'🔴',element:'Fire',bond:'Aggressive, protective, fierce. Will die for you but expects the same.',stats:{DragonBond:10,ArmyStrength:8,Leadership:3}},
  {name:'Stormwing',icon:'🌩️',element:'Lightning',bond:'Intelligent and independent. Does not follow orders easily but when loyal, devastating.',stats:{DragonBond:8,Diplomacy:5,ArmyStrength:10}},
  {name:'Frostscale',icon:'❄️',element:'Ice',bond:'Patient and calculating. Old beyond measure. Gives counsel as much as combat power.',stats:{DragonBond:6,Diplomacy:10,Leadership:8}},
  {name:'Shadowfang',icon:'🖤',element:'Shadow',bond:'Mysterious and unpredictable. Feared by enemies. Difficult to bond with but unstoppable once earned.',stats:{DragonBond:5,ArmyStrength:12,Leadership:5}},
  {name:'Goldenwing',icon:'✨',element:'Light',bond:'Rare and legendary. Seen as a divine sign by all kingdoms.',stats:{DragonBond:12,Leadership:10,Diplomacy:8}},
]

const POSITIONS = [
  {pos:'Goalkeeper',icon:'🧤',short:'GK',desc:'Last line of defense.',stats:{Reflexes:15,Positioning:10,Distribution:8,Leadership:5}},
  {pos:'Centre-Back',icon:'🛡️',short:'CB',desc:'Organise and win everything.',stats:{Defending:15,Aerial:12,Leadership:8,Passing:5}},
  {pos:'Full-Back',icon:'↕️',short:'FB',desc:'Defend and attack.',stats:{Defending:10,Stamina:12,Crossing:10,Speed:8}},
  {pos:'Defensive Mid',icon:'⚙️',short:'CDM',desc:'Break up play.',stats:{Tackling:15,Passing:10,Positioning:10,Stamina:8}},
  {pos:'Central Mid',icon:'🎯',short:'CM',desc:'Dictate tempo.',stats:{Passing:12,Vision:12,Stamina:10,Shooting:6}},
  {pos:'Attacking Mid',icon:'✨',short:'CAM',desc:'Create chances.',stats:{Vision:15,Dribbling:10,Shooting:10,Passing:8}},
  {pos:'Winger',icon:'💨',short:'WG',desc:'Pace and skill.',stats:{Speed:15,Dribbling:12,Crossing:8,Finishing:8}},
  {pos:'Striker',icon:'⚽',short:'ST',desc:'Score goals.',stats:{Finishing:15,Movement:12,Strength:8,Speed:8}},
]

const VILLAIN_POOLS: Record<string,any[]> = {
  arcane:[
    {name:'Cassius Morne',title:'The Hollow Mage',motivation:'Was the greatest student the academy ever produced. Refused the position of Headmaster three times. Began studying forbidden magic not for power but for answers they would not give him.',firstHint:'A second year student is found in the library at three in the morning with no memory of how she got there.',yearReveal:4,signatureAbility:'Leaves people technically unharmed. Just emptier than before.',weakness:'The one thing he never learned was how to want something for someone else.'},
    {name:'Professor Elara Voss',title:'The Patient One',motivation:'Was passed over for Headmistress despite being the most qualified. Has spent fifteen years building something in the foundations of the academy that will give students everything the institution denied them — whether they want it or not.',firstHint:'She is the most popular professor at the academy. This is not suspicious yet.',yearReveal:5,signatureAbility:'Makes people believe the cage she is building for them is a gift.',weakness:'She genuinely loves her students. That love is real and it is also the only thing that can stop her.'},
    {name:'Dorian Ashcroft',title:'The Architect',motivation:'Believes the academy has wasted magical talent for centuries by sorting students into houses. Wants to tear down the house system and rebuild magic education from nothing. Does not see himself as evil. Is absolutely certain he is right.',firstHint:'Students across all houses begin questioning the house system in eerily similar language.',yearReveal:4,signatureAbility:'Compulsion Weaving — makes people believe his ideas are their own.',weakness:'He is right about some things. That makes him far more dangerous than someone who is simply wrong.'},
  ],
  champions:[
    {name:'Director Harlan Cole',role:'Club Chairman',description:'Bought the club as a vanity project. Makes signing decisions based on shirt sales. Will sell you the day your market value peaks regardless of the season you are having.',firstAppearance:'He watches your best match from the directors box. Afterwards he asks your manager what position you play.',escalation:'Cole puts you on the transfer list without telling you. You find out from a journalist.'},
    {name:'Coach Dietmar Strauss',role:'Head Coach',description:'Legendary manager deeply set in his system. If you do not fit his formation he will not change it for you. Will never drop a player he signed himself regardless of form.',firstAppearance:'First team meeting. He goes through every position in the squad. He skips yours.',escalation:'You have the best season of your career under his assistant. Strauss returns. You do not play for six weeks.'},
    {name:'Journalist Marcus Webb',role:'Media',description:'Has decided you are a bottler. Every match you play well he finds a reason to qualify it. One bad match confirms everything he wrote.',firstAppearance:'Your first high profile performance. Every outlet gives you a 7.8. Webb gives you a 5.5.',escalation:'His podcast about your supposed mental weakness goes viral. Clubs mention it in transfer negotiations.'},
    {name:'Teammate Leon Farris',role:'Senior Player',description:'Twelve years at the club. Sees you as a threat. Friendly to your face. Undermines you in team meetings.',firstAppearance:'He introduces himself warmly on your first day. Gives you the wrong training schedule.',escalation:'After you outscore him for three months he goes to the manager with a complaint about your attitude.'},
  ],
  galactic:[
    {name:'Emperor Vexis Krane',title:'The Architect of Order',motivation:'His home system was destroyed in a civil war that democracy failed to prevent. Built the Dominion from forty ships over thirty years. Genuinely believes he is the only thing standing between the galaxy and itself.',firstHint:'Dominion ships appear in neutral space doing nothing. They are watching something.',yearReveal:3},
    {name:'Commander Serath Null',title:'The Broken Shield',motivation:'Was a Vanguard hero who watched the Alliance sacrifice thirty thousand civilians for a tactical advantage. Defected not for power but because he stopped believing the Alliance was actually good.',firstHint:'A Vanguard operation goes wrong in a way that only an insider could cause.',yearReveal:2},
  ],
  dragonfall:[
    {name:'King Malakar Thorne',title:'The Dragonless King',motivation:'Lost his dragon twelve years ago. The bond breaking nearly killed him. Has been at war with everything since. Conquers kingdoms not because he wants them but because stopping means feeling what he lost.',firstHint:'Villages on the border burned — no military purpose, pure message.',yearReveal:2},
    {name:'Lady Seraphine Vael',title:'The Smiling Knife',motivation:'Has never won a battle. Has never needed to. Controls three kings through information, debt, and carefully arranged marriages. Wants to own the realm without ever sitting on the throne.',firstHint:'A lord who was your ally suddenly changes position without explanation.',yearReveal:3},
  ],
  shadow:[
    {name:'The Black Regent',title:'The Puppeteer',motivation:'Was a master assassin who concluded that killing individuals changes nothing. Spent twenty years learning to own institutions instead.',firstHint:'A contract goes wrong in a way that benefits someone you cannot identify.',yearReveal:3},
    {name:'Inquisitor Valdris',title:'The True Believer',motivation:'Genuinely believes the assassin brotherhood is a cancer on society. Has dedicated his life to destroying it from within by turning members against each other.',firstHint:'A fellow initiate is arrested. The arrest used information only someone inside could have.',yearReveal:2},
  ],
  neon:[
    {name:'Director Kron',title:'The Architect',motivation:'Watched his daughter die of a preventable illness because the healthcare system was controlled by profit. His neural integration programme is not a power grab. He genuinely believes it will save more lives than it ends.',firstHint:'Three people you know have the same opinion about something they had completely different views on last week.',yearReveal:2},
    {name:'CEO Mira Solen',title:'The Beautiful Monopoly',motivation:'Wants to own the infrastructure of every human interaction. Not through violence but through convenience. Make her systems so essential that resistance becomes unthinkable.',firstHint:'A competing company folds overnight. Its employees all transfer to Solen\'s corporation the next morning.',yearReveal:3},
  ],
  odyssey:[
    {name:'The Eternal King',title:'Thanatos Unchained',motivation:'Was a hero who completed every trial and was promised immortality. The gods gave it and then forgot about him. Spent a thousand years watching everyone he loved die. Is coming back for one answer: why.',firstHint:'The Oracle refuses to give prophecies for three days. She will not say why.',yearReveal:3},
    {name:'General Vorn',title:'The Faithful Conqueror',motivation:'Was given a divine mandate by a god who has since gone silent. Is not sure the mandate still applies. Is conquering anyway because stopping means admitting the god abandoned him.',firstHint:'Vorn\'s armies move in a direction that makes no tactical sense.',yearReveal:2},
  ],
  hero:[
    {name:'The Null',title:'The Equaliser',motivation:'His power was removed by a Nexus Institute experiment. Was told it was an acceptable loss. Discovered three other heroes had the same thing done to them. Is not attacking. Is making a statement.',firstHint:'A hero retires suddenly. The official statement says health reasons.',yearReveal:2},
    {name:'Director Aldous Crane',title:'The Necessary Evil',motivation:'Has been running illegal experiments on heroes for twelve years to make them more effective. Has saved more lives with his experiments than all the heroes combined. Cannot understand why anyone would want him stopped.',firstHint:'A hero comes back from a classified mission noticeably changed.',yearReveal:3},
  ],
  greed:[
    {
      name:'Agent Sarah Moss',
      title:'The Investigator',
      motivation:'Has been watching this firm for two years. Lost a case once because the evidence was not airtight. Will not make that mistake again. Is not corrupt. Is not cruel. Is just very very patient.',
      firstHint:'A colleague mentions that a woman in a grey suit was asking questions on the floor this morning. She left her card with the receptionist. Nobody picked it up.',
      escalation:[
        'A subpoena arrives for client records from three years ago.',
        'A colleague you trusted is cooperating with the investigation.',
        'Your accountant tells you there are questions about the offshore accounts.',
        'Moss approaches you directly at a restaurant. She sits down without being invited. She orders water.',
        'The indictment is sealed. She calls you personally before the news breaks.',
      ],
      finalMove:'She offers you a deal. The deal is reasonable. Whether you take it defines who you are.',
    },
    {
      name:'Victor Chase',
      title:'The Rival',
      motivation:'Was the best broker on the floor before you arrived. Has been there seven years. Watched three people try to take his position. Watched all three fail. Considers this educational.',
      firstHint:'Your best client calls to say someone else reached out. They describe the pitch. It is better than yours.',
      escalation:[
        'Chase takes two of your top clients in one week.',
        'He starts a rumour about you with the compliance team.',
        'He is promoted to floor manager. Your direct manager now reports to him.',
        'He offers you a partnership. The terms are not what they appear to be.',
        'You discover he has been shorting stocks in companies he recommended to clients.',
      ],
      finalMove:'You have evidence against him. Using it will destroy him. It will also expose how you got it.',
    },
  ],
}

const ACHIEVEMENTS: Record<string,{title:string,desc:string,tier:'bronze'|'silver'|'gold'|'platinum'}> = {
  first_choice:{title:'First Decision',desc:'You made your first choice.',tier:'bronze'},
  loyalty_test:{title:'Loyal',desc:'Chose loyalty when ambition was easier.',tier:'silver'},
  act_2:{title:'Rising Tension',desc:'Survived into Act 2.',tier:'bronze'},
  act_3:{title:'The Crisis',desc:'Reached the crisis point.',tier:'silver'},
  act_4:{title:'Confrontation',desc:'Faced your greatest challenge.',tier:'gold'},
  world_complete:{title:'Legend',desc:'Completed a full world simulation.',tier:'platinum'},
  dragon_bonded:{title:'Dragon Rider',desc:'Bonded with a dragon.',tier:'gold'},
  villain_faced:{title:'Face to Face',desc:'Met the villain directly.',tier:'silver'},
  transfer_complete:{title:'New Chapter',desc:'Completed a major transfer.',tier:'bronze'},
  world_cup:{title:'World Stage',desc:'Played in a World Cup.',tier:'gold'},
  world_cup_winner:{title:'Champion of the World',desc:'Won the World Cup.',tier:'platinum'},
  injury_return:{title:'Comeback',desc:'Returned from a serious injury.',tier:'silver'},
  retire_peak:{title:'On My Terms',desc:'Retired at the peak of your powers.',tier:'gold'},
  man_of_match:{title:'Man of the Match',desc:'Won your first man of the match award.',tier:'bronze'},
  century:{title:'100 Appearances',desc:'Made 100 career appearances.',tier:'silver'},
}

const WORLDS = [
  {
    id:'arcane',name:'Arcane Academy',icon:'🔮',
    desc:"Enter the world's greatest magical academy. Master spells, choose your house, face a villain who has been hiding in plain sight for years.",
    theme:'MAGIC · POWER · RIVALRY',
    factions:['House Aetheris','House Drakemore','House Umbra','House Sylvara'],
    factionDesc:{
      'House Aetheris':'Intelligence and knowledge. Values strategy over brute force. Produces great scholars and subtle manipulators.',
      'House Drakemore':'Courage and honour. Values action and protection of others. Produces the academy\'s greatest duelists.',
      'House Umbra':'Ambition and cunning. Values power above all. Produces the academy\'s most controversial and successful wizards.',
      'House Sylvara':'Nature and creativity. Values discovery and expression. Produces the academy\'s most unconventional wizards.',
    },
    factionTiming:'early',
    startStat:{Spellcasting:20,Knowledge:20,Courage:15,Control:15,HousePoints:0},
    locations:['Courtyard','Great Hall','Dormitories','Dueling Arena','Forbidden Library','Potion Hall'],
    startItems:['📜 Academy Letter'],
    startQuests:[{name:'The Sorting Ceremony',desc:'Tonight you discover which house will shape your destiny.'}],
    startRels:[
      {name:'Prof. Aldric',type:'Mentor',val:60,dir:'friend'},
      {name:'Kira Voss',type:'Rival',val:30,dir:'rival'},
      {name:'Finn Ashwood',type:'Classmate',val:50,dir:'neutral'},
      {name:'Maya Bellcroft',type:'Classmate',val:45,dir:'neutral'},
    ],
    startNews:['Something strange happened in the east corridor last night. Nobody is talking about it.','House championship standings posted — competition begins this term.','Three restricted texts have gone missing from the archive.'],
    customCreation:'wand',
  },
  {
    id:'galactic',name:'Galactic Frontier',icon:'🚀',
    desc:'Command a starship, choose your allegiance, and face an emperor who has never lost a war.',
    theme:'FREEDOM · REBELLION · ORDER',
    factions:['Vanguard Alliance','Iron Dominion','Nova Syndicate','Celestial Order'],
    factionDesc:{
      'Vanguard Alliance':'Defenders of freedom. Outnumbered but principled.',
      'Iron Dominion':'Order through absolute control. Enormous resources. No mercy for dissent.',
      'Nova Syndicate':'Smugglers and traders. No allegiance except profit.',
      'Celestial Order':'Ancient mystics. Neutral until the balance tips too far.',
    },
    factionTiming:'early',
    startStat:{Piloting:30,Combat:25,Diplomacy:20,CrewLoyalty:50,Credits:1000,GalacticRep:0},
    locations:['Bridge','Hangar','Trade Station','Combat Zone','Celestial Ruins',"Emperor's Domain"],
    startItems:['🚀 Scout Vessel'],
    startQuests:[{name:'Choose Your Allegiance',desc:'Four factions want your skills. Only one will define your destiny.'}],
    startRels:[
      {name:'Commander Lyra',type:'Ally',val:60,dir:'friend'},
      {name:'Admiral Kross',type:'Enemy',val:10,dir:'rival'},
      {name:'Zara Venn',type:'Informant',val:45,dir:'neutral'},
    ],
    startNews:['Iron Dominion destroys a Vanguard outpost in Sector 7.','Nova Syndicate puts bounty on an Iron Dominion officer.','Celestial Order breaks silence after forty years.'],
    customCreation:'saber',
  },
  {
    id:'champions',name:'Champions Legacy',icon:'⚽',
    desc:'From unknown youth to global icon. Every decision shapes the career. The obstacles are human, institutional, and sometimes yourself.',
    theme:'FAME · SACRIFICE · RIVALRY',
    factions:['Crimson United','Royal Blue Academy','Blackstone FC','Golden City Academy','Phoenix Athletic'],
    factionDesc:{
      'Crimson United':'Historic club. Enormous pressure and tradition.',
      'Royal Blue Academy':'Technical perfection expected. Best coaching in the world.',
      'Blackstone FC':'Defensive discipline. Coaches who break players to rebuild them.',
      'Golden City Academy':'Wealthy and modern. Politics and money drive everything.',
      'Phoenix Athletic':'The underdog club. Everyone here has something to prove.',
    },
    factionTiming:'early',
    startStat:{Overall:45,Speed:40,Skill:38,Shooting:35,Passing:40,Stamina:60,Leadership:20,Reputation:0},
    locations:['Training Ground','Stadium','Gym','Scout Event','Press Room','Academy HQ'],
    startItems:['👟 Standard Boots'],
    startQuests:[{name:'The First Trial',desc:'One week. Forty players. One contract. Impress the coaches or go home.'}],
    startRels:[
      {name:'Coach Ramos',type:'Coach',val:50,dir:'friend'},
      {name:'Jamie Osei',type:'Teammate',val:40,dir:'neutral'},
      {name:'Marco Delgado',type:'Veteran',val:55,dir:'friend'},
      {name:'Tyler Ash',type:'Captain',val:35,dir:'neutral'},
      {name:'Luca Moretti',type:'Rival',val:20,dir:'rival'},
    ],
    startNews:['Three clubs announce record youth budgets this summer.','New youth regulations — academy contracts must be offered by week two.','Scout network expanding across lower league clubs.'],
    customCreation:'position',
  },
  {
    id:'hero',name:'Hero Nexus',icon:'⚡',
    desc:'Master your power, earn public trust, rise to rank one. But something is removing hero powers permanently.',
    theme:'POWER · FAME · SACRIFICE',
    factions:['Titan Academy','Sentinel Academy','Nexus Institute','Phoenix Academy'],
    factionDesc:{
      'Titan Academy':'Raw power. Physical strength above all. Most famous heroes, most reckless.',
      'Sentinel Academy':'Protection first. Least famous, most respected by civilians.',
      'Nexus Institute':'Technology and intelligence. Solve problems before they become fights.',
      'Phoenix Academy':'Elite combat. Most decorated heroes. Also the most burned out.',
    },
    factionTiming:'early',
    startStat:{Power:30,Control:20,Courage:35,PublicTrust:40,HeroRank:99,Teamwork:30},
    locations:['Training Hall','City Center','Hero HQ','Crisis Zone','Media Plaza','Villain Lair'],
    startItems:['🦸 Standard Hero Suit'],
    startQuests:[{name:'First Assignment',desc:'Respond to the downtown incident. Director Crane is watching.'}],
    startRels:[
      {name:'Director Crane',type:'Handler',val:55,dir:'friend'},
      {name:'Shadow Wolf',type:'Rival',val:25,dir:'rival'},
      {name:'Mira Cole',type:'Teammate',val:45,dir:'neutral'},
    ],
    startNews:['Three heroes lose their powers in separate incidents this week.','Hero Rankings updated — top spot vacant for first time in a decade.','New hero licensing law passes — registration now mandatory.'],
    customCreation:'power',
  },
  {
    id:'dragonfall',name:'Dragonfall Kingdoms',icon:'🐉',
    desc:'Lead armies, earn a dragon, and claim the throne. Your dragon will find you. No rider has ever chosen their own.',
    theme:'LEGACY · POWER · LOYALTY',
    factions:['Emberhold','Frostmere','Thornvale','Goldcrest'],
    factionDesc:{
      'Emberhold':'Warriors and dragon riders. Fierce and passionate. First into every battle.',
      'Frostmere':'Northern clans. Endurance and patience. Strike once, strike decisively.',
      'Thornvale':'Archers and beast tamers. Guerrilla warfare. Know every forest path.',
      'Goldcrest':'Diplomats and royalty. Win through alliances. Last resort is war.',
    },
    factionTiming:'early',
    startStat:{Leadership:25,ArmyStrength:30,DragonBond:0,Diplomacy:20,Territory:1,Gold:500},
    locations:['Throne Room','Battleground','Dragon Eyrie','Trade Port','Rival Kingdom','Ancient Ruins'],
    startItems:['🗡️ Steel Blade','📜 Land Deed'],
    startQuests:[{name:'Prove Your Worth',desc:'Win the regional tournament and earn the right to be heard by the great lords.'}],
    startRels:[
      {name:'Lord Eryn',type:'Advisor',val:65,dir:'friend'},
      {name:'Lord Kael',type:'Rival',val:20,dir:'rival'},
      {name:'Serana',type:'Ally',val:50,dir:'neutral'},
    ],
    startNews:['Border villages report fires with no explanation.','Dragon eggs discovered near Crystal Peaks — three armies already moving.','Goldcrest opens emergency alliance negotiations.'],
    customCreation:'dragon',
  },
  {
    id:'shadow',name:'Shadow Guild',icon:'🕶️',
    desc:'Rise through the ranks of a secret brotherhood. Like Assassins Creed — loyalty, betrayal, hidden blades, and a creed that will be tested.',
    theme:'HONOUR · BETRAYAL · FREEDOM',
    factions:['Night Ravens','Phantom Circle','Iron Blades','Whisper Network'],
    factionDesc:{
      'Night Ravens':'Stealth and assassination. The purest expression of the creed.',
      'Phantom Circle':'Deception and infiltration. Become anyone.',
      'Iron Blades':'Mercenaries and enforcers. Less subtle, more brutal, essential.',
      'Whisper Network':'Information brokers. Power without ever drawing a blade.',
    },
    factionTiming:'late',
    startStat:{Stealth:30,Influence:15,Trust:50,Resources:200,Reputation:0,DistrictControl:0},
    locations:['Safe House','Black Market','City Hall','Rival Territory','The Vault',"Regent's Tower"],
    startItems:['🗡️ Hidden Blade','🪙 Guild Coin'],
    startQuests:[{name:'The Initiation',desc:'Complete your first contract alone. No backup. No second chances.'}],
    startRels:[
      {name:'Handler Zero',type:'Mentor',val:60,dir:'friend'},
      {name:'The Fox',type:'Rival',val:15,dir:'rival'},
      {name:'Asha',type:'Fellow Initiate',val:50,dir:'neutral'},
    ],
    startNews:['Three guild members found dead — inside job suspected.','A powerful artefact has surfaced in the black market.','The city guard doubles patrols in the merchant district.'],
    customCreation:'creed',
  },
  {
    id:'neon',name:'Neon Domination',icon:'🌆',
    desc:'In a Cyberpunk city, your augmentations define you. Rise against a system designed to own you.',
    theme:'IDENTITY · POWER · CORRUPTION',
    factions:['Helix Industries','NovaCore','Synapse Systems','Apex Dynamics'],
    factionDesc:{
      'Helix Industries':'Technology monopoly. Owns the implant market.',
      'NovaCore':'Energy corporation. Controls the city\'s power.',
      'Synapse Systems':'AI development. The villain\'s company. Most powerful, most watched.',
      'Apex Dynamics':'Military technology. Private armies. Brutal efficiency.',
    },
    factionTiming:'late',
    startStat:{Wealth:2000,Influence:10,Cybernetics:5,Hacking:20,CorporatePower:0,StreetRep:30},
    locations:['Corporate HQ','Neon Markets','Server Farm','Street Level',"Director's Tower",'Underground'],
    startItems:['📱 Burner Deck','🪙 500 Credits'],
    startQuests:[{name:'First Move',desc:'Sable says you have 48 hours before they find you. Make them count.'}],
    startRels:[
      {name:'Sable',type:'Ally',val:55,dir:'friend'},
      {name:'Ghost',type:'Fixer',val:40,dir:'neutral'},
      {name:'Dir. Kron',type:'Enemy',val:5,dir:'rival'},
    ],
    startNews:['Neural integration programme enters Phase 2.','Underground resistance cell found and neutralised — 12 arrested.','Helix Industries stock up forty percent this quarter.'],
    customCreation:'implant',
  },
  {
    id:'odyssey',name:'Eternal Odyssey',icon:'⚔️',
    desc:'In ancient Greece, the gods chose a champion. The Eternal King is returning and Olympus has gone silent.',
    theme:'DESTINY · HONOUR · LEGACY',
    factions:['Dawnseekers','Moonwardens','Stormforged','Celestial Keepers'],
    factionDesc:{
      'Dawnseekers':'Heroes and warriors. Favoured by Ares and Apollo. Glory through great deeds.',
      'Moonwardens':'Mystics and seers. Favoured by Artemis. Power through hidden knowledge.',
      'Stormforged':'Blacksmiths and builders. Favoured by Hephaestus. Strength through what you create.',
      'Celestial Keepers':'Guardians of divine relics. Favoured by Zeus and Athena. Duty above personal glory.',
    },
    factionTiming:'early',
    startStat:{Courage:30,Wisdom:25,Strength:35,ArtifactPower:0,MythicRep:0,Exploration:10},
    locations:['Oracle Temple','Ancient Ruins','Colosseum','Mystic Forest',"Titan's Peak",'Eternal Gate'],
    startItems:['🏺 Oracle Token'],
    startQuests:[{name:'The Oracle Speaks',desc:'The Oracle of Delphi has spoken your name. Find out why.'}],
    startRels:[
      {name:'Sage Pyrene',type:'Oracle',val:70,dir:'friend'},
      {name:'General Vorn',type:'Enemy',val:10,dir:'rival'},
      {name:'Lysander',type:'Fellow Hero',val:50,dir:'neutral'},
    ],
    startNews:["The Eternal King's shadow has been seen at the Oracle Temple.",'Three heroes have already failed the first divine trial.','Olympus has gone silent — the gods are not answering prayers.'],
    customCreation:'weapon',
  },
  {
    id:'greed', name:'Greed: The Floor', icon:'💹',
    desc:'New York 1987. You are broke, ambitious, and standing outside a brokerage firm on your first day. Everyone in that building started where you are. Most of them are still there.',
    theme:'WEALTH · POWER · CONSEQUENCE',
    villain:'The System',
    villainDesc:'There is no single villain. There is the SEC investigator who has been watching your firm for two years. There is the rival broker who wants your clients. There is your own ambition which has never once told you to stop.',
    factions:['Stratton & Pierce','Manhattan Elite','The Independents','Federal Oversight'],
    factionDesc:{
      'Stratton & Pierce':'The corrupt boiler room firm that gives you your first job. High pressure, high reward, legally questionable. The fastest path to money. Also the fastest path to prison.',
      'Manhattan Elite':'The legitimate old money firms on the upper floors. Slower money but cleaner. Harder to get into. Once you are in the doors open everywhere.',
      'The Independents':'Brokers who left the big firms and went out alone. Maximum freedom, maximum risk, no safety net.',
      'Federal Oversight':'You do not join this faction. They join you. When the SEC starts watching it changes every decision you make.',
    },
    factionTiming:'early',
    startStat:{Wealth:0,Charisma:40,Ruthlessness:20,Reputation:10,NetworkValue:0,LegalRisk:0},
    locations:['The Floor','Client Calls','The Club','Federal Building','The Hamptons','Your Office'],
    startItems:['📞 Cold Call List','💼 Entry Level Suit'],
    startQuests:[{name:'First Sale',desc:'Make your first commission. Any way you can.'}],
    startRels:[
      {name:'Danny Rourke',type:'Mentor',val:50,dir:'friend'},
      {name:'Victor Chase',type:'Rival',val:20,dir:'rival'},
      {name:'Agent Sarah Moss',type:'Investigator',val:30,dir:'rival'},
      {name:'Christine Walsh',type:'Client',val:60,dir:'friend'},
    ],
    startNews:[
      'The Floor: Record commission week reported at Stratton and Pierce.',
      'The Floor: SEC opens preliminary inquiry into three downtown brokerages.',
      'The Floor: New hire class of 87 largest in firm history.',
    ],
    customCreation:'broker',
  },
]

const defaultPlayer = () => ({
  name:'', age:16, traits:[] as string[], goal:'', nationality:'',
  level:1, xp:0, xpNext:100, reputation:0, wealth:0,
  currentWorld:'', currentLocation:'', currentFaction:'',
  currentChapter:0,
  skills:{} as Record<string,number>,
  relationships:[] as any[],
  inventory:[] as string[],
  quests:[] as any[],
  achievements:[] as string[],
  majorDecisions:[] as string[],
  storyProgress:0,
  worldState:{} as Record<string,any>,
  newsHistory:[] as string[],
  saveSlot:1,
  position:'',
  customItem:null as any,
  villain:null as any,
  careerStats:{
    appearances:0, goals:0, assists:0, cleanSheets:0,
    averageRating:0, allRatings:[] as number[],
    trophies:[] as string[],
    clubs:[] as string[],
    marketValue:0, wage:0,
    internationalCaps:0, internationalGoals:0,
    worldCupAppearances:0, worldCupWinner:false,
    currentYear:1, age:16, retired:false,
    seasonStats:{apps:0,goals:0,assists:0,ratings:[] as number[]},
  },
})

const G: Record<string,React.CSSProperties> = {
  app:{minHeight:'100vh',background:'#0A0A0C',color:'#E8E4D8',fontFamily:"'Rajdhani',sans-serif",fontSize:'15px'},
  center:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',gap:'16px'},
  gold:{color:'#D4A843'},
  gold2:{color:'#F0C060'},
  muted:{color:'#7A7A8A'},
  surface:{background:'#1A1A24',border:'1px solid #2A2A3A',borderRadius:'2px',padding:'20px'},
  sideLabel:{color:'#D4A843',fontSize:'9px',letterSpacing:'4px',borderBottom:'1px solid #2A2A3A',paddingBottom:'6px',marginBottom:'10px'},
  input:{width:'100%',background:'#1A1A24',border:'1px solid #3A3A4A',color:'#E8E4D8',padding:'12px 16px',fontFamily:"'Rajdhani',sans-serif",fontSize:'16px',outline:'none',borderRadius:'2px',boxSizing:'border-box' as const},
  label:{display:'block',color:'#D4A843',fontSize:'11px',letterSpacing:'3px',marginBottom:'8px'},
  btnGold:{background:'linear-gradient(135deg,#8B6914,#D4A843)',color:'#0A0A0C',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'14px 48px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'14px',borderRadius:'2px'},
  btnGhost:{background:'transparent',color:'#D4A843',border:'1px solid #8B6914',fontFamily:"'Rajdhani',sans-serif",fontWeight:600,padding:'10px 32px',cursor:'pointer',letterSpacing:'2px',fontSize:'14px',borderRadius:'2px'},
  topbar:{background:'#0F0F14',borderBottom:'1px solid #2A2A3A',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky' as const,top:72,zIndex:40},
}

export default function Play() {
  const [screen, setScreen] = useState('splash')
  const [player, setPlayer] = useState(defaultPlayer())
  const [currentWorld, setCurrentWorld] = useState<any>(null)
  const [currentScene, setCurrentScene] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
  const [sceneHistory, setSceneHistory] = useState<string[]>([])
  const [saveMsg, setSaveMsg] = useState('')
  const [hasError, setHasError] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [nextAct, setNextAct] = useState<any>(null)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [activeMinigame, setActiveMinigame] = useState<string|null>(null)
  const [showMatchReport, setShowMatchReport] = useState<any>(null)
  const [showSeasonSummary, setShowSeasonSummary] = useState<any>(null)
  const [showTransferWindow, setShowTransferWindow] = useState<any>(null)
  const [showChapterCard, setShowChapterCard] = useState<any>(null)
  const [showSaveSlots, setShowSaveSlots] = useState<'save'|'load'|null>(null)
  const [showDragonBond, setShowDragonBond] = useState(false)
  const [bondedDragon, setBondedDragon] = useState<any>(null)
  const [trophyQueue, setTrophyQueue] = useState<any[]>([])
  const [currentTrophy, setCurrentTrophy] = useState<any>(null)
  const [wandWood, setWandWood] = useState<any>(null)
  const [wandCore, setWandCore] = useState<any>(null)
  const [wandLength, setWandLength] = useState<any>(null)
  const [saberColor, setSaberColor] = useState<any>(null)
  const [cybernetic, setCybernetic] = useState<any>(null)
  const [greekWeapon, setGreekWeapon] = useState<any>(null)
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedPower, setSelectedPower] = useState('')
  const [selectedCreed, setSelectedCreed] = useState('')
  const [selectedBroker, setSelectedBroker] = useState<any>(null)
  const historyRef = useRef<any[]>([])
  const { tier, userId } = useSubscription()
  const [paywallHit, setPaywallHit] = useState<string | null>(null)

  const fonts = <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet"/>

  useEffect(() => {
    if (!currentTrophy && trophyQueue.length > 0) {
      setCurrentTrophy(trophyQueue[0])
      setTrophyQueue(q => q.slice(1))
    }
  }, [trophyQueue, currentTrophy])


  const pickVillain = (worldId: string) => {
    const pool = VILLAIN_POOLS[worldId] || []
    if (pool.length === 0) return null
    return {...pool[Math.floor(Math.random() * pool.length)]}
  }

  const buildOpeningPrompt = (p: any, w: any, item: any): string => {
    const itemDesc = item ? `Their custom item: ${item.displayName || item.name}. ${item.meaning || item.desc || ''}` : ''
    const openers: Record<string, string> = {
      arcane: `Write the opening scene of a Harry Potter inspired magic school story for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}. ${itemDesc} First day at Arcane Academy. The Sorting Ceremony is tonight. Prof. Aldric is warm but watchful. Kira Voss dismisses ${p.name} immediately. Write a vivid specific scene with real magical world details. Include one line of realistic dialogue. End with a genuine choice about how ${p.name} presents themselves at the ceremony. Reference their wand naturally.`,
      champions: `Write the opening scene of a realistic football career story for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}, position: ${p.position || item?.name || 'unknown'}, nationality: ${p.nationality}. They have arrived for their first trial. Coach Ramos has 40 players to assess this week. Luca Moretti arrived yesterday and has already impressed. Jamie Osei watches ${p.name} with competitive eyes. Create a scene set in a specific training drill for their position. Use real football tactical language. Include one line of coaching dialogue. End with a real tactical or personal decision.`,
      galactic: `Write the opening scene of a Star Wars inspired space epic for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}. ${itemDesc} They have just chosen a ${item?.color || 'unknown'} lightsaber which means ${item?.meaning || ''}. Initial faction alignment: ${item?.faction || 'undecided'}. Commander Lyra is their first contact. Create a vivid opening aboard a frontier vessel. Include one line of dialogue. End with a decision that reveals who ${p.name} is.`,
      hero: `Write the opening scene of a superhero origin story for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}, power: ${p.customItem?.name || item?.name || 'unknown'}. Just received their hero licence. Director Crane is demanding. Shadow Wolf resents being their supervisor. Create a specific opening at Hero HQ. Include one line of dialogue. End with a choice that reveals who ${p.name} will become.`,
      dragonfall: `Write the opening scene of a Game of Thrones inspired medieval story for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}. They have arrived at the regional tournament. Lord Eryn believes in them but the other lords are skeptical. Lord Kael has paid for the best fighter in the region to face ${p.name}. Their dragon has not yet bonded with them — it must be earned. Create a vivid scene with political tension and specific medieval details. Include one line of dialogue. End with a strategic decision.`,
      shadow: `Write the opening scene of an Assassins Creed inspired story for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}, creed: ${item?.name || 'unknown'}. They have just completed initiation and received their hidden blade. Handler Zero is cold and professional. Asha watches with uncertain alliance. Create a scene with real assassin brotherhood texture. Include one line of dialogue from Handler Zero. End with a real decision about the first job.`,
      neon: `Write the opening scene of a Cyberpunk inspired story for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}, augmentation: ${item?.name || 'unknown'} — ${item?.desc || ''}. Operating in a city where the villain is 18 months from completing a plan to merge human consciousness with AI. Sable is their contact — urgent and paranoid. Create a vivid cyberpunk opening with specific technology details. Include one line of dialogue. End with a real first move decision where every option has a genuine cost.`,
      odyssey: `Write the opening scene of a Greek mythology story for ${p.name}. Age ${p.age}, traits: ${p.traits.join(', ')}, goal: ${p.goal}, divine weapon: ${item?.name || 'unknown'} — ${item?.desc || ''}. They have arrived at the Oracle Temple after weeks of travel. Sage Pyrene has been waiting specifically for them. General Vorn's soldiers block the entrance demanding tribute. Create a vivid scene with specific Greek world details. Include one line of cryptic dialogue from Pyrene. End with a real decision about how to get past Vorn's soldiers.`,
      greed: `You are writing the opening scene of a 1980s Wall Street story for ${p.name}. Their background is ${item?.name || 'unknown'} — ${item?.desc || ''}. It is their first day on the floor at Stratton and Pierce. Danny Rourke is the veteran broker who has been assigned to show them around. Victor Chase clocks the new arrival from across the floor and says nothing. The floor is loud, chaotic, and smells like cigarettes and desperation and money. Create a vivid specific opening scene that establishes the world immediately. Include one line of dialogue from Danny Rourke that tells you everything about who he is. End with a real first decision — something small but revealing about the kind of broker this person is going to become.`,
    }
    return openers[w.id] ?? `${p.name} enters ${w.name} for the first time. Create a dramatic opening scene that pulls them in immediately.`
  }

  const buildSystemPrompt = (p: any, w: any): string => {
    const act = getAct(p.storyProgress, w.id)
    const sceneInAct = p.storyProgress - act.range[0] + 1
    const totalInAct = act.range[1] - act.range[0] + 1
    const villain = p.villain
    const newsSource = WORLD_NEWS_SOURCE[w.id] || 'World News'
    const chapterName = CHAPTER_NAMES[w.id]?.[p.currentChapter] || 'The Journey'

    return `You are the AI game master for REVENIO. Generate short punchy video game scenes. Cutscene, not novel.

WORLD: ${w.name}
WORLD STYLE: ${
  w.id==='arcane'?'Harry Potter. Warm specific magic. Tiny details — a worried portrait, a spell that smells of burnt sugar.':
  w.id==='champions'?'Real football journalism. Tactical, specific, emotional. Real terms — pressing triggers, half-spaces. Real wages and fees.':
  w.id==='galactic'?'Star Wars. Cinematic, sparse. Big stakes in small moments. Clipped dialogue.':
  w.id==='dragonfall'?'Game of Thrones. Political, brutal. Nobody is safe. Violence has weight.':
  w.id==='shadow'?'Assassins Creed. Brotherhood weight, moral grey. Trust earned slow, broken fast.':
  w.id==='neon'?'Cyberpunk 2077. Neon and grit. Augments cost identity. The city is a character.':
  w.id==='odyssey'?'Greek myth. Gods are real, petty, magnificent. Fate is weight.':
  w.id==='greed'?'1980s and 1990s Wall Street. Gordon Gekko energy. Specific dollar amounts. Cigarette smoke, brick phones, ticker tape. Every line costs or earns something.':
  'Cinematic. Specific. Vivid.'}
VILLAIN THIS RUN: ${villain ? `${villain.name} — ${villain.motivation || villain.description || ''}` : 'Unknown'}
CHAPTER: ${p.currentChapter + 1} — ${chapterName}
PLAYER: ${p.name}, Age ${p.careerStats?.age || p.age}, Level ${p.level}
NATIONALITY: ${p.nationality || 'Unknown'}
TRAITS: ${p.traits.join(', ')}
GOAL: ${p.goal}
POSITION: ${p.position || 'Unknown'}
FACTION: ${p.currentFaction || 'None yet'}
CUSTOM ITEM: ${p.inventory.slice(0, 3).join(', ') || 'None'}
STATS: ${JSON.stringify(p.skills)}
RELATIONSHIPS: ${JSON.stringify(p.relationships.slice(0, 6).map((r: any) => ({name: r.name, type: r.type, val: r.val, dir: r.dir})))}
ACTIVE QUESTS: ${p.quests.filter((q: any) => !q.done).slice(0, 3).map((q: any) => q.name).join(', ') || 'None'}
KEY PAST DECISIONS: ${p.majorDecisions.slice(-6).join(' | ') || 'None yet'}
STORY PROGRESS: ${p.storyProgress} of ${getTotalScenes(w.id)}
ACT: ${act.id} of ${getWorldActs(w.id).length} — ${act.name}
SCENE: ${sceneInAct} of ${totalInAct} in this act
${w.id === 'champions' ? `CAREER: Apps ${p.careerStats?.appearances || 0}, Goals ${p.careerStats?.goals || 0}, Assists ${p.careerStats?.assists || 0}, Avg Rating ${p.careerStats?.averageRating?.toFixed(1) || 'N/A'}, Club ${p.worldState?.club || 'Academy'}, Year ${p.careerStats?.currentYear || 1}` : ''}
${w.id === 'greed' ? `WEALTH: Net Worth $${(p.worldState?.netWorth || 0).toLocaleString()}, Total Commission $${(p.worldState?.totalCommission || 0).toLocaleString()}, Clients ${p.worldState?.clientCount || 0}, Legal Risk ${p.skills?.LegalRisk || 0}/100, Reputation ${p.skills?.Reputation || 0}, Year ${p.worldState?.year || 1987}` : ''}

SCENE RULES (STRICT):
- sceneText: MAX 40 words. Two short sentences. ONE concrete image. ONE line of dialogue. That's it.
- No prose, no metaphor, no scene-setting paragraphs. Action and dialogue only.
- sceneTitle: MAX 5 words.
- Each choice text: MAX 10 words. Concrete actions, not vibes.
- Choices must be mechanically different — different stat outcomes, different consequences.
- At least 2 stats change every scene.
- Reference at least one past decision once past the first act.

${w.id === 'champions' ? `FOOTBALL RULES — FULL CAREER (age 16 → 45, ~90 scenes across 7 chapters):
Chapter 1 — The Trial (age 16-17): Youth academy, position battles, first youth match.
Chapter 2 — First Contract (age 17-19): Pro signing, loan moves, breakthrough season.
Chapter 3 — Breaking Through (age 19-22): First-team starts, derbies, first international call-up.
Chapter 4 — The Transfer (age 22-25): Major transfer, dressing room politics, first trophies.
Chapter 5 — Peak Years (age 25-30): Champions League, Ballon d'Or contention, World Cup.
Chapter 6 — The Final Push (age 30-34): Veteran leader, younger rivals, legacy questioned.
Chapter 7 — Legacy Season (age 34-45): Final clubs, retirement decision, the ending you earned.
MATCH SCENES: Include matchReport with real stats. Never offer "score a goal" — offer tactical decisions.
TRANSFER WINDOWS: Include transferWindow with 2-3 clubs, wages, fees, pros/cons.
SEASON END: Every 8-10 scenes generate seasonSummary.
WORLD CUP: Trigger every 4 in-game years if international stats qualify.
INJURIES: Specific — "Grade 2 hamstring — 6 weeks".` : ''}

${w.id === 'arcane' ? `ARCANE RULES — 7 SCHOOL YEARS (~78 scenes):
Each chapter = one school year. Year 1 arrival → Year 7 final reckoning.
Villain NOT named or identified until Year 4 minimum.
Reference the player's specific wand in dueling and spell scenes.
Spells have named, authentic forms.` : ''}

${w.id === 'odyssey' ? `ODYSSEY RULES:
Name specific Greek gods. Their favour shifts events.
Mythological creatures use real mythological weaknesses.
Oracle prophecies are cryptic but resolve literally in hindsight.` : ''}

${w.id === 'greed' ? `GREED WORLD RULES:
This is 1980s and 1990s Wall Street. Every scene must feel like it costs something or gains something. Money is kept in exact figures — not vague, always specific dollar amounts. Commission on a sale, current account balance, what a client is worth.

ACT STRUCTURE:
Act 1 (scenes 0-4): The floor. Cold calls. First sales. Learning the game. The smell of the place. Danny Rourke teaching you things they do not teach in school.
Act 2 (scenes 5-9): You are good at this. Maybe too good. The first ethically questionable decision. The first real money. The first glimpse of how far this could go.
Act 3 (scenes 10-14): You have a book of clients. Real money coming in. The SEC is a rumour on the floor. Victor Chase is a problem. A choice between the clean path and the faster path.
Act 4 (scenes 15-19): The investigation is real. Agent Moss is real. The money is extraordinary. The risk is extraordinary. Every decision from Act 1 is coming back.
Act 5 (scenes 20-24): The reckoning. Prison, escape, legitimacy, or something in between. The ending reflects every choice. The richest person in the room is not always the one who won.

CHOICE RULES FOR GREED:
Never write vague choices. Always write specific financial or personal decisions.
Good choice examples:
- Recommend the penny stock to the client knowing it is being pumped. Commission is 8400 dollars.
- Tell the client the truth about the risk. Lose the sale. Keep your record clean.
- Move 200k through the offshore account in the Caymans. Moss will never trace it.
- Call Danny. He has done this before. He knows how to make the paper trail disappear.
Bad choice examples (never write these):
- Try your best
- Work hard
- Be honest
- Make a good impression

The LegalRisk stat is critical. If it reaches 80 Agent Moss makes her move regardless of story progress. If it reaches 100 the player is indicted. This must be tracked and referenced in every scene from Act 2 onward.

Wealth is tracked in exact dollars. Show current net worth in the career stats bar. Update worldStateUpdates.netWorth, worldStateUpdates.totalCommission, worldStateUpdates.clientCount, and worldStateUpdates.year (starting at 1987) every scene where they change.

The player can become the richest person in the world but only if they survive the investigation. Getting rich through fraud is a valid path but the consequences are real.` : ''}

VILLAIN BUILDUP (based on % through full story):
${(() => {
  const pct = p.storyProgress / Math.max(1, getTotalScenes(w.id))
  if (pct < 0.35) return 'Villain is background only — rumours, indirect effects, no direct appearance.'
  if (pct < 0.55) return 'Villain makes a significant indirect move. Player feels consequences but does not meet them.'
  if (pct < 0.75) return 'Villain appears directly for the first time. Must feel earned.'
  if (pct < 0.92) return 'Villain escalates. Direct conflict, personal stakes, allies fall.'
  return 'Final confrontation. Everything the player built determines the outcome.'
})()}

FACTION RULE: ${w.factionTiming === 'early' ? 'If player has no faction yet this scene should offer or force a faction choice.' : 'Faction loyalty builds gradually. Do not force it.'}

RESPOND WITH ONLY THIS JSON NO MARKDOWN NO BACKTICKS:
{"sceneTitle":"max 5 words","sceneText":"MAX 40 words. Two short sentences. One image. One dialogue line.","imagePrompt":"detailed cinematic scene description","choices":[{"id":"A","text":"max 10 words","type":"bold","risk":"Low","hint":"specific consequence","statPreview":{"StatName":5}},{"id":"B","text":"max 10 words","type":"strategic","risk":"Medium","hint":"specific consequence","statPreview":{"StatName":3}},{"id":"C","text":"max 10 words","type":"loyal","risk":"High","hint":"specific consequence","statPreview":{"StatName":-2}},{"id":"D","text":"Write your own action","type":"custom","risk":"Variable","hint":"anything goes","statPreview":{}}],"statChanges":{"StatName":5,"StatName2":-2},"xpGained":15,"reputationChange":3,"relationshipChanges":[{"name":"Name","change":10,"dir":"friend"}],"inventoryUnlocks":[],"questUpdates":[],"newQuests":[],"newAchievements":[],"newsUpdates":["${newsSource}: specific headline"],"worldStateUpdates":{},"matchReport":null,"seasonSummary":null,"transferWindow":null,"chapterComplete":false,"factionEvent":"","isFinalScene":false,"legacyTitle":"","legacyEnding":""}`

  }

  const callAI = async (msg: string, pOverride?: any, wOverride?: any, isOpening?: boolean): Promise<any> => {
    const p = pOverride ?? player
    const w = wOverride ?? currentWorld
    if (!w) return null
    historyRef.current.push({role: 'user', content: msg})
    try {
      const { data, error } = await supabase.functions.invoke('ai-scene', {
        body: {
          system: buildSystemPrompt(p, w),
          messages: historyRef.current,
          worldId: w.id,
          isOpening: !!isOpening,
        },
      })
      if (error) {
        // Supabase wraps non-2xx; check the underlying message
        const errMsg = (error as any)?.message || ''
        if (errMsg.includes('paywall') || errMsg.includes('limit') || errMsg.includes('Legend') || errMsg.includes('Immortal')) {
          setPaywallHit(errMsg.includes('Immortal') ? 'immortal' : 'legend')
        }
        throw error
      }
      if (data?.error) {
        if (data.paywall || /limit|Legend|Immortal/.test(data.error)) {
          setPaywallHit(/Immortal/.test(data.error) ? 'immortal' : 'legend')
        }
        throw new Error(data.error)
      }
      const raw = (data?.content || []).map((c: any) => c.text || '').join('')
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('no json')
      const scene = JSON.parse(match[0])
      historyRef.current.push({role: 'assistant', content: raw})
      if (historyRef.current.length > 20) historyRef.current = historyRef.current.slice(-20)
      return scene
    } catch (e) {
      console.error('callAI error:', e)
      historyRef.current.pop()
      return null
    }
  }


  const applyScene = (s: any): any[] => {
    const n: any[] = []
    setPlayer(prev => {
      const next = {
        ...prev,
        skills: {...prev.skills},
        relationships: [...prev.relationships],
        inventory: [...prev.inventory],
        quests: [...prev.quests],
        achievements: [...prev.achievements],
        newsHistory: [...prev.newsHistory],
        careerStats: {...prev.careerStats, seasonStats: {...prev.careerStats.seasonStats}},
      }
      if (s.statChanges) Object.entries(s.statChanges).forEach(([k, v]: any) => {
        if (next.skills[k] !== undefined) {
          next.skills[k] = Math.max(0, Math.min(100, next.skills[k] + v))
          n.push({text: `${k} ${v > 0 ? '+' + v : v}`, type: v > 0 ? 'pos' : 'neg'})
        }
      })
      if (s.xpGained) {
        next.xp = prev.xp + s.xpGained
        n.push({text: `+${s.xpGained} XP`, type: 'xp'})
        if (next.xp >= next.xpNext) {
          next.xp -= next.xpNext
          next.level += 1
          next.xpNext = Math.round(next.xpNext * 1.3)
          n.push({text: `LEVEL UP → ${next.level}`, type: 'ach'})
        }
      }
      if (s.reputationChange) {
        next.reputation = prev.reputation + s.reputationChange
        n.push({text: `REP ${s.reputationChange > 0 ? '+' : ''}${s.reputationChange}`, type: s.reputationChange > 0 ? 'pos' : 'neg'})
      }
      if (s.relationshipChanges) s.relationshipChanges.forEach((rc: any) => {
        const idx = next.relationships.findIndex((r: any) => r.name === rc.name)
        if (idx >= 0) {
          next.relationships[idx] = {...next.relationships[idx], val: Math.max(0, Math.min(100, next.relationships[idx].val + rc.change)), dir: rc.dir ?? next.relationships[idx].dir}
          n.push({text: `${rc.name} ${rc.change > 0 ? '▲' : '▼'}`, type: rc.change > 0 ? 'pos' : 'neg'})
        } else {
          next.relationships.push({name: rc.name, type: 'Character', val: Math.max(0, Math.min(100, 50 + rc.change)), dir: rc.dir ?? 'neutral'})
          n.push({text: `Met: ${rc.name}`, type: 'item'})
        }
      })
      if (s.inventoryUnlocks?.length) s.inventoryUnlocks.forEach((item: string) => {
        if (!next.inventory.includes(item)) {
          next.inventory.push(item)
          n.push({text: `Item: ${item}`, type: 'item'})
        }
      })
      if (s.questUpdates) s.questUpdates.forEach((qu: any) => {
        const idx = next.quests.findIndex((q: any) => q.name === qu.name)
        if (idx >= 0) { next.quests[idx] = {...next.quests[idx], ...qu}; if (qu.done) n.push({text: `✓ ${qu.name}`, type: 'quest'}) }
      })
      if (s.newQuests) s.newQuests.forEach((nq: any) => {
        if (!next.quests.find((q: any) => q.name === nq.name)) {
          next.quests.push({...nq, done: false})
          n.push({text: `Quest: ${nq.name}`, type: 'quest'})
        }
      })
      if (s.newAchievements) s.newAchievements.forEach((a: string) => {
        if (!next.achievements.includes(a)) {
          next.achievements.push(a)
          n.push({text: ` ${a}`, type: 'ach'})
          const achKey = a.toLowerCase().replace(/ /g, '_')
          const ach = ACHIEVEMENTS[achKey]
          if (ach) setTrophyQueue((q: any[]) => [...q, {...ach, id: a}])
        }
      })
      if (s.newsUpdates?.length) next.newsHistory = [...prev.newsHistory, ...s.newsUpdates]
      if (s.worldStateUpdates) next.worldState = {...prev.worldState, ...s.worldStateUpdates, sceneCount: (prev.worldState.sceneCount ?? 0) + 1}
      if (s.matchReport) {
        const cs = next.careerStats
        cs.appearances += 1
        cs.goals += (s.matchReport.goals || 0)
        cs.assists += (s.matchReport.assists || 0)
        cs.seasonStats.apps += 1
        cs.seasonStats.goals += (s.matchReport.goals || 0)
        cs.seasonStats.ratings = [...(cs.seasonStats.ratings || []), s.matchReport.rating || 6.5]
        cs.allRatings = [...(cs.allRatings || []), s.matchReport.rating || 6.5]
        cs.averageRating = cs.allRatings.reduce((a: number, b: number) => a + b, 0) / cs.allRatings.length
        n.push({text: `Rating: ${(s.matchReport.rating || 6.5).toFixed(1)}`, type: s.matchReport.rating >= 7.5 ? 'pos' : 'neg'})
      }
      if (s.factionEvent) next.currentFaction = s.factionEvent
      next.storyProgress = prev.storyProgress + 1
      if (s.chapterComplete) next.currentChapter = Math.min(prev.currentChapter + 1, (CHAPTER_NAMES[prev.currentWorld] || []).length - 1)
      return next
    })
    return n
  }

  const checkMinigame = (sceneText: string, choiceText: string): string | null => {
    const combined = (sceneText + ' ' + choiceText).toLowerCase()
    if (currentWorld?.id === 'champions' && (combined.includes('penalty') || combined.includes('free kick') || combined.includes('spot kick'))) return 'penalty'
    if (currentWorld?.id === 'arcane' && (combined.includes('duel') || combined.includes('cast') || combined.includes('spell battle'))) return 'magic'
    if ((currentWorld?.id === 'hero' || currentWorld?.id === 'dragonfall' || currentWorld?.id === 'odyssey') && (combined.includes('fight') || combined.includes('battle') || combined.includes('combat') || combined.includes('clash'))) return 'combat'
    if ((currentWorld?.id === 'shadow') && (combined.includes('fight') || combined.includes('takedown') || combined.includes('eliminate'))) return 'combat'
    if (currentWorld?.id === 'neon' && (combined.includes('hack') || combined.includes('breach') || combined.includes('infiltrate') || combined.includes('firewall'))) return 'hack'
    return null
  }

  const handleChoice = async (choice: any) => {
    if (loading) return
    let msg = ''
    if (choice.id === 'D') {
      const custom = window.prompt('What do you do?')
      if (!custom) return
      msg = `Player custom action: "${custom}". Create the consequence scene.`
    } else {
      msg = `Player chose "${choice.text}". Risk: ${choice.risk}. Create the consequence scene. Change at least 2 stats. Reference the villain ${player.villain?.name || ''} as the threat grows.`
    }
    setPlayer(p => ({...p, majorDecisions: [...p.majorDecisions, choice.text]}))
    const minigame = checkMinigame(currentScene?.sceneText || '', choice.text)
    if (tier !== 'free' && minigame && Math.random() > 0.5) {
      setActiveMinigame(minigame)
      return
    }
    setLoading(true)
    setHasError(false)
    const result = await callAI(msg)
    if (result) {
      const n = applyScene(result)
      setCurrentScene(result)
      setNotifs(n)
      setSceneHistory(h => [...h, result.sceneTitle])
      setSceneHistory(h => [...h, result.sceneTitle])
      if (tier !== 'free' && result.matchReport) setShowMatchReport({...result.matchReport, playerName: player.name, position: player.position || 'Player', onClose: () => setShowMatchReport(null)})
      if (tier !== 'free' && result.transferWindow) setShowTransferWindow({...result.transferWindow, playerName: player.name, currentClub: player.worldState?.club || 'Academy', position: player.position || 'Player', marketValue: `£${player.careerStats?.marketValue || 0}m`, onDecide: (decision: string, club?: any) => {
        setShowTransferWindow(null)
        if (decision === 'transfer' && club) {
          setPlayer((prev: any) => ({...prev, worldState: {...prev.worldState, club: club.name}, careerStats: {...prev.careerStats, clubs: [...prev.careerStats.clubs, club.name]}}))
          callAI(`Player just signed for ${club.name}. Create the first day at the new club scene.`).then(r => { if (r) { const n = applyScene(r); setCurrentScene(r); setNotifs(n); setSceneHistory(h => [...h, r.sceneTitle]) } })
        } else {
          callAI(`Player decided to stay at ${player.worldState?.club || 'current club'}. Create the scene where they recommit.`).then(r => { if (r) { const n = applyScene(r); setCurrentScene(r); setNotifs(n); setSceneHistory(h => [...h, r.sceneTitle]) } })
        }
      }})
      if (tier !== 'free' && result.seasonSummary) setShowSeasonSummary({...result.seasonSummary, playerName: player.name, position: player.position || 'Player', club: player.worldState?.club || 'Academy', onClose: () => {
        setShowSeasonSummary(null)
        setPlayer((prev: any) => {
          const cs = {...prev.careerStats}
          cs.currentYear = (cs.currentYear || 1) + 1
          cs.age = (prev.age || 16) + 1
          cs.seasonStats = {apps: 0, goals: 0, assists: 0, ratings: []}
          return {...prev, careerStats: cs, age: cs.age}
        })
      }})
      if (tier !== 'free' && result.chapterComplete) {
        const nextChapter = player.currentChapter + 1
        const names = CHAPTER_NAMES[currentWorld?.id || ''] || []
        if (names[nextChapter]) setShowChapterCard({worldName: currentWorld?.name || '', chapterNumber: nextChapter + 1, chapterName: names[nextChapter], actName: getAct(player.storyProgress + 1, currentWorld?.id).name, year: currentWorld?.id === 'arcane' ? nextChapter + 1 : undefined, onContinue: () => setShowChapterCard(null)})
      }
      const prevAct = getAct(player.storyProgress - 1, currentWorld?.id)
      const newAct = getAct(player.storyProgress, currentWorld?.id)
      if (newAct.id !== prevAct.id && !result.isFinalScene) { setNextAct(newAct); setShowTransition(true) }
      if (tier !== 'free' && currentWorld?.id === 'dragonfall' && !player.worldState?.dragonBonded && player.storyProgress >= 6 && Math.random() > 0.6) setShowDragonBond(true)
    } else {
      setHasError(true)
    }
    setLoading(false)
  }

  const handleMinigameComplete = async (outcome: {won?:boolean,scored?:boolean,success?:boolean,healthRemaining?:number,description:string}) => {
    const minigame = activeMinigame
    setActiveMinigame(null)
    const isSuccess = outcome.won ?? outcome.scored ?? outcome.success ?? false
    setLoading(true)
    const followUp = `Player just ${isSuccess ? 'succeeded' : 'failed'} in a ${minigame} challenge. ${outcome.description} Continue the story from this outcome with appropriate stat changes.`
    const result = await callAI(followUp)
    if (result) {
      const n = applyScene(result)
      setCurrentScene(result)
      setNotifs(n)
      setSceneHistory(h => [...h, result.sceneTitle])
      setSceneHistory(h => [...h, result.sceneTitle])
    } else {
      setHasError(true)
    }
    setLoading(false)
  }

  const handleRetry = async () => {
    setHasError(false)
    setLoading(true)
    const result = await callAI('Continue the story from where we left off. Give the player a new meaningful choice.')
    if (result) { const n = applyScene(result); setCurrentScene(result); setNotifs(n); setSceneHistory(h => [...h, result.sceneTitle]) }
    else setHasError(true)
    setLoading(false)
  }

  const handleSave = (slot?: number) => {
    const targetSlot = slot || player.saveSlot || 1
    try {
      localStorage.setItem(`revenio_save_${targetSlot}`, JSON.stringify({
        player: {...player, saveSlot: targetSlot},
        worldId: currentWorld?.id,
        worldName: currentWorld?.name,
        worldIcon: currentWorld?.icon,
        currentScene,
        sceneHistory,
        chapterName: CHAPTER_NAMES[currentWorld?.id || '']?.[player.currentChapter] || 'Chapter 1',
        history: historyRef.current.slice(-10),
        savedAt: new Date().toISOString(),
      }))
      setSaveMsg('SAVED ✓')
      setShowSaveSlots(null)
    } catch { setSaveMsg('FAILED') }
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const handleLoad = (slot?: number) => {
    const targetSlot = slot || 1
    try {
      const raw = localStorage.getItem(`revenio_save_${targetSlot}`)
      if (!raw) { alert('No save in this slot.'); return }
      const d = JSON.parse(raw)
      const w = WORLDS.find(x => x.id === d.worldId)
      if (!w) { alert('Save data corrupted.'); return }
      setPlayer(d.player)
      setCurrentWorld(w)
      setCurrentScene(d.currentScene)
      setSceneHistory(d.sceneHistory || [])
      historyRef.current = d.history || []
      setShowSaveSlots(null)
      setScreen('game')
      setLoading(true)
      callAI('Continue the story from where we left off. Reference what just happened and give the player a meaningful new choice.').then(result => {
        if (result) { const n = applyScene(result); setCurrentScene(result); setNotifs(n); setSceneHistory(h => [...h, result.sceneTitle]) }
        setLoading(false)
      })
    } catch { alert('Could not load save.') }
  }

  const handleSelectWorld = (w: any) => {
    const villain = pickVillain(w.id)
    const fresh = {
      ...defaultPlayer(),
      name: player.name, age: player.age, traits: player.traits, goal: player.goal, nationality: player.nationality,
      currentWorld: w.id, currentLocation: w.locations?.[0] ?? '',
      skills: {...w.startStat},
      relationships: w.startRels.map((r: any) => ({...r})),
      inventory: [...w.startItems],
      quests: w.startQuests.map((q: any) => ({...q, done: false})),
      newsHistory: [...w.startNews],
      worldState: {sceneCount: 0, year: 1, dragonBonded: false},
      villain,
    }
    setPlayer(fresh)
    setCurrentWorld(w)
    setCurrentScene(null)
    setHasError(false)
    setSceneHistory([])
    historyRef.current = []
    setWandWood(null); setWandCore(null); setWandLength(null)
    setSaberColor(null); setCybernetic(null); setGreekWeapon(null)
    setSelectedPosition(''); setSelectedPower(''); setSelectedCreed(''); setSelectedBroker(null)
    setScreen('customcreation')
  }

  const finishCustomCreation = () => {
    const w = WORLDS.find(x => x.id === player.currentWorld)
    if (!w) return
    let item: any = null
    if (w.customCreation === 'wand') {
      if (!wandWood || !wandCore || !wandLength) { alert('Choose your wand wood, core, and length'); return }
      item = {type:'wand', name:`${wandWood.name} wand`, displayName:`${wandLength.name} ${wandWood.name}`, core:wandCore.name, length:wandLength.name, wood:wandWood.name, bonuses:[wandWood.bonus, wandCore.bonus, wandLength.bonus], statBonuses:{[wandWood.statKey]:wandWood.statVal, [wandCore.statKey]:(wandCore.statVal||0), [wandLength.statKey]:(wandLength.statVal||0)}, icon:''}
    } else if (w.customCreation === 'saber') {
      if (!saberColor) { alert('Choose your lightsaber color'); return }
      item = {type:'saber', name:`${saberColor.color} Lightsaber`, displayName:`${saberColor.color} Lightsaber`, color:saberColor.color, hex:saberColor.hex, meaning:saberColor.meaning, faction:saberColor.faction, statBonuses:saberColor.stats, icon:''}
    } else if (w.customCreation === 'implant') {
      if (!cybernetic) { alert('Choose your cybernetic implant'); return }
      item = {...cybernetic, type:'implant', displayName:cybernetic.name}
    } else if (w.customCreation === 'weapon') {
      if (!greekWeapon) { alert('Choose your divine weapon'); return }
      item = {...greekWeapon, type:'weapon', displayName:greekWeapon.name}
    } else if (w.customCreation === 'position') {
      if (!selectedPosition) { alert('Choose your position'); return }
      const posData = POSITIONS.find(p => p.pos === selectedPosition)
      item = {type:'position', name:selectedPosition, displayName:selectedPosition, icon:'', statBonuses:posData?.stats || {}}
    } else if (w.customCreation === 'power') {
      if (!selectedPower) { alert('Choose your power'); return }
      item = {type:'power', name:selectedPower, displayName:selectedPower, icon:'', statBonuses:{Power:8, Control:5}}
    } else if (w.customCreation === 'creed') {
      if (!selectedCreed) { alert('Choose your creed'); return }
      item = {type:'creed', name:selectedCreed, displayName:'The Creed', icon:'', statBonuses:{Trust:5, Stealth:5}}
    } else if (w.customCreation === 'dragon') {
      item = {type:'dragon_pending', name:'Dragon Bond (not yet earned)', displayName:'Dragon Bond', icon:'', statBonuses:{}}
    } else if (w.customCreation === 'broker') {
      if (!selectedBroker) { alert('Choose your origin story'); return }
      item = {
        type:'broker',
        name:selectedBroker.name,
        displayName:selectedBroker.name,
        desc:selectedBroker.desc,
        flavor:selectedBroker.flavor,
        icon:selectedBroker.icon,
        statBonuses:selectedBroker.stats,
      }
    }
    if (item?.statBonuses) {
      setPlayer((prev: any) => {
        const newSkills = {...prev.skills}
        Object.entries(item.statBonuses).forEach(([k, v]: any) => { if (newSkills[k] !== undefined) newSkills[k] = Math.min(100, newSkills[k] + v) })
        const newInventory = [...prev.inventory, item.displayName || item.name]
        const newPos = item.type === 'position' ? item.name : prev.position
        return {...prev, skills: newSkills, inventory: newInventory, position: newPos, customItem: item, currentFaction: item.faction || prev.currentFaction}
      })
    }
    setScreen('game')
    setLoading(true)
    const freshPlayer = {...player, customItem: item, position: item?.type === 'position' ? item.name : player.position}
    callAI(buildOpeningPrompt(freshPlayer, w, item), freshPlayer, w).then(result => {
      if (result) { setCurrentScene(result); setSceneHistory([result.sceneTitle]); }
      else setHasError(true)
      setLoading(false)
    })
  }

  // ── SPLASH ──
  if (screen === 'splash') return (
    <div style={{...G.app, ...G.center, background:'radial-gradient(ellipse at center,#0F0F20,#0A0A0C)'}}>
      {fonts}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'clamp(36px,8vw,72px)',fontWeight:900,letterSpacing:'8px',background:'linear-gradient(135deg,#8B6914,#D4A843,#F0C060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>REVENIO</div>
      <div style={{...G.muted,letterSpacing:'4px',fontSize:'12px',marginBottom:'32px'}}>EXPLORE THE LIFE YOU NEVER LIVED</div>
      {!userId ? (
        <>
          <div style={{color:'#D4A843',fontSize:'12px',letterSpacing:'3px',marginBottom:'14px',textAlign:'center',maxWidth:'420px'}}>SIGN IN TO BEGIN — YOUR STORY IS TIED TO YOUR ACCOUNT</div>
          <Link to="/auth" style={{...G.btnGold,textDecoration:'none',display:'inline-block'}}>SIGN IN / SIGN UP</Link>
          <Link to="/pricing" style={{...G.btnGhost,marginTop:'8px',textDecoration:'none',display:'inline-block'}}>VIEW PLANS</Link>
        </>
      ) : (
        <>
          <button style={G.btnGold} onClick={() => setScreen('creation')}>BEGIN YOUR LEGEND</button>
          {tier !== 'free' && <button style={{...G.btnGhost,marginTop:'8px'}} onClick={() => setShowSaveSlots('load')}>CONTINUE JOURNEY</button>}
        </>
      )}
      {showSaveSlots === 'load' && <SaveSlots mode="load" onSave={handleSave} onLoad={handleLoad} onClose={() => setShowSaveSlots(null)}/>}
    </div>
  )

  // ── CREATION ──
  if (screen === 'creation') {
    const toggleTrait = (t: string) => setPlayer(p => ({...p, traits: p.traits.includes(t) ? p.traits.filter(x => x !== t) : p.traits.length < 3 ? [...p.traits, t] : p.traits}))
    const finish = () => {
      if (!player.name.trim()) { alert('Enter your name'); return }
      if (player.traits.length < 1) { alert('Pick at least 1 trait'); return }
      if (!player.goal) { alert('Choose a goal'); return }
      if (!player.nationality) { alert('Choose your nationality'); return }
      setScreen('worldselect')
    }
    return (
      <div style={{...G.app, display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 20px'}}>
        {fonts}
        <div style={{maxWidth:'640px', width:'100%'}}>
          <div style={{textAlign:'center', marginBottom:'32px'}}>
            <div style={{...G.gold, fontSize:'10px', letterSpacing:'4px', marginBottom:'8px'}}>CHAPTER I</div>
            <div style={{fontFamily:"'Cinzel',serif", fontSize:'28px', fontWeight:700, letterSpacing:'2px'}}>FORGE YOUR IDENTITY</div>
          </div>
          <div style={{marginBottom:'20px'}}><label style={G.label}>YOUR NAME</label><input style={G.input} value={player.name} onChange={e => setPlayer(p => ({...p, name: e.target.value}))} placeholder="Enter your name..." maxLength={30}/></div>
          <div style={{marginBottom:'20px'}}><label style={G.label}>YOUR AGE</label><input style={G.input} type="number" value={player.age} onChange={e => setPlayer(p => ({...p, age: parseInt(e.target.value) || 16}))} min={14} max={30}/></div>
          <div style={{marginBottom:'20px'}}>
            <label style={G.label}>YOUR NATIONALITY</label>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px'}}>
              {NATIONALITIES.map(n => <button key={n} onClick={() => setPlayer(p => ({...p, nationality: n}))} style={{background:player.nationality===n?'#8B6914':'#1A1A24',border:`1px solid ${player.nationality===n?'#D4A843':'#3A3A4A'}`,color:player.nationality===n?'#F0C060':'#7A7A8A',padding:'6px 4px',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:'12px',borderRadius:'2px'}}>{n}</button>)}
            </div>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={G.label}>CHOOSE 3 TRAITS <span style={G.muted}>({player.traits.length}/3)</span></label>
            <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'8px'}}>
              {TRAITS.map(t => <button key={t} onClick={() => toggleTrait(t)} style={{background:player.traits.includes(t)?'#8B6914':'#1A1A24',border:`1px solid ${player.traits.includes(t)?'#D4A843':'#3A3A4A'}`,color:player.traits.includes(t)?'#F0C060':'#7A7A8A',padding:'8px 4px',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:'12px',fontWeight:600,borderRadius:'2px'}}>{t}</button>)}
            </div>
          </div>
          <div style={{marginBottom:'32px'}}>
            <label style={G.label}>YOUR MAIN GOAL</label>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px'}}>
              {GOALS.map(g => <button key={g} onClick={() => setPlayer(p => ({...p, goal: g}))} style={{background:player.goal===g?'#8B6914':'#1A1A24',border:`1px solid ${player.goal===g?'#D4A843':'#3A3A4A'}`,color:player.goal===g?'#F0C060':'#7A7A8A',padding:'12px',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:'14px',fontWeight:600,borderRadius:'2px'}}>{g}</button>)}
            </div>
          </div>
          <button style={{...G.btnGold, width:'100%'}} onClick={finish}>CHOOSE YOUR WORLD →</button>
        </div>
      </div>
    )
  }

  // ── WORLD SELECT ──
  if (screen === 'worldselect') return (
    <div style={{...G.app, padding:'30px 20px'}}>
      {fonts}
      <div style={{textAlign:'center', marginBottom:'32px'}}>
        <div style={{...G.gold, fontSize:'10px', letterSpacing:'4px', marginBottom:'8px'}}>CHAPTER II</div>
        <div style={{fontFamily:"'Cinzel',serif", fontSize:'28px', fontWeight:700, letterSpacing:'2px'}}>CHOOSE YOUR WORLD</div>
        <div style={{...G.muted, fontSize:'13px', marginTop:'6px', letterSpacing:'2px'}}>Where will your alternate life unfold?</div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px', maxWidth:'960px', margin:'0 auto'}}>
        {WORLDS.map(w => {
          const isImmortalOnly = (w as any).immortalOnly
          const locked =
            (isImmortalOnly && tier !== 'immortal') ||
            (!isImmortalOnly && tier === 'free' && !FREE_WORLD_IDS.has(w.id))
          const requiredTier = isImmortalOnly ? 'Immortal' : 'Legend'
          return (
            <div
              key={w.id}
              onClick={() => locked ? null : handleSelectWorld(w)}
              style={{background:'#1A1A24', border:`1px solid ${locked?'#2A2A3A':'#2A2A3A'}`, padding:'20px', cursor:locked?'not-allowed':'pointer', borderRadius:'2px', transition:'all .2s', opacity: locked?0.55:1, position:'relative'}}
              onMouseEnter={e => { if (!locked) e.currentTarget.style.borderColor='#D4A843' }}
              onMouseLeave={e => { if (!locked) e.currentTarget.style.borderColor='#2A2A3A' }}
            >
              {locked && (
                <div style={{position:'absolute',top:'8px',right:'8px',background:'#0A0A0C',border:`1px solid ${isImmortalOnly?'#E5E4E2':'#D4A843'}`,color:isImmortalOnly?'#E5E4E2':'#D4A843',fontSize:'9px',letterSpacing:'2px',padding:'3px 6px',borderRadius:'2px'}}>
                  🔒 {requiredTier.toUpperCase()}
                </div>
              )}
              <div style={{fontSize:'28px', marginBottom:'10px'}}>{w.icon}</div>
              <div style={{fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:isImmortalOnly?'#E5E4E2':'#D4A843', marginBottom:'6px', letterSpacing:'1px'}}>{w.name}</div>
              <div style={{...G.muted, fontSize:'12px', lineHeight:1.5}}>{w.desc}</div>
              <div style={{...G.muted, fontSize:'10px', letterSpacing:'2px', marginTop:'8px', borderTop:'1px solid #2A2A3A', paddingTop:'8px'}}>{w.theme}</div>
              {locked && (
                <Link to="/pricing" style={{display:'block',marginTop:'10px',textAlign:'center',background:'#D4A843',color:'#0A0A0C',padding:'6px',fontSize:'10px',letterSpacing:'2px',textDecoration:'none',fontWeight:700}}>
                  UPGRADE
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ───────── CUSTOM CREATION ─────────
  if (screen === 'customcreation') {
    const w = currentWorld
    if (!w) return null
    const card = (selected: boolean, onClick: () => void, children: any, key?: any) => (
      <div key={key} onClick={onClick} style={{background:'#1A1A24',border:`1px solid ${selected?'#D4A843':'#2A2A3A'}`,padding:'14px',borderRadius:'2px',cursor:'pointer',transition:'all .2s'}}>{children}</div>
    )
    const POWERS = ['Kinetic Force','Temporal Sense','Bioelectric Surge','Adaptive Armor','Neural Override','Gravitational Pull']
    const CREEDS = [
      {name:'Stay Your Blade',quote:'Stay your blade from the flesh of an innocent.'},
      {name:'Hide in Plain Sight',quote:'Hide in plain sight. Be one with the crowd.'},
      {name:'Never Compromise',quote:'Never compromise the Brotherhood.'},
      {name:'Walk in Darkness',quote:'Walk in the darkness, serve the light.'},
    ]
    const heading = w.customCreation==='wand'?'YOUR WAND CHOOSES YOU':w.customCreation==='saber'?'CHOOSE YOUR LIGHTSABER':w.customCreation==='position'?'CHOOSE YOUR POSITION':w.customCreation==='implant'?'CHOOSE YOUR IMPLANT':w.customCreation==='weapon'?'CLAIM YOUR DIVINE WEAPON':w.customCreation==='power'?'DISCOVER YOUR POWER':w.customCreation==='creed'?'SWEAR YOUR CREED':w.customCreation==='dragon'?'THE DRAGONS OF THE REALM':'BEFORE YOU BEGIN'

    return (
      <div style={{...G.app, padding:'30px 20px'}}>
        {fonts}
        <div style={{maxWidth:'960px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'28px'}}>
            <div style={{...G.gold,fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>BEFORE YOU BEGIN</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'24px',fontWeight:700,letterSpacing:'2px',color:'#F0C060'}}>{heading}</div>
            <div style={{...G.muted,fontSize:'13px',marginTop:'6px'}}>{w.name}</div>
          </div>

          {w.customCreation==='wand' && (
            <>
              <div style={G.sideLabel}>WAND WOOD</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'10px',marginBottom:'20px'}}>
                {WAND_WOODS.map(x => card(wandWood?.name===x.name,()=>setWandWood(x),(<>
                  <div style={{color:'#D4A843',fontWeight:700,fontSize:'14px',marginBottom:'4px'}}>{x.name}</div>
                  <div style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>{x.trait} · {x.bonus}</div>
                  <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{x.desc}</div>
                </>),x.name))}
              </div>
              <div style={G.sideLabel}>WAND CORE</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'10px',marginBottom:'20px'}}>
                {WAND_CORES.map(x => card(wandCore?.name===x.name,()=>setWandCore(x),(<>
                  <div style={{color:'#D4A843',fontWeight:700,fontSize:'14px',marginBottom:'4px'}}>{x.name}</div>
                  <div style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>{x.bonus}</div>
                  <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{x.desc}</div>
                </>),x.name))}
              </div>
              <div style={G.sideLabel}>WAND LENGTH</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'10px',marginBottom:'24px'}}>
                {WAND_LENGTHS.map(x => card(wandLength?.name===x.name,()=>setWandLength(x),(<>
                  <div style={{color:'#D4A843',fontWeight:700,fontSize:'14px',marginBottom:'4px'}}>{x.name}</div>
                  <div style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>{x.bonus}</div>
                  <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{x.desc}</div>
                </>),x.name))}
              </div>
            </>
          )}

          {w.customCreation==='saber' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px',marginBottom:'24px'}}>
              {SABER_COLORS.map(x => card(saberColor?.color===x.color,()=>setSaberColor(x),(
                <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                  <div style={{width:'6px',alignSelf:'stretch',background:x.hex,boxShadow:`0 0 12px ${x.hex}`,borderRadius:'2px',minHeight:'60px'}}/>
                  <div>
                    <div style={{color:x.hex,fontWeight:700,fontSize:'14px',marginBottom:'4px'}}>{x.color}</div>
                    <div style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>{x.faction}</div>
                    <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{x.meaning}</div>
                  </div>
                </div>
              ),x.color))}
            </div>
          )}

          {w.customCreation==='position' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px',marginBottom:'24px'}}>
              {POSITIONS.map(x => card(selectedPosition===x.pos,()=>setSelectedPosition(x.pos),(<>
                <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'4px'}}>
                  <span style={{fontSize:'20px'}}>{x.icon}</span>
                  <span style={{color:'#D4A843',fontWeight:700,fontSize:'14px'}}>{x.pos}</span>
                  <span style={{...G.muted,fontSize:'10px',letterSpacing:'2px'}}>{x.short}</span>
                </div>
                <div style={{...G.muted,fontSize:'11px'}}>{x.desc}</div>
              </>),x.pos))}
            </div>
          )}

          {w.customCreation==='implant' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'12px',marginBottom:'24px'}}>
              {CYBERNETIC_IMPLANTS.map(x => card(cybernetic?.name===x.name,()=>setCybernetic(x),(<>
                <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'6px'}}>
                  <span style={{fontSize:'22px'}}>{x.icon}</span>
                  <span style={{color:'#D4A843',fontWeight:700,fontSize:'14px'}}>{x.name}</span>
                </div>
                <div style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>{x.bonus}</div>
                <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{x.desc}</div>
              </>),x.name))}
            </div>
          )}

          {w.customCreation==='weapon' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'12px',marginBottom:'24px'}}>
              {GREEK_WEAPONS.map(x => card(greekWeapon?.name===x.name,()=>setGreekWeapon(x),(<>
                <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'6px'}}>
                  <span style={{fontSize:'22px'}}>{x.icon}</span>
                  <span style={{color:'#D4A843',fontWeight:700,fontSize:'14px'}}>{x.name}</span>
                </div>
                <div style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>{x.faction} · {x.bonus}</div>
                <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{x.desc}</div>
              </>),x.name))}
            </div>
          )}

          {w.customCreation==='power' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px',marginBottom:'24px'}}>
              {POWERS.map(p => card(selectedPower===p,()=>setSelectedPower(p),(
                <div style={{color:'#D4A843',fontWeight:700,fontSize:'14px',textAlign:'center'}}>{p}</div>
              ),p))}
            </div>
          )}

          {w.customCreation==='creed' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'12px',marginBottom:'24px'}}>
              {CREEDS.map(c => card(selectedCreed===c.name,()=>setSelectedCreed(c.name),(<>
                <div style={{color:'#D4A843',fontWeight:700,fontSize:'14px',marginBottom:'6px'}}>{c.name}</div>
                <div style={{...G.muted,fontStyle:'italic',fontSize:'12px',lineHeight:1.5}}>“{c.quote}”</div>
              </>),c.name))}
            </div>
          )}

          {w.customCreation==='dragon' && (
            <>
              <div style={{...G.muted,fontSize:'12px',textAlign:'center',marginBottom:'16px',lineHeight:1.6}}>
                You do not choose a dragon. A dragon chooses <em>you</em>. As your story unfolds, one of these will find you.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'12px',marginBottom:'24px'}}>
                {DRAGON_BREEDS.map(d => (
                  <div key={d.name} style={{background:'#1A1A24',border:'1px solid #2A2A3A',padding:'14px',borderRadius:'2px'}}>
                    <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'6px'}}>
                      <span style={{fontSize:'22px'}}>{d.icon}</span>
                      <span style={{color:'#D4A843',fontWeight:700,fontSize:'14px'}}>{d.name}</span>
                    </div>
                    <div style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>{d.element}</div>
                    <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{d.bond}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{textAlign:'center'}}>
            <button onClick={finishCustomCreation} style={G.btnGold}>CONFIRM &amp; BEGIN</button>
          </div>
        </div>
      </div>
    )
  }

  // ───────── GAME ─────────
  if (screen === 'game') {
    const act = getAct(player.storyProgress, currentWorld?.id)
    const sceneInAct = Math.max(0, player.storyProgress - act.range[0])
    const totalInAct = act.range[1] - act.range[0] + 1
    const xpPct = Math.min(100, (player.xp / Math.max(1, player.xpNext)) * 100)
    const scene = currentScene
    const w = currentWorld

    return (
      <div style={{...G.app, minHeight:'100vh'}}>
        {fonts}
        <div style={G.topbar}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:900,letterSpacing:'4px',color:'#D4A843'}}>REVENIO</div>
            {tier === 'immortal' && (
              <span style={{background:'linear-gradient(90deg,#D4A843,#F0C060,#E5E4E2)',color:'#0A0A0C',fontSize:'9px',letterSpacing:'2px',fontWeight:900,padding:'3px 8px',borderRadius:'2px'}}>IMMORTAL</span>
            )}
            {tier === 'legend' && (
              <span style={{background:'#D4A843',color:'#0A0A0C',fontSize:'9px',letterSpacing:'2px',fontWeight:900,padding:'3px 8px',borderRadius:'2px'}}>LEGEND</span>
            )}
            {tier === 'free' && (
              <span style={{border:'1px solid #2A2A3A',color:'#7A7A8A',fontSize:'9px',letterSpacing:'2px',padding:'3px 8px',borderRadius:'2px'}}>FREE</span>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px',flex:1,justifyContent:'center'}}>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'13px',fontWeight:700,color:'#E8E4D8'}}>{player.name}</div>
              <div style={{...G.muted,fontSize:'10px',letterSpacing:'1px'}}>{player.nationality} · {player.currentFaction || w?.name}</div>
            </div>
            <div style={{minWidth:'140px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#7A7A8A',marginBottom:'2px'}}><span>LVL {player.level}</span><span>{player.xp}/{player.xpNext}</span></div>
              <div style={{height:'4px',background:'#1A1A24',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${xpPct}%`,background:'linear-gradient(90deg,#8B6914,#D4A843)'}}/>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            {saveMsg && <span style={{color:'#27AE60',fontSize:'11px',alignSelf:'center',letterSpacing:'2px'}}>{saveMsg}</span>}
            {tier !== 'free' && <button onClick={()=>setShowSaveSlots('save')} style={{...G.btnGhost,padding:'6px 14px',fontSize:'11px'}}>SAVE</button>}
            {tier === 'free' && <Link to="/pricing" style={{...G.btnGhost,padding:'6px 14px',fontSize:'11px',textDecoration:'none'}}>UPGRADE</Link>}
            <button onClick={()=>setScreen('worldselect')} style={{...G.btnGhost,padding:'6px 14px',fontSize:'11px'}}>MENU</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'220px 1fr 240px',gap:'16px',padding:'16px',maxWidth:'1400px',margin:'0 auto'}}>
          {/* LEFT */}
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={G.surface}>
              <div style={G.sideLabel}>ACT {act.id}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'14px',color:'#F0C060',marginBottom:'4px'}}>{act.name}</div>
              <div style={{...G.muted,fontSize:'11px',marginBottom:'8px',lineHeight:1.4}}>Chapter {act.id} of {getWorldActs(w?.id).length}</div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#7A7A8A',marginBottom:'4px'}}><span>SCENE</span><span>{sceneInAct + 1}/{totalInAct}</span></div>
              <div style={{height:'4px',background:'#0A0A0C',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${((sceneInAct + 1)/totalInAct)*100}%`,background:'#D4A843'}}/>
              </div>
            </div>

            {w?.id === 'champions' && (
              <div style={G.surface}>
                <div style={G.sideLabel}>CAREER</div>
                {[
                  ['Apps', player.careerStats?.appearances || 0],
                  ['Goals', player.careerStats?.goals || 0],
                  ['Assists', player.careerStats?.assists || 0],
                  ['Avg', (player.careerStats?.averageRating || 0).toFixed(1)],
                  ['Age', player.careerStats?.age || player.age],
                  ['Caps', player.careerStats?.internationalCaps || 0],
                ].map(([k,v])=>(
                  <div key={k as string} style={{display:'flex',justifyContent:'space-between',fontSize:'11px',padding:'3px 0'}}>
                    <span style={{color:'#7A7A8A'}}>{k}</span><span style={{color:'#F0C060',fontFamily:"'Orbitron',monospace"}}>{v as any}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={G.surface}>
              <div style={G.sideLabel}>STATS</div>
              {Object.entries(player.skills).slice(0,8).map(([k,v]:any) => (
                <div key={k} style={{marginBottom:'6px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#7A7A8A',marginBottom:'2px'}}><span>{k}</span><span style={{color:'#F0C060'}}>{v}</span></div>
                  <div style={{height:'3px',background:'#0A0A0C',borderRadius:'2px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min(100, Number(v))}%`,background:'#D4A843'}}/>
                  </div>
                </div>
              ))}
            </div>

            {player.quests?.length > 0 && (
              <div style={G.surface}>
                <div style={G.sideLabel}>QUESTS</div>
                {player.quests.filter((q:any) => !q.done).slice(0,4).map((q:any,i:number) => (
                  <div key={i} style={{marginBottom:'8px',paddingBottom:'8px',borderBottom:'1px solid #2A2A3A'}}>
                    <div style={{color:'#F0C060',fontSize:'12px',fontWeight:600,marginBottom:'2px'}}>{q.name}</div>
                    <div style={{...G.muted,fontSize:'10px',lineHeight:1.4}}>{q.desc}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={G.surface}>
              <div onClick={()=>setHistoryOpen(!historyOpen)} style={{...G.sideLabel,cursor:'pointer',display:'flex',justifyContent:'space-between'}}>
                <span>HISTORY</span><span>{historyOpen?'−':'+'}</span>
              </div>
              {historyOpen && sceneHistory.slice(-8).map((s,i) => (
                <div key={i} style={{...G.muted,fontSize:'10px',padding:'3px 0',borderBottom:'1px solid #2A2A3A'}}>{s}</div>
              ))}
            </div>
          </div>

          {/* MIDDLE */}
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {notifs.length > 0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {notifs.map((n:any,i:number) => (
                  <span key={i} style={{background:n.color?`${n.color}22`:'#1A1A24',color:n.color||'#D4A843',border:`1px solid ${n.color||'#8B6914'}`,padding:'4px 10px',fontSize:'11px',borderRadius:'2px',letterSpacing:'1px'}}>
                    {n.text || n.msg}
                  </span>
                ))}
              </div>
            )}

            {loading && (
              <div style={{...G.surface,textAlign:'center',padding:'40px'}}>
                <div style={{width:'40px',height:'40px',margin:'0 auto 16px',border:'3px solid #2A2A3A',borderTopColor:'#D4A843',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                <div style={{...G.gold,fontSize:'11px',letterSpacing:'4px'}}>GENERATING YOUR FATE…</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {hasError && (
              <div style={{...G.surface,borderColor:'#E74C3C',textAlign:'center'}}>
                <div style={{color:'#E74C3C',fontSize:'13px',marginBottom:'10px',letterSpacing:'2px'}}>THE STORY FALTERED</div>
                <button onClick={handleRetry} style={G.btnGold}>RETRY</button>
              </div>
            )}

            {!loading && !hasError && scene && (
              <>
                <div style={G.surface}>
                  <div style={{...G.muted,fontSize:'10px',letterSpacing:'3px',marginBottom:'4px'}}>{w?.name?.toUpperCase()} · {act.name.toUpperCase()} · {CHAPTER_NAMES[w?.id||'']?.[player.currentChapter] || ''}</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:'20px',fontWeight:700,color:'#F0C060',marginBottom:'12px'}}>{scene.sceneTitle}</div>
                  <div style={{color:'#E8E4D8',fontSize:'14px',lineHeight:1.7,whiteSpace:'pre-wrap' as const}}>{scene.sceneText}</div>
                </div>

                {(paywallHit || (tier === 'free' && sceneHistory.length >= FREE_SCENE_CAP)) && (
                  <PaywallGate
                    requiredTier={paywallHit === 'immortal' ? 'immortal' : 'legend'}
                    feature={paywallHit === 'immortal' ? 'This continuation requires Immortal' : `Free limit reached — ${FREE_SCENE_CAP} scenes per world`}
                  >
                    <div />
                  </PaywallGate>
                )}
                {!paywallHit && !(tier === 'free' && sceneHistory.length >= FREE_SCENE_CAP) && scene.choices?.length > 0 && !scene.isFinalScene && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                    {scene.choices.map((c:any,i:number) => (
                      <button key={i} onClick={()=>handleChoice(c)} style={{background:'#1A1A24',border:'1px solid #2A2A3A',color:'#E8E4D8',padding:'12px',cursor:'pointer',textAlign:'left',borderRadius:'2px',transition:'all .2s',fontFamily:"'Rajdhani',sans-serif"}}
                        onMouseEnter={e => e.currentTarget.style.borderColor='#D4A843'} onMouseLeave={e => e.currentTarget.style.borderColor='#2A2A3A'}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                          <span style={{...G.gold,fontSize:'10px',letterSpacing:'2px'}}>{c.type || `OPTION ${c.id||i+1}`}</span>
                          {c.risk && <span style={{color:c.risk==='high'?'#E74C3C':c.risk==='medium'?'#E67E22':'#27AE60',fontSize:'9px',letterSpacing:'2px'}}>{String(c.risk).toUpperCase()}</span>}
                        </div>
                        <div style={{fontSize:'13px',marginBottom:'6px',lineHeight:1.4}}>{c.text}</div>
                        {c.hint && <div style={{...G.muted,fontSize:'11px',fontStyle:'italic',marginBottom:'6px'}}>{c.hint}</div>}
                        {c.statPreview && (
                          <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                            {Object.entries(c.statPreview).map(([k,v]:any)=>(
                              <span key={k} style={{fontSize:'10px',color:Number(v)>=0?'#27AE60':'#E74C3C',background:'#0A0A0C',padding:'2px 6px',borderRadius:'2px'}}>{k} {Number(v)>=0?'+':''}{v}</span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {scene.isFinalScene && (
                  <div style={{...G.surface,borderColor:'#D4A843',textAlign:'center'}}>
                    <div style={{...G.gold,fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>YOUR STORY ENDS HERE</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:'#F0C060',marginBottom:'16px'}}>{scene.endingTitle || 'The Legend'}</div>
                    <button onClick={()=>setScreen('legacy')} style={G.btnGold}>VIEW LEGACY</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT */}
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={G.surface}>
              <div style={G.sideLabel}>RELATIONSHIPS</div>
              {player.relationships?.slice(0,6).map((r:any,i:number) => {
                const color = r.dir==='friend'?'#27AE60':r.dir==='rival'?'#E74C3C':'#7A7A8A'
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#0A0A0C',border:`1px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color}}>{r.name?.[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'11px',color:'#E8E4D8',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.name}</div>
                      <div style={{height:'3px',background:'#0A0A0C',borderRadius:'2px',overflow:'hidden',marginTop:'2px'}}>
                        <div style={{height:'100%',width:`${r.val}%`,background:color}}/>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={G.surface}>
              <div style={G.sideLabel}>INVENTORY</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px'}}>
                {Array.from({length:8}).map((_,i) => (
                  <div key={i} style={{aspectRatio:'1',background:'#0A0A0C',border:'1px solid #2A2A3A',borderRadius:'2px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',padding:'2px',textAlign:'center'}}>
                    {player.inventory?.[i] ? player.inventory[i].split(' ')[0] : ''}
                  </div>
                ))}
              </div>
            </div>

            {player.villain && (
              <div style={{...G.surface,borderColor:'#8B2A2A',background:'#1A0E10'}}>
                <div style={{color:'#E74C3C',fontSize:'9px',letterSpacing:'4px',borderBottom:'1px solid #5A1A1A',paddingBottom:'6px',marginBottom:'10px'}}>THE THREAT</div>
                <div style={{color:'#E74C3C',fontWeight:700,fontSize:'13px',marginBottom:'4px'}}>{player.villain.name}</div>
                <div style={{...G.muted,fontSize:'11px',fontStyle:'italic',marginBottom:'6px'}}>{player.villain.title || player.villain.role}</div>
                <div style={{...G.muted,fontSize:'11px',lineHeight:1.4}}>{player.villain.firstHint || player.villain.firstAppearance}</div>
              </div>
            )}

            <div style={G.surface}>
              <div style={G.sideLabel}>{(WORLD_NEWS_SOURCE[w?.id||'']||'NEWS').toUpperCase()}</div>
              {player.newsHistory?.slice(-4).map((n:string,i:number) => (
                <div key={i} style={{...G.muted,fontSize:'11px',padding:'4px 0',borderBottom:'1px solid #2A2A3A',lineHeight:1.4}}>{n}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlays */}
        {activeMinigame === 'penalty' && <PenaltyKick playerName={player.name} onComplete={handleMinigameComplete} />}
        {activeMinigame === 'magic' && <MagicDuel playerName={player.name} opponentName={player.villain?.name || 'Rival'} onComplete={handleMinigameComplete} />}
        {activeMinigame === 'combat' && <CombatStrike playerName={player.name} opponentName={player.villain?.name || 'Adversary'} onComplete={handleMinigameComplete} />}
        {activeMinigame === 'hack' && <HackTerminal playerName={player.name} targetName={player.villain?.name || 'Mainframe'} onComplete={handleMinigameComplete} />}

        {showDragonBond && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.94)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:'20px',overflowY:'auto'}}>
            <div style={{background:'#0F0F14',border:'1px solid #D4A843',borderRadius:'4px',padding:'24px',maxWidth:'520px',width:'100%'}}>
              <div style={{textAlign:'center',marginBottom:'16px'}}>
                <div style={{...G.gold,fontSize:'10px',letterSpacing:'4px',marginBottom:'4px'}}>A DRAGON HAS FOUND YOU</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'20px',color:'#F0C060'}}>Choose Wisely</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                {DRAGON_BREEDS.map(d => (
                  <div key={d.name} onClick={()=>setBondedDragon(d)} style={{background:'#1A1A24',border:`1px solid ${bondedDragon?.name===d.name?'#D4A843':'#2A2A3A'}`,padding:'10px',cursor:'pointer',borderRadius:'2px'}}>
                    <div style={{display:'flex',gap:'6px',alignItems:'center',marginBottom:'4px'}}>
                      <span style={{fontSize:'18px'}}>{d.icon}</span>
                      <span style={{color:'#D4A843',fontWeight:700,fontSize:'12px'}}>{d.name}</span>
                    </div>
                    <div style={{...G.muted,fontSize:'10px'}}>{d.element}</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'center'}}>
                <button onClick={()=>{
                  if (!bondedDragon) { alert('Choose a dragon'); return }
                  const dragonName = window.prompt(`Name your ${bondedDragon.name}:`) || bondedDragon.name
                  setPlayer((p:any) => ({...p, worldState:{...p.worldState, dragonBonded:true, dragonName, dragonBreed:bondedDragon.name}, inventory:[...p.inventory, `🐉 ${dragonName}`], achievements:[...p.achievements,'dragon_bonded']}))
                  setTrophyQueue(q => [...q, {achKey:'dragon_bonded', ...ACHIEVEMENTS.dragon_bonded}])
                  setShowDragonBond(false); setBondedDragon(null)
                }} style={G.btnGold}>BOND</button>
              </div>
            </div>
          </div>
        )}

        {showMatchReport && <MatchReport {...showMatchReport} />}
        {showSeasonSummary && <SeasonSummary {...showSeasonSummary} />}
        {showTransferWindow && <TransferWindow {...showTransferWindow} />}
        {showChapterCard && <ChapterCard chapterNumber={showChapterCard.chapterNumber} chapterName={showChapterCard.chapterName} actName={showChapterCard.actName} onClose={showChapterCard.onContinue} />}
        {showSaveSlots && <SaveSlots mode={showSaveSlots} currentSlot={player.saveSlot} onSave={handleSave} onLoad={handleLoad} onClose={()=>setShowSaveSlots(null)} />}
        {currentTrophy && <TrophyPopup title={currentTrophy.title} desc={currentTrophy.desc} tier={currentTrophy.tier} onDone={()=>setCurrentTrophy(null)} />}
      </div>
    )
  }

  // ───────── LEGACY ─────────
  if (screen === 'legacy') {
    const w = currentWorld
    const cs = player.careerStats || {}
    const topSkill = Object.entries(player.skills).sort(([,a]:any,[,b]:any)=>b-a)[0]
    return (
      <div style={{...G.app, padding:'40px 20px'}}>
        {fonts}
        <div style={{maxWidth:'780px',margin:'0 auto',textAlign:'center'}}>
          <div style={{...G.gold,fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>{w?.name?.toUpperCase() || 'YOUR JOURNEY'}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'36px',fontWeight:900,color:'#F0C060',marginBottom:'6px'}}>{player.name}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:'#D4A843',fontStyle:'italic',marginBottom:'32px'}}>{currentScene?.endingTitle || currentScene?.sceneTitle || 'The Legend'}</div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'24px'}}>
            {[
              {l:'LEVEL',v:player.level},
              {l:'SCENES',v:player.storyProgress},
              {l:'ACHIEVEMENTS',v:player.achievements?.length || 0},
              {l:'REPUTATION',v:player.reputation},
            ].map(s => (
              <div key={s.l} style={{...G.surface,padding:'14px',textAlign:'center'}}>
                <div style={{...G.muted,fontSize:'9px',letterSpacing:'2px',marginBottom:'4px'}}>{s.l}</div>
                <div style={{color:'#F0C060',fontFamily:"'Orbitron',monospace",fontSize:'20px',fontWeight:700}}>{s.v}</div>
              </div>
            ))}
          </div>

          {w?.id === 'champions' && (
            <div style={{...G.surface,marginBottom:'24px'}}>
              <div style={{...G.sideLabel,textAlign:'center'}}>CAREER</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
                {[
                  ['Apps', cs.appearances || 0],
                  ['Goals', cs.goals || 0],
                  ['Assists', cs.assists || 0],
                  ['Avg Rating', (cs.averageRating || 0).toFixed(2)],
                  ['Int. Caps', cs.internationalCaps || 0],
                  ['World Cups', cs.worldCupAppearances || 0],
                ].map(([k,v])=>(
                  <div key={k as string} style={{background:'#0A0A0C',padding:'10px',borderRadius:'2px'}}>
                    <div style={{...G.muted,fontSize:'9px',letterSpacing:'2px',marginBottom:'2px'}}>{k}</div>
                    <div style={{color:'#F0C060',fontFamily:"'Orbitron',monospace",fontSize:'16px'}}>{v as any}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topSkill && (
            <div style={{...G.surface,borderColor:'#D4A843',marginBottom:'24px'}}>
              <div style={{...G.gold,fontSize:'9px',letterSpacing:'4px',marginBottom:'6px'}}>SIGNATURE STRENGTH</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'18px',color:'#F0C060'}}>{topSkill[0]} · {topSkill[1] as any}</div>
            </div>
          )}

          {sceneHistory.length > 0 && (
            <div style={{...G.surface,marginBottom:'16px',textAlign:'left'}}>
              <div style={G.sideLabel}>YOUR JOURNEY</div>
              {sceneHistory.map((s,i) => (
                <div key={i} style={{...G.muted,fontSize:'11px',padding:'3px 0'}}>{i+1}. {s}</div>
              ))}
            </div>
          )}

          {player.majorDecisions?.length > 0 && (
            <div style={{...G.surface,marginBottom:'16px',textAlign:'left'}}>
              <div style={G.sideLabel}>MAJOR DECISIONS</div>
              {player.majorDecisions.map((d:string,i:number) => (
                <div key={i} style={{...G.muted,fontSize:'11px',padding:'3px 0'}}>• {d}</div>
              ))}
            </div>
          )}

          {player.achievements?.length > 0 && (
            <div style={{...G.surface,marginBottom:'24px',textAlign:'left'}}>
              <div style={G.sideLabel}>ACHIEVEMENTS</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'8px'}}>
                {player.achievements.map((key:string,i:number) => {
                  const a = ACHIEVEMENTS[key]
                  if (!a) return null
                  const tierColor = a.tier==='platinum'?'#E5E4E2':a.tier==='gold'?'#FFD700':a.tier==='silver'?'#C0C0C0':'#CD7F32'
                  return (
                    <div key={i} style={{background:'#0A0A0C',border:`1px solid ${tierColor}`,padding:'8px',borderRadius:'2px'}}>
                      <div style={{color:tierColor,fontSize:'11px',fontWeight:700,marginBottom:'2px'}}>🏆 {a.title}</div>
                      <div style={{...G.muted,fontSize:'10px',lineHeight:1.3}}>{a.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
            <button onClick={()=>{setCurrentWorld(null);setCurrentScene(null);setSceneHistory([]);setNotifs([]);setPlayer(defaultPlayer());setScreen('worldselect')}} style={G.btnGold}>NEW WORLD</button>
            <button onClick={()=>{setCurrentWorld(null);setCurrentScene(null);setSceneHistory([]);setNotifs([]);setPlayer(defaultPlayer());setScreen('creation')}} style={G.btnGhost}>NEW CHARACTER</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
