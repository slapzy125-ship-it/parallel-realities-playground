import { useState, useEffect, useRef } from 'react'
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

const TRAITS = ['Ambitious','Loyal','Brave','Competitive','Intelligent','Creative','Confident','Curious','Ruthless','Charismatic']
const GOALS = ['Become a Legend','Gain Power','Build an Empire','Become Rich','Save the World','Discover the Unknown']
const NATIONALITIES = ['English','Spanish','French','German','Brazilian','Argentine','Portuguese','Italian','Dutch','Belgian','Croatian','Senegalese','Nigerian','Moroccan','Japanese','American','Mexican','Colombian','Australian','Scottish','Welsh','Irish','Swedish','Norwegian']

const ACTS = [
  {id:1,name:'The Beginning',range:[0,4],desc:'Your story starts here.'},
  {id:2,name:'Rising Tension',range:[5,9],desc:'The world reacts to you.'},
  {id:3,name:'The Crisis',range:[10,14],desc:'Everything is at stake.'},
  {id:4,name:'Confrontation',range:[15,19],desc:'Face your greatest challenge.'},
  {id:5,name:'The Legend',range:[20,24],desc:'Your legacy is decided.'},
]
const getAct = (p:number) => ACTS.find(a => p >= a.range[0] && p <= a.range[1]) ?? ACTS[4]

const CHAPTER_NAMES: Record<string,string[]> = {
  arcane:['The Arrival','The Forbidden Floor','The Vanishing','The Weight of Secrets','The Trials','The Betrayal','The Reckoning'],
  champions:['The Trial','First Contract','Breaking Through','The Transfer','Peak Years','The Final Push','Legacy Season'],
  galactic:['First Flight','Choosing Sides','The War Begins','Behind Enemy Lines','The Turning Point'],
  dragonfall:['The Tournament','The Alliance','Fire and Blood','The Dragon Bond','The Final War'],
  shadow:['The Initiation','The First Contract','Into the Dark','The Brotherhood Test','The Reckoning'],
  neon:['First Breach','Going Deeper','Corporate Enemy','The Network','Endgame'],
  odyssey:["The Oracle's Call",'The First Trial','Divine Favour','The Dark Road','The Eternal Gate'],
  hero:['Licence Granted','First Response','Rising Ranks','The Crisis','Final Stand'],
}

const WORLD_NEWS_SOURCE: Record<string,string> = {
  arcane:'The Daily Arcane',
  champions:'Transfer Central',
  galactic:'Galactic Broadcast Network',
  dragonfall:'The Kingdom Herald',
  shadow:'The Underground Wire',
  neon:'NeonNet Feed',
  odyssey:"The Oracle's Echo",
  hero:'Hero Watch Daily',
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
  topbar:{background:'#0F0F14',borderBottom:'1px solid #2A2A3A',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky' as const,top:0,zIndex:100},
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
  const [sceneImage, setSceneImage] = useState('')
  const [wandWood, setWandWood] = useState<any>(null)
  const [wandCore, setWandCore] = useState<any>(null)
  const [wandLength, setWandLength] = useState<any>(null)
  const [saberColor, setSaberColor] = useState<any>(null)
  const [cybernetic, setCybernetic] = useState<any>(null)
  const [greekWeapon, setGreekWeapon] = useState<any>(null)
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedPower, setSelectedPower] = useState('')
  const [selectedCreed, setSelectedCreed] = useState('')
  const historyRef = useRef<any[]>([])

  const fonts = <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet"/>

  useEffect(() => {
    if (!currentTrophy && trophyQueue.length > 0) {
      setCurrentTrophy(trophyQueue[0])
      setTrophyQueue(q => q.slice(1))
    }
  }, [trophyQueue, currentTrophy])

  return (
    <div style={G.app}>
      {fonts}
      <div style={G.center}>
        <div style={G.muted}>Loading Revenio...</div>
      </div>
    </div>
  )
}
