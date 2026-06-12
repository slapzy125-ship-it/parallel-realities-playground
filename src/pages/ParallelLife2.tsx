import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

const STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideLeft { from { opacity:0; transform:translateX(32px); } to { opacity:1; transform:translateX(0); } }
  @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
  @keyframes bgPulse { 0%,100% { background-color:#0D1117; } 50% { background-color:#0a0f1a; } }
  @keyframes drawLine { from { stroke-dashoffset:1000; } to { stroke-dashoffset:0; } }
  @keyframes wordFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  @keyframes glow { 0%,100% { box-shadow:0 0 20px rgba(74,158,255,0.2); } 50% { box-shadow:0 0 40px rgba(74,158,255,0.5); } }
  @keyframes letterIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes particleFloat { from { transform:translateY(100vh); opacity:0; } 20% { opacity:0.6; } 80% { opacity:0.6; } to { transform:translateY(-20px); opacity:0; } }
  @keyframes progressShimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes scanLine { from { top:0%; } to { top:100%; } }
  @keyframes countUp { from { opacity:0; } to { opacity:1; } }
`

const PARTICLES = Array.from({length:20}, (_,i) => ({
  id: i,
  left: `${Math.random()*100}%`,
  duration: `${8+Math.random()*12}s`,
  delay: `${Math.random()*10}s`,
  size: `${1+Math.random()*2}px`,
}))

const defaultProfile = () => ({
  firstName:'', age:'', grewUpCity:'', grewUpCountry:'',
  liveCity:'', liveCountry:'', familyStructure:'',
  birthOrder:'', financialBackground:'', threeWords:'',
  greatestStrength:'', greatestWeakness:'', mostProudOf:'',
  wonderAbout:'', relationshipStatus:'', partnerName:'',
  togetherLength:'', howMet:'', closestFriendName:'',
  closestFriendDesc:'', shapedByName:'', shapedByHow:'',
  parentRelationship:'', endedRelationship:'',
  inSchool:'', schoolName:'', studying:'',
  wentToCollege:'', collegeName:'', collegeSubject:'',
  collegeWhy:'', otherSchools:'', timeMostly:'',
  currentJob:'', incomeRange:'', doingWhatExpected:'',
  ownOrRent:'', livingSituation:'', hasChildren:'',
  childrenDetails:'', socialConnection:'', physicalHealth:'',
  mentalHealth:'', typicalWeek:'', proudOf:'', regretOrWonder:'',
  theDecision:'', decisionAge:'', whyMadeIt:'',
  alternativePath:'', whyNotTaken:'', peopleNotMet:'',
  initialHypothesis:'', mostWantToKnow:'',
})

type Profile = ReturnType<typeof defaultProfile>
type SimResult = {
  overallJudgment:string, immediateAftermath:string, firstYear:string,
  formativeYears:string, middleYears:string, laterYears:string, oldAge:string,
  turningPoint1:{situation:string,choiceA:string,choiceB:string},
  turningPoint2:{situation:string,choiceA:string,choiceB:string},
  turningPoint3:{situation:string,choiceA:string,choiceB:string},
  sideBySide:{age:string,realLife:string,alternateLife:string,category:string}[],
  butterflyChain:string[], keyDifferences:string[],
  regretScore:number, regretExplanation:string, messageFromOtherSelf:string,
}

export default function ParallelLife2() {
  const [step, setStep] = useState<'hero'|'form'|'loading'|'result'>('hero')
  const [formStep, setFormStep] = useState(1)
  const [profile, setProfile] = useState<Profile>(defaultProfile())
  const [sim, setSim] = useState<SimResult|null>(null)
  const [userTier, setUserTier] = useState<'free'|'legend'|'immortal'>('free')
  const [tp1Choice, setTp1Choice] = useState<'A'|'B'|null>(null)
  const [tp2Choice, setTp2Choice] = useState<'A'|'B'|null>(null)
  const [tp3Choice, setTp3Choice] = useState<'A'|'B'|null>(null)
  const [loadingLines, setLoadingLines] = useState<string[]>([])
  const [visibleWords, setVisibleWords] = useState(0)
  const [regretAnimated, setRegretAnimated] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  const up = (k: keyof Profile, v: string) => setProfile(p => ({...p, [k]:v}))

  useEffect(() => {
    const saved = localStorage.getItem('revenio_parallel2_profile')
    if (saved) { try { setProfile(JSON.parse(saved)) } catch {} }
    const tier = localStorage.getItem('revenio_subscription') || 'free'
    setUserTier(tier as any)
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email?.toLowerCase() || ''
      if (email.includes('slapzy125')) setUserTier('immortal')
    })
  }, [])

  useEffect(() => {
    if (step === 'result' && sim) {
      const words = sim.messageFromOtherSelf.split(' ')
      let i = 0
      const t = setInterval(() => {
        i++
        setVisibleWords(i)
        if (i >= words.length) clearInterval(t)
      }, 80)
      return () => clearInterval(t)
    }
  }, [step, sim])

  useEffect(() => {
    if (step === 'result' && sim) {
      let val = 0
      const target = sim.regretScore
      const t = setInterval(() => {
        val += 2
        setRegretAnimated(Math.min(val, target))
        if (val >= target) clearInterval(t)
      }, 30)
      return () => clearInterval(t)
    }
  }, [step, sim])

  const runSimulation = async () => {
    localStorage.setItem('revenio_parallel2_profile', JSON.stringify(profile))
    setStep('loading')
    const lines = [
      'Analysing your life...',
      'Mapping the decision point...',
      'Building your alternate timeline...',
      'Identifying who you would have met...',
      'Calculating the chain of consequences...',
      'Your other life is ready.',
    ]
    let i = 0
    const lt = setInterval(() => {
      setLoadingLines(prev => [...prev, lines[i]])
      i++
      if (i >= lines.length) clearInterval(lt)
    }, 700)

    const systemPrompt = `You are simulating a parallel life for a real person based on one different decision they made. You have their complete profile. Generate their alternate timeline as a detailed flowing narrative.

ABSOLUTE RULES:
1. TIMELINE CUT: Anyone met AFTER the real decision does not exist in the alternate timeline. The profile lists these people under peopleNotMet. Never mention them. Not once. Build an entirely new social world for the alternate path.
2. Only mention people who existed before the decision: family from childhood, people explicitly named as pre-decision.
3. Use their actual real details constantly: hometown, strengths, weaknesses, family structure. Make it feel like THIS specific person.
4. Be specific and surprising. Do not just confirm their hypothesis. Show what they did not expect.
5. Reference real places. If they chose a different university reference real things about that university and that city.
6. Write simply. Short sentences. Concrete details. Real feelings shown through specific events. Never use words like trajectory, seminal, ripple effect, pivotal.
7. Second person present tense: You are 24 and living in Edinburgh.
8. Each narrative section 150-200 words. Vivid and specific.
9. The final message: write as if the alternate version reached across the multiverse. Honest not sentimental. End with their real first name.

Return ONLY this exact JSON with no markdown no backticks:
{"overallJudgment":"one sentence","immediateAftermath":"150-200 words","firstYear":"150-200 words","formativeYears":"150-200 words","middleYears":"150-200 words","laterYears":"150-200 words","oldAge":"150-200 words","turningPoint1":{"situation":"50 words","choiceA":"20 words","choiceB":"20 words"},"turningPoint2":{"situation":"50 words","choiceA":"20 words","choiceB":"20 words"},"turningPoint3":{"situation":"50 words","choiceA":"20 words","choiceB":"20 words"},"sideBySide":[{"age":"22","realLife":"30 words","alternateLife":"30 words","category":"Location"},{"age":"25","realLife":"30 words","alternateLife":"30 words","category":"Career"},{"age":"28","realLife":"30 words","alternateLife":"30 words","category":"Relationships"},{"age":"30","realLife":"30 words","alternateLife":"30 words","category":"How you felt"},{"age":"35","realLife":"30 words","alternateLife":"30 words","category":"What defined you"}],"butterflyChain":["chain 1","chain 2","chain 3","chain 4","chain 5"],"keyDifferences":["diff 1","diff 2","diff 3","diff 4","diff 5"],"regretScore":65,"regretExplanation":"100 words","messageFromOtherSelf":"200 words ending with first name"}

CRITICAL: Your entire response must be a single valid JSON object. No text before it. No text after it. No markdown. No backticks. No explanation. Just the raw JSON object starting with { and ending with }`

    const userMsg = `Here is my complete life profile:
Name: ${profile.firstName}, Age: ${profile.age}
Grew up in: ${profile.grewUpCity}, ${profile.grewUpCountry}
Now live in: ${profile.liveCity}, ${profile.liveCountry}
Family structure: ${profile.familyStructure}, Birth order: ${profile.birthOrder}
Financial background: ${profile.financialBackground}
Three words people use for me: ${profile.threeWords}
Greatest strength: ${profile.greatestStrength}
Greatest weakness: ${profile.greatestWeakness}
Most proud of: ${profile.mostProudOf}
Wonder about most: ${profile.wonderAbout}
Relationship status: ${profile.relationshipStatus}
Partner: ${profile.partnerName}, together ${profile.togetherLength}, met: ${profile.howMet}
Closest friend: ${profile.closestFriendName} — ${profile.closestFriendDesc}
Person who shaped me most: ${profile.shapedByName} — ${profile.shapedByHow}
Parent relationship: ${profile.parentRelationship}
Relationship that left a mark: ${profile.endedRelationship}
Education: ${profile.inSchool==='yes'?`Currently at ${profile.schoolName} studying ${profile.studying}`:''}
${profile.wentToCollege==='yes'?`Went to ${profile.collegeName}, studied ${profile.collegeSubject}, chose it because: ${profile.collegeWhy}`:''}
Other schools considered: ${profile.otherSchools}
Career path: ${profile.timeMostly}
Current job: ${profile.currentJob}, Income: ${profile.incomeRange}
Doing what expected: ${profile.doingWhatExpected}
Living situation: ${profile.ownOrRent}, ${profile.livingSituation}
Children: ${profile.hasChildren} — ${profile.childrenDetails}
Social connection: ${profile.socialConnection}
Physical health: ${profile.physicalHealth}, Mental health: ${profile.mentalHealth}
Typical week: ${profile.typicalWeek}
Proud of: ${profile.proudOf}
Regret or wonder: ${profile.regretOrWonder}

THE DECISION I ACTUALLY MADE: ${profile.theDecision}
How old I was: ${profile.decisionAge}
Why I made it: ${profile.whyMadeIt}
The alternative I did not take: ${profile.alternativePath}
Why I did not take it: ${profile.whyNotTaken}
PEOPLE I WOULD NOT HAVE MET ON THE ALTERNATE PATH — NEVER MENTION THESE: ${profile.peopleNotMet}
What I think would have been different: ${profile.initialHypothesis}
What I most want to know: ${profile.mostWantToKnow}`

    try {
      const response = await fetch('https://parallel-realities-playground.vercel.app/api/anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMsg }]
        })
      })
      const responseText = await response.text()
      console.log('Vercel proxy status:', response.status)
      console.log('Vercel proxy response:', responseText.slice(0, 500))
      const data = JSON.parse(responseText)
      const raw = (data.content || []).map((c: any) => c.text || '').join('')
      console.log('Raw AI response:', raw.slice(0, 500))
      let result
      try {
        result = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('no json')
        result = JSON.parse(match[0])
      }
      setSim(result)
      setStep('result')
    } catch(e) {
      console.error(e)
      setStep('form')
      alert('Simulation failed. Please try again.')
    }
  }

  const regretColor = regretAnimated < 40 ? '#4A9EFF' : regretAnimated < 70 ? '#D4A843' : '#ff6b6b'
  const circumference = 2 * Math.PI * 54
  const strokeDash = circumference - (regretAnimated / 100) * circumference

  return (
    <div style={{minHeight:'100vh',background:'#0D1117',color:'#F0F0F0',fontFamily:'system-ui,sans-serif',animation:'bgPulse 8s infinite',position:'relative',overflow:'hidden'}}>
      <style>{STYLES}</style>
      {PARTICLES.map(p => (
        <div key={p.id} style={{position:'fixed',left:p.left,bottom:'-20px',width:p.size,height:p.size,borderRadius:'50%',background:'#4A9EFF',opacity:0.3,animation:`particleFloat ${p.duration} ${p.delay} infinite linear`,pointerEvents:'none',zIndex:0}}/>
      ))}
      <div style={{position:'relative',zIndex:1}}>
        {step === 'hero' && <HeroSection onStart={() => setStep('form')} />}
        {step === 'form' && (
          <FormSection
            profile={profile} up={up} formStep={formStep}
            setFormStep={setFormStep} onSubmit={runSimulation}
          />
        )}
        {step === 'loading' && <LoadingSection lines={loadingLines} />}
        {step === 'result' && sim && (
          <ResultSection
            sim={sim} profile={profile} userTier={userTier}
            tp1Choice={tp1Choice} setTp1Choice={setTp1Choice}
            tp2Choice={tp2Choice} setTp2Choice={setTp2Choice}
            tp3Choice={tp3Choice} setTp3Choice={setTp3Choice}
            visibleWords={visibleWords} regretAnimated={regretAnimated}
            regretColor={regretColor} circumference={circumference}
            strokeDash={strokeDash}
            onReset={() => { setSim(null); setStep('form'); setFormStep(5) }}
            onNewProfile={() => { setSim(null); setProfile(defaultProfile()); setStep('form'); setFormStep(1) }}
          />
        )}
      </div>
    </div>
  )
}

function HeroSection({ onStart }: { onStart: () => void }) {
  const title = 'PARALLEL LIFE 2.0'.split('')
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 20px'}}>
      <div style={{marginBottom:'24px'}}>
        {title.map((l,i) => (
          <span key={i} style={{display:'inline-block',fontSize:'clamp(28px,6vw,64px)',fontWeight:900,letterSpacing:'4px',color:'#F0F0F0',animation:`letterIn 0.5s ease ${i*0.05}s both`}}>{l === ' ' ? '\u00A0' : l}</span>
        ))}
      </div>
      <div style={{fontFamily:'Georgia,serif',fontSize:'clamp(16px,2vw,22px)',color:'rgba(240,240,240,0.7)',marginBottom:'48px',maxWidth:'600px',lineHeight:1.7,animation:'fadeUp 1s ease 1s both'}}>
        What would your life look like if you had chosen differently?
      </div>
      <button
        onClick={onStart}
        style={{background:'linear-gradient(135deg,#1a3a6b,#4A9EFF)',color:'white',border:'none',padding:'18px 56px',fontSize:'18px',fontFamily:'Georgia,serif',cursor:'pointer',borderRadius:'4px',letterSpacing:'2px',animation:'glow 2s infinite, fadeUp 1s ease 1.2s both',transition:'transform 0.3s'}}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
      >
        BEGIN YOUR SIMULATION
      </button>
      <div style={{marginTop:'24px',color:'rgba(240,240,240,0.3)',fontSize:'13px',animation:'fadeUp 1s ease 1.4s both'}}>
        The more honestly you answer, the more surprising the result
      </div>
    </div>
  )
}

function LoadingSection({ lines }: { lines: string[] }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'20px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:'50%',width:'1px',height:'100%',background:'linear-gradient(180deg,transparent,#4A9EFF,transparent)',animation:'scanLine 3s linear infinite',opacity:0.3}}/>
      <div style={{width:'48px',height:'48px',border:'2px solid rgba(74,158,255,0.3)',borderTopColor:'#4A9EFF',borderRadius:'50%',animation:'spin 1s linear infinite',marginBottom:'16px'}}/>
      {lines.map((line,i) => (
        <div key={i} style={{color:i===lines.length-1?'#4A9EFF':'rgba(240,240,240,0.6)',fontSize:'15px',letterSpacing:'2px',animation:'fadeUp 0.5s ease both',fontFamily:'Georgia,serif'}}>{line}</div>
      ))}
    </div>
  )
}

function FormSection({ profile, up, formStep, setFormStep, onSubmit }: any) {
  const totalSteps = 6
  const pct = ((formStep-1)/totalSteps)*100

  const inputStyle: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(74,158,255,0.2)',
    color:'#F0F0F0', padding:'12px 16px', fontSize:'15px', borderRadius:'4px',
    outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box',
    transition:'border-color 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    display:'block', color:'rgba(240,240,240,0.6)', fontSize:'12px',
    letterSpacing:'2px', marginBottom:'8px', textTransform:'uppercase' as const,
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor:'pointer' }
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight:'100px', resize:'vertical' as const, lineHeight:1.6 }

  const next = () => setFormStep((s:number) => Math.min(s+1, totalSteps))
  const prev = () => setFormStep((s:number) => Math.max(s-1, 1))

  return (
    <div style={{minHeight:'100vh',padding:'40px 20px',maxWidth:'720px',margin:'0 auto'}}>
      <div style={{marginBottom:'32px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
          <span style={{color:'#4A9EFF',fontSize:'12px',letterSpacing:'3px'}}>STEP {formStep} OF {totalSteps}</span>
          <span style={{color:'rgba(240,240,240,0.4)',fontSize:'12px'}}>{Math.round(pct)}% complete</span>
        </div>
        <div style={{width:'100%',height:'3px',background:'rgba(255,255,255,0.1)',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#1a3a6b,#4A9EFF)',backgroundSize:'200% 100%',animation:'progressShimmer 2s linear infinite',transition:'width 0.5s ease',borderRadius:'2px'}}/>
        </div>
      </div>

      <div style={{animation:'slideLeft 0.4s ease both'}}>
        {formStep === 1 && (
          <div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#F0F0F0',marginBottom:'8px'}}>Who Are You</h2>
            <p style={{color:'rgba(240,240,240,0.5)',marginBottom:'32px',lineHeight:1.7,fontStyle:'italic',fontFamily:'Georgia,serif'}}>The more honestly you answer these questions the more accurate and surprising your simulation will be. This is just for you.</p>
            <div style={{display:'grid',gap:'20px'}}>
              <div><label style={labelStyle}>Your first name *</label><input style={inputStyle} value={profile.firstName} onChange={e=>up('firstName',e.target.value)} placeholder="Your first name"/></div>
              <div><label style={labelStyle}>Your current age *</label><input style={inputStyle} type="number" value={profile.age} onChange={e=>up('age',e.target.value)} placeholder="Your age"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={labelStyle}>City you grew up in *</label><input style={inputStyle} value={profile.grewUpCity} onChange={e=>up('grewUpCity',e.target.value)} placeholder="City"/></div>
                <div><label style={labelStyle}>Country *</label><input style={inputStyle} value={profile.grewUpCountry} onChange={e=>up('grewUpCountry',e.target.value)} placeholder="Country"/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={labelStyle}>City you live in now</label><input style={inputStyle} value={profile.liveCity} onChange={e=>up('liveCity',e.target.value)} placeholder="City"/></div>
                <div><label style={labelStyle}>Country</label><input style={inputStyle} value={profile.liveCountry} onChange={e=>up('liveCountry',e.target.value)} placeholder="Country"/></div>
              </div>
              <div><label style={labelStyle}>Family structure growing up</label>
                <select style={selectStyle} value={profile.familyStructure} onChange={e=>up('familyStructure',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Both parents together and happy</option>
                  <option>Both parents together but complicated</option>
                  <option>Parents separated or divorced</option>
                  <option>Single parent household</option>
                  <option>Raised by other family members</option>
                  <option>Moved around a lot</option>
                </select>
              </div>
              <div><label style={labelStyle}>Birth order</label>
                <select style={selectStyle} value={profile.birthOrder} onChange={e=>up('birthOrder',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Only child</option><option>Oldest sibling</option>
                  <option>Middle sibling</option><option>Youngest sibling</option>
                </select>
              </div>
              <div><label style={labelStyle}>Family financial situation growing up</label>
                <select style={selectStyle} value={profile.financialBackground} onChange={e=>up('financialBackground',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Struggled financially</option><option>Working class comfortable</option>
                  <option>Middle class</option><option>Upper middle class</option><option>Wealthy</option>
                </select>
              </div>
              <div><label style={labelStyle}>How would people who know you best describe you in 3 words</label><input style={inputStyle} value={profile.threeWords} onChange={e=>up('threeWords',e.target.value)} placeholder="e.g. Ambitious, loyal, overthinking"/></div>
              <div><label style={labelStyle}>Your greatest strength</label><input style={inputStyle} value={profile.greatestStrength} onChange={e=>up('greatestStrength',e.target.value)} placeholder="What comes naturally to you"/></div>
              <div><label style={labelStyle}>Your greatest weakness or struggle</label><input style={inputStyle} value={profile.greatestWeakness} onChange={e=>up('greatestWeakness',e.target.value)} placeholder="Be honest — it makes the simulation better"/></div>
              <div><label style={labelStyle}>One thing you are most proud of</label><textarea style={textareaStyle} value={profile.mostProudOf} onChange={e=>up('mostProudOf',e.target.value)} placeholder="Could be anything — big or small"/></div>
              <div><label style={labelStyle}>One thing you wonder about most in your own life</label><textarea style={textareaStyle} value={profile.wonderAbout} onChange={e=>up('wonderAbout',e.target.value)} placeholder="What keeps coming back to you"/></div>
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#F0F0F0',marginBottom:'8px'}}>The People In Your Life</h2>
            <p style={{color:'rgba(240,240,240,0.5)',marginBottom:'32px',lineHeight:1.7,fontStyle:'italic',fontFamily:'Georgia,serif'}}>Relationships shape everything. The simulation uses this to understand who you might have met and who you would have lost on a different path.</p>
            <div style={{display:'grid',gap:'20px'}}>
              <div><label style={labelStyle}>Current relationship status</label>
                <select style={selectStyle} value={profile.relationshipStatus} onChange={e=>up('relationshipStatus',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Single</option><option>In a relationship</option><option>Engaged</option>
                  <option>Married</option><option>Divorced</option><option>Complicated</option>
                </select>
              </div>
              {['In a relationship','Engaged','Married'].includes(profile.relationshipStatus) && (
                <>
                  <div><label style={labelStyle}>Partner's name (optional)</label><input style={inputStyle} value={profile.partnerName} onChange={e=>up('partnerName',e.target.value)} placeholder="Their name"/></div>
                  <div><label style={labelStyle}>How long together</label><input style={inputStyle} value={profile.togetherLength} onChange={e=>up('togetherLength',e.target.value)} placeholder="e.g. 3 years"/></div>
                </>
              )}
              <div><label style={labelStyle}>How you met your most significant person</label><input style={inputStyle} value={profile.howMet} onChange={e=>up('howMet',e.target.value)} placeholder="Optional but helps the simulation"/></div>
              <div><label style={labelStyle}>Closest friend's name</label><input style={inputStyle} value={profile.closestFriendName} onChange={e=>up('closestFriendName',e.target.value)} placeholder="Their name"/></div>
              <div><label style={labelStyle}>One sentence about them</label><input style={inputStyle} value={profile.closestFriendDesc} onChange={e=>up('closestFriendDesc',e.target.value)} placeholder="Who are they to you"/></div>
              <div><label style={labelStyle}>One person who shaped you more than anyone else</label><input style={inputStyle} value={profile.shapedByName} onChange={e=>up('shapedByName',e.target.value)} placeholder="Their name"/></div>
              <div><label style={labelStyle}>How they shaped you</label><textarea style={textareaStyle} value={profile.shapedByHow} onChange={e=>up('shapedByHow',e.target.value)} placeholder="What did they do or say or show you"/></div>
              <div><label style={labelStyle}>Your relationship with your parents now</label>
                <select style={selectStyle} value={profile.parentRelationship} onChange={e=>up('parentRelationship',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Very close</option><option>Good</option><option>Distant but okay</option>
                  <option>Complicated or strained</option><option>One or both have passed away</option>
                </select>
              </div>
              <div><label style={labelStyle}>A relationship that ended and left a mark on you (optional)</label><textarea style={textareaStyle} value={profile.endedRelationship} onChange={e=>up('endedRelationship',e.target.value)} placeholder="You do not have to share this but it helps the simulation understand you"/></div>
            </div>
          </div>
        )}

        {formStep === 3 && (
          <div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#F0F0F0',marginBottom:'8px'}}>Your Life So Far</h2>
            <p style={{color:'rgba(240,240,240,0.5)',marginBottom:'32px',lineHeight:1.7,fontStyle:'italic',fontFamily:'Georgia,serif'}}>Answer what applies to you. If you are still in school skip the career questions. Nothing here is required.</p>
            <div style={{display:'grid',gap:'20px'}}>
              <div><label style={labelStyle}>Are you currently in school or university?</label>
                <div style={{display:'flex',gap:'12px'}}>
                  {['yes','no'].map(v => <button key={v} onClick={()=>up('inSchool',v)} style={{flex:1,padding:'12px',background:profile.inSchool===v?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${profile.inSchool===v?'#4A9EFF':'rgba(255,255,255,0.1)'}`,color:'#F0F0F0',cursor:'pointer',borderRadius:'4px',fontSize:'14px',transition:'all 0.2s'}}>{v.toUpperCase()}</button>)}
                </div>
              </div>
              {profile.inSchool === 'yes' && (
                <>
                  <div><label style={labelStyle}>Which school or university</label><input style={inputStyle} value={profile.schoolName} onChange={e=>up('schoolName',e.target.value)} placeholder="Name of school"/></div>
                  <div><label style={labelStyle}>What are you studying</label><input style={inputStyle} value={profile.studying} onChange={e=>up('studying',e.target.value)} placeholder="Subject or course"/></div>
                </>
              )}
              <div><label style={labelStyle}>Have you finished school or university?</label>
                <div style={{display:'flex',gap:'12px'}}>
                  {['yes','no'].map(v => <button key={v} onClick={()=>up('wentToCollege',v)} style={{flex:1,padding:'12px',background:profile.wentToCollege===v?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${profile.wentToCollege===v?'#4A9EFF':'rgba(255,255,255,0.1)'}`,color:'#F0F0F0',cursor:'pointer',borderRadius:'4px',fontSize:'14px',transition:'all 0.2s'}}>{v.toUpperCase()}</button>)}
                </div>
              </div>
              {profile.wentToCollege === 'yes' && (
                <>
                  <div><label style={labelStyle}>Where did you go</label><input style={inputStyle} value={profile.collegeName} onChange={e=>up('collegeName',e.target.value)} placeholder="School or university name"/></div>
                  <div><label style={labelStyle}>What did you study</label><input style={inputStyle} value={profile.collegeSubject} onChange={e=>up('collegeSubject',e.target.value)} placeholder="Subject or degree"/></div>
                  <div><label style={labelStyle}>Why did you choose it</label><textarea style={textareaStyle} value={profile.collegeWhy} onChange={e=>up('collegeWhy',e.target.value)} placeholder="What made you pick that place"/></div>
                </>
              )}
              <div><label style={labelStyle}>Other schools or places you got into but did not go</label><input style={inputStyle} value={profile.otherSchools} onChange={e=>up('otherSchools',e.target.value)} placeholder="This is often where the pivotal decision lives"/></div>
              <div><label style={labelStyle}>What do you spend most of your time on</label><textarea style={textareaStyle} value={profile.timeMostly} onChange={e=>up('timeMostly',e.target.value)} placeholder="Could be school, work, a sport, building something, looking after someone, anything"/></div>
              <div><label style={labelStyle}>Current job or role (if you have one)</label><input style={inputStyle} value={profile.currentJob} onChange={e=>up('currentJob',e.target.value)} placeholder="Optional"/></div>
              <div><label style={labelStyle}>Income range (optional)</label>
                <select style={selectStyle} value={profile.incomeRange} onChange={e=>up('incomeRange',e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option>Under 20k</option><option>20k to 40k</option><option>40k to 70k</option>
                  <option>70k to 100k</option><option>100k to 150k</option><option>150k plus</option>
                </select>
              </div>
              <div><label style={labelStyle}>Are you doing what you thought you would be doing at this point</label>
                <div style={{display:'flex',gap:'12px'}}>
                  {['yes','no','I had no idea what I wanted'].map(v => <button key={v} onClick={()=>up('doingWhatExpected',v)} style={{flex:1,padding:'10px 6px',background:profile.doingWhatExpected===v?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${profile.doingWhatExpected===v?'#4A9EFF':'rgba(255,255,255,0.1)'}`,color:'#F0F0F0',cursor:'pointer',borderRadius:'4px',fontSize:'12px',transition:'all 0.2s'}}>{v}</button>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {formStep === 4 && (
          <div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#F0F0F0',marginBottom:'8px'}}>Where Your Life Has Taken You</h2>
            <p style={{color:'rgba(240,240,240,0.5)',marginBottom:'32px',lineHeight:1.7,fontStyle:'italic',fontFamily:'Georgia,serif'}}>The small details of everyday life are what make the simulation feel real.</p>
            <div style={{display:'grid',gap:'20px'}}>
              <div><label style={labelStyle}>Do you own, rent, or live with family</label>
                <select style={selectStyle} value={profile.ownOrRent} onChange={e=>up('ownOrRent',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Own</option><option>Rent</option><option>Live with family</option>
                  <option>Student accommodation</option><option>Other</option>
                </select>
              </div>
              <div><label style={labelStyle}>Describe your living situation briefly</label><input style={inputStyle} value={profile.livingSituation} onChange={e=>up('livingSituation',e.target.value)} placeholder="City apartment, house in suburbs, rural, travelling etc"/></div>
              <div><label style={labelStyle}>Do you have children</label>
                <div style={{display:'flex',gap:'12px'}}>
                  {['yes','no','not yet'].map(v => <button key={v} onClick={()=>up('hasChildren',v)} style={{flex:1,padding:'12px',background:profile.hasChildren===v?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${profile.hasChildren===v?'#4A9EFF':'rgba(255,255,255,0.1)'}`,color:'#F0F0F0',cursor:'pointer',borderRadius:'4px',fontSize:'13px',transition:'all 0.2s'}}>{v}</button>)}
                </div>
              </div>
              {profile.hasChildren === 'yes' && <div><label style={labelStyle}>How many and rough ages</label><input style={inputStyle} value={profile.childrenDetails} onChange={e=>up('childrenDetails',e.target.value)} placeholder="e.g. Two kids, ages 4 and 7"/></div>}
              <div><label style={labelStyle}>How connected are you to the people you care about</label>
                <select style={selectStyle} value={profile.socialConnection} onChange={e=>up('socialConnection',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Very connected</option><option>Mostly connected</option>
                  <option>A bit isolated</option><option>Quite lonely</option>
                </select>
              </div>
              <div><label style={labelStyle}>Physical health generally</label>
                <select style={selectStyle} value={profile.physicalHealth} onChange={e=>up('physicalHealth',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Very healthy</option><option>Pretty good</option>
                  <option>Some ongoing issues</option><option>Dealing with something significant</option>
                </select>
              </div>
              <div><label style={labelStyle}>Mental health generally</label>
                <select style={selectStyle} value={profile.mentalHealth} onChange={e=>up('mentalHealth',e.target.value)}>
                  <option value="">Select...</option>
                  <option>Thriving</option><option>Mostly good</option>
                  <option>Some struggles</option><option>A difficult period right now</option>
                </select>
              </div>
              <div><label style={labelStyle}>What does a typical week look like for you</label><textarea style={textareaStyle} value={profile.typicalWeek} onChange={e=>up('typicalWeek',e.target.value)} placeholder="Walk me through a normal week in your life"/></div>
              <div><label style={labelStyle}>What are you most proud of in your life so far</label><textarea style={textareaStyle} value={profile.proudOf} onChange={e=>up('proudOf',e.target.value)} placeholder="Big or small, anything counts"/></div>
              <div><label style={labelStyle}>What do you most regret or wonder about</label><textarea style={textareaStyle} value={profile.regretOrWonder} onChange={e=>up('regretOrWonder',e.target.value)} placeholder="The thing that comes back to you"/></div>
            </div>
          </div>
        )}

        {formStep === 5 && (
          <div>
            <div style={{background:'rgba(74,158,255,0.05)',border:'1px solid rgba(74,158,255,0.3)',borderRadius:'8px',padding:'32px',animation:'glow 3s infinite'}}>
              <div style={{color:'#4A9EFF',fontSize:'11px',letterSpacing:'4px',marginBottom:'16px'}}>THE MOMENT EVERYTHING CHANGED</div>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(22px,4vw,32px)',color:'#F0F0F0',marginBottom:'12px',lineHeight:1.3}}>Every life hinges on moments. This is yours.</h2>
              <p style={{color:'rgba(240,240,240,0.5)',marginBottom:'32px',lineHeight:1.7,fontStyle:'italic',fontFamily:'Georgia,serif'}}>Describe the decision you actually made in as much detail as you can. The more specific you are the more the simulation will surprise you.</p>
              <div style={{display:'grid',gap:'20px'}}>
                <div><label style={labelStyle}>The decision you actually made *</label><textarea style={{...textareaStyle,minHeight:'140px',borderColor:'rgba(74,158,255,0.3)'}} value={profile.theDecision} onChange={e=>up('theDecision',e.target.value)} placeholder="For example: I chose to stay in London instead of moving to New York when I had the opportunity at 22. I stayed because of my relationship at the time and because I was scared. I have always wondered what would have happened if I had gone."/></div>
                <div><label style={labelStyle}>How old were you *</label><input style={inputStyle} value={profile.decisionAge} onChange={e=>up('decisionAge',e.target.value)} placeholder="Your age when you made this decision"/></div>
                <div><label style={labelStyle}>Why did you make the choice you made</label><textarea style={textareaStyle} value={profile.whyMadeIt} onChange={e=>up('whyMadeIt',e.target.value)} placeholder="What were you thinking and feeling at the time"/></div>
                <div><label style={labelStyle}>The alternative you did not take *</label><input style={inputStyle} value={profile.alternativePath} onChange={e=>up('alternativePath',e.target.value)} placeholder="What was the other path"/></div>
                <div><label style={labelStyle}>Why did you not take it</label><textarea style={textareaStyle} value={profile.whyNotTaken} onChange={e=>up('whyNotTaken',e.target.value)} placeholder="What stopped you or made you choose differently"/></div>
                <div style={{background:'rgba(255,100,100,0.05)',border:'1px solid rgba(255,100,100,0.2)',borderRadius:'4px',padding:'16px'}}>
                  <label style={{...labelStyle,color:'rgba(255,160,160,0.8)'}}>⚠️ IMPORTANT — Who would you NOT have met on the alternate path</label>
                  <textarea style={{...textareaStyle,borderColor:'rgba(255,100,100,0.2)'}} value={profile.peopleNotMet} onChange={e=>up('peopleNotMet',e.target.value)} placeholder="List anyone you met AFTER this decision that you would not have met on the other path. Your current partner, your best friend, a colleague. These people will NOT appear in your alternate timeline. This is critical for accuracy."/>
                </div>
                <div><label style={labelStyle}>What do you think would have been most different</label><textarea style={textareaStyle} value={profile.initialHypothesis} onChange={e=>up('initialHypothesis',e.target.value)} placeholder="Your initial hypothesis. The simulation will show you what you did not expect."/></div>
                <div><label style={labelStyle}>What do you most want to know</label><textarea style={textareaStyle} value={profile.mostWantToKnow} onChange={e=>up('mostWantToKnow',e.target.value)} placeholder="Would I be happier? Richer? Would I have found love? Would I have stayed there?"/></div>
              </div>
            </div>
          </div>
        )}

        {formStep === 6 && (
          <div style={{textAlign:'center' as const}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'28px',color:'#F0F0F0',marginBottom:'12px'}}>Your Simulation Is Ready</h2>
            <p style={{color:'rgba(240,240,240,0.5)',marginBottom:'40px',lineHeight:1.7,fontFamily:'Georgia,serif',fontStyle:'italic',maxWidth:'500px',margin:'0 auto 40px'}}>What you are about to see is an AI generated speculation based on everything you told us. It will be specific. It will be surprising. Some of it will feel true. Some will feel wrong. That is the nature of roads not taken.</p>
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(74,158,255,0.15)',borderRadius:'8px',padding:'24px',marginBottom:'40px',textAlign:'left' as const}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {[['Name',profile.firstName],['Age',profile.age],['From',`${profile.grewUpCity}, ${profile.grewUpCountry}`],['Now',`${profile.liveCity}, ${profile.liveCountry}`],['Decision age',profile.decisionAge],['Alternate path',profile.alternativePath]].map(([l,v])=> v ? (
                  <div key={String(l)}>
                    <div style={{color:'rgba(240,240,240,0.4)',fontSize:'11px',letterSpacing:'2px',marginBottom:'4px'}}>{l}</div>
                    <div style={{color:'#F0F0F0',fontSize:'14px'}}>{v}</div>
                  </div>
                ) : null)}
              </div>
            </div>
            <button
              onClick={onSubmit}
              style={{background:'linear-gradient(135deg,#1a3a6b,#4A9EFF)',color:'white',border:'none',padding:'20px 64px',fontSize:'18px',fontFamily:'Georgia,serif',cursor:'pointer',borderRadius:'4px',letterSpacing:'2px',animation:'glow 2s infinite',transition:'transform 0.3s',width:'100%',maxWidth:'400px'}}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
            >
              RUN MY SIMULATION
            </button>
          </div>
        )}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:'40px',gap:'12px'}}>
        {formStep > 1 && (
          <button onClick={prev} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(240,240,240,0.6)',padding:'12px 32px',cursor:'pointer',borderRadius:'4px',fontSize:'14px',transition:'all 0.2s'}}>← Back</button>
        )}
        {formStep < totalSteps && (
          <button onClick={next} style={{background:'linear-gradient(135deg,#1a3a6b,#4A9EFF)',color:'white',border:'none',padding:'12px 32px',cursor:'pointer',borderRadius:'4px',fontSize:'14px',marginLeft:'auto',transition:'transform 0.3s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>Continue →</button>
        )}
      </div>
    </div>
  )
}

function ResultSection({ sim, profile, userTier, tp1Choice, setTp1Choice, tp2Choice, setTp2Choice, tp3Choice, setTp3Choice, visibleWords, regretAnimated, regretColor, circumference, strokeDash, onReset, onNewProfile }: any) {
  const words = sim.messageFromOtherSelf.split(' ')

  const sectionStyle: React.CSSProperties = {
    background:'rgba(255,255,255,0.02)', border:'1px solid rgba(74,158,255,0.1)',
    borderRadius:'8px', padding:'32px', marginBottom:'24px', animation:'fadeUp 0.8s ease both',
  }
  const yearStyle: React.CSSProperties = {
    color:'#4A9EFF', fontSize:'12px', letterSpacing:'3px',
    marginBottom:'8px', fontFamily:'system-ui,sans-serif',
  }
  const narrativeStyle: React.CSSProperties = {
    fontFamily:'Georgia,serif', fontSize:'17px', lineHeight:1.85,
    color:'rgba(240,240,240,0.88)',
  }

  return (
    <div style={{maxWidth:'800px',margin:'0 auto',padding:'40px 20px'}}>
      <div style={{...sectionStyle,borderColor:'rgba(74,158,255,0.3)',animation:'glow 3s infinite',textAlign:'center' as const,marginBottom:'48px'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,5vw,48px)',fontWeight:700,color:'#F0F0F0',marginBottom:'8px'}}>{profile.firstName}</div>
        <div style={{color:'rgba(240,240,240,0.5)',fontSize:'14px',marginBottom:'12px'}}>{sim.overallJudgment && <em style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#D4A843'}}>"{sim.overallJudgment}"</em>}</div>
        <div style={{display:'flex',gap:'24px',justifyContent:'center',flexWrap:'wrap' as const,marginTop:'16px'}}>
          <div style={{textAlign:'center' as const}}><div style={{color:'rgba(240,240,240,0.4)',fontSize:'11px',letterSpacing:'2px'}}>REAL DECISION</div><div style={{color:'rgba(240,240,240,0.7)',fontSize:'13px',marginTop:'4px',maxWidth:'200px'}}>{profile.theDecision?.slice(0,60)}...</div></div>
          <div style={{width:'1px',background:'rgba(255,255,255,0.1)'}}/>
          <div style={{textAlign:'center' as const}}><div style={{color:'rgba(240,240,240,0.4)',fontSize:'11px',letterSpacing:'2px'}}>ALTERNATE PATH</div><div style={{color:'#4A9EFF',fontSize:'13px',marginTop:'4px',maxWidth:'200px'}}>{profile.alternativePath}</div></div>
        </div>
      </div>

      <div style={{...sectionStyle,animationDelay:'0.1s'}}>
        <div style={yearStyle}>IMMEDIATELY AFTER</div>
        <p style={narrativeStyle}>{sim.immediateAftermath}</p>
      </div>

      <div style={{...sectionStyle,animationDelay:'0.2s'}}>
        <div style={yearStyle}>THE FIRST YEAR</div>
        <p style={narrativeStyle}>{sim.firstYear}</p>
      </div>

      {userTier === 'free' && (
        <div style={{background:'rgba(13,17,23,0.95)',backdropFilter:'blur(12px)',border:'1px solid rgba(74,158,255,0.3)',borderRadius:'8px',padding:'48px',textAlign:'center' as const,marginBottom:'24px',animation:'glow 3s infinite'}}>
          <div style={{fontSize:'32px',marginBottom:'16px'}}>🔮</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'24px',color:'#F0F0F0',marginBottom:'12px'}}>Your other life continues</div>
          <div style={{color:'rgba(240,240,240,0.6)',fontSize:'15px',lineHeight:1.7,marginBottom:'32px',maxWidth:'400px',margin:'0 auto 32px'}}>See how the next decade unfolded — your career, your relationships, where you ended up living, who you became.</div>
          <a href="/pricing" style={{display:'inline-block',background:'linear-gradient(135deg,#1a3a6b,#4A9EFF)',color:'white',textDecoration:'none',padding:'16px 40px',borderRadius:'4px',fontSize:'16px',fontFamily:'Georgia,serif',letterSpacing:'1px'}}>Unlock with Legend — $10/mo</a>
          <div style={{marginTop:'16px',color:'rgba(240,240,240,0.4)',fontSize:'13px'}}>Full life simulation to old age with <a href="/pricing" style={{color:'#D4A843'}}>Immortal — $20/mo</a></div>
        </div>
      )}

      {(userTier === 'legend' || userTier === 'immortal') && (
        <>
          <div style={{...sectionStyle,animationDelay:'0.3s'}}>
            <div style={yearStyle}>THE FORMATIVE YEARS</div>
            <p style={narrativeStyle}>{sim.formativeYears}</p>
          </div>

          <TurningPoint tp={sim.turningPoint1} choice={tp1Choice} setChoice={setTp1Choice} number={1} />

          <div style={{...sectionStyle,animationDelay:'0.4s'}}>
            <div style={yearStyle}>THE MIDDLE YEARS</div>
            <p style={narrativeStyle}>{sim.middleYears}</p>
          </div>

          <TurningPoint tp={sim.turningPoint2} choice={tp2Choice} setChoice={setTp2Choice} number={2} />
        </>
      )}

      {userTier === 'immortal' && (
        <>
          <div style={{...sectionStyle,animationDelay:'0.5s'}}>
            <div style={yearStyle}>THE LATER YEARS</div>
            <p style={narrativeStyle}>{sim.laterYears}</p>
          </div>

          <TurningPoint tp={sim.turningPoint3} choice={tp3Choice} setChoice={setTp3Choice} number={3} />

          <div style={{...sectionStyle,animationDelay:'0.6s'}}>
            <div style={yearStyle}>OLD AGE AND LEGACY</div>
            <p style={narrativeStyle}>{sim.oldAge}</p>
          </div>
        </>
      )}

      {(userTier === 'legend' || userTier === 'immortal') && (
        <>
          <div style={{...sectionStyle,animationDelay:'0.5s'}}>
            <div style={{color:'#4A9EFF',fontSize:'12px',letterSpacing:'3px',marginBottom:'24px'}}>SIDE BY SIDE — YOUR TWO LIVES</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0'}}>
              <div style={{color:'rgba(240,240,240,0.4)',fontSize:'11px',letterSpacing:'2px',padding:'8px 16px',borderBottom:'1px solid rgba(74,158,255,0.2)'}}>YOUR REAL LIFE</div>
              <div style={{color:'#4A9EFF',fontSize:'11px',letterSpacing:'2px',padding:'8px 16px',borderBottom:'1px solid rgba(74,158,255,0.2)',borderLeft:'1px solid rgba(74,158,255,0.2)'}}>YOUR OTHER LIFE</div>
              {sim.sideBySide?.map((row: any, i: number) => (
                <>
                  <div key={`r${i}`} style={{padding:'16px',borderBottom:'1px solid rgba(255,255,255,0.05)',animation:`slideRight 0.5s ease ${i*0.15}s both`}}>
                    <div style={{color:'rgba(240,240,240,0.4)',fontSize:'10px',letterSpacing:'2px',marginBottom:'4px'}}>AGE {row.age} · {row.category}</div>
                    <div style={{fontFamily:'Georgia,serif',fontSize:'14px',lineHeight:1.6,color:'rgba(240,240,240,0.7)'}}>{row.realLife}</div>
                  </div>
                  <div key={`a${i}`} style={{padding:'16px',borderBottom:'1px solid rgba(255,255,255,0.05)',borderLeft:'1px solid rgba(74,158,255,0.2)',animation:`slideLeft 0.5s ease ${i*0.15}s both`}}>
                    <div style={{color:'#4A9EFF',fontSize:'10px',letterSpacing:'2px',marginBottom:'4px'}}>AGE {row.age} · {row.category}</div>
                    <div style={{fontFamily:'Georgia,serif',fontSize:'14px',lineHeight:1.6,color:'rgba(240,240,240,0.88)'}}>{row.alternateLife}</div>
                  </div>
                </>
              ))}
            </div>
          </div>

          <div style={{...sectionStyle,animationDelay:'0.6s'}}>
            <div style={{color:'#4A9EFF',fontSize:'12px',letterSpacing:'3px',marginBottom:'24px'}}>THE CHAIN REACTION</div>
            <div style={{position:'relative',paddingLeft:'24px'}}>
              <svg style={{position:'absolute',left:0,top:0,height:'100%',width:'20px'}} viewBox="0 0 20 400" preserveAspectRatio="none">
                <line x1="10" y1="0" x2="10" y2="400" stroke="rgba(74,158,255,0.3)" strokeWidth="1" strokeDasharray="1000" strokeDashoffset="1000" style={{animation:'drawLine 2s ease 0.5s forwards'}}/>
              </svg>
              {sim.butterflyChain?.map((item: string, i: number) => (
                <div key={i} style={{display:'flex',gap:'12px',marginBottom:'20px',animation:`slideRight 0.5s ease ${i*0.2}s both`}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4A9EFF',flexShrink:0,marginTop:'6px'}}/>
                  <div style={{fontFamily:'Georgia,serif',fontSize:'15px',lineHeight:1.6,color:'rgba(240,240,240,0.8)'}}>{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{...sectionStyle,animationDelay:'0.7s'}}>
            <div style={{color:'#4A9EFF',fontSize:'12px',letterSpacing:'3px',marginBottom:'24px'}}>5 BIGGEST DIFFERENCES</div>
            {sim.keyDifferences?.map((diff: string, i: number) => (
              <div key={i} style={{display:'flex',gap:'16px',marginBottom:'16px',animation:`slideRight 0.5s ease ${i*0.15}s both`}}>
                <div style={{color:'#4A9EFF',fontFamily:'Georgia,serif',fontSize:'20px',minWidth:'24px'}}>{i+1}.</div>
                <div style={{fontFamily:'Georgia,serif',fontSize:'16px',lineHeight:1.6,color:'rgba(240,240,240,0.85)'}}>{diff}</div>
              </div>
            ))}
          </div>

          <div style={{...sectionStyle,animationDelay:'0.8s',textAlign:'center' as const}}>
            <div style={{color:'#4A9EFF',fontSize:'12px',letterSpacing:'3px',marginBottom:'24px'}}>REGRET SCORE</div>
            <svg width="130" height="130" style={{margin:'0 auto 16px',display:'block'}}>
              <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
              <circle cx="65" cy="65" r="54" fill="none" stroke={regretColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDash} transform="rotate(-90 65 65)" style={{transition:'stroke-dashoffset 0.1s'}}/>
              <text x="65" y="65" textAnchor="middle" dominantBaseline="middle" fill={regretColor} fontSize="24" fontWeight="bold" fontFamily="Georgia,serif">{regretAnimated}</text>
            </svg>
            <div style={{color:'rgba(240,240,240,0.5)',fontSize:'13px',maxWidth:'400px',margin:'0 auto',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.7}}>How much your alternate self would miss the life they never lived</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:'15px',lineHeight:1.7,color:'rgba(240,240,240,0.7)',maxWidth:'500px',margin:'16px auto 0'}}>{sim.regretExplanation}</div>
          </div>
        </>
      )}

      {userTier === 'immortal' && (
        <>
          {(userTier === 'legend' || userTier === 'immortal') && (
            <div style={{...sectionStyle,border:'1px solid rgba(74,158,255,0.4)',animation:'glow 3s infinite',animationDelay:'0.9s'}}>
              <div style={{color:'#4A9EFF',fontSize:'12px',letterSpacing:'3px',marginBottom:'8px',textAlign:'center' as const}}>A MESSAGE FROM THE OTHER YOU</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:'18px',lineHeight:1.9,color:'rgba(240,240,240,0.92)',fontStyle:'italic',textAlign:'center' as const,padding:'16px 0'}}>
                {words.slice(0, visibleWords).map((word: string, i: number) => (
                  <span key={i} style={{display:'inline-block',marginRight:'4px',animation:'wordFade 0.3s ease both'}}>{word}</span>
                ))}
              </div>
              <div style={{textAlign:'center' as const,marginTop:'24px'}}>
                <button onClick={() => navigator.clipboard?.writeText(sim.messageFromOtherSelf)} style={{background:'transparent',border:'1px solid rgba(74,158,255,0.3)',color:'#4A9EFF',padding:'10px 24px',cursor:'pointer',borderRadius:'4px',fontSize:'13px',letterSpacing:'1px'}}>COPY THIS MESSAGE</button>
              </div>
            </div>
          )}

          {userTier === 'legend' && (
            <div style={{...sectionStyle,textAlign:'center' as const,borderColor:'rgba(212,168,67,0.3)'}}>
              <div style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#F0F0F0',marginBottom:'12px'}}>The most profound years are ahead</div>
              <div style={{color:'rgba(240,240,240,0.6)',fontSize:'14px',lineHeight:1.7,marginBottom:'24px',maxWidth:'400px',margin:'0 auto 24px'}}>Your later life, your legacy, and a message from the other version of yourself.</div>
              <a href="/pricing" style={{display:'inline-block',background:'linear-gradient(135deg,#6b4a1a,#D4A843)',color:'#0D1117',textDecoration:'none',padding:'14px 32px',borderRadius:'4px',fontSize:'15px',fontFamily:'Georgia,serif'}}>Upgrade to Immortal — $20/mo</a>
            </div>
          )}
        </>
      )}

      <div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'48px',flexWrap:'wrap' as const}}>
        <button onClick={onReset} style={{background:'transparent',border:'1px solid rgba(74,158,255,0.3)',color:'#4A9EFF',padding:'14px 28px',cursor:'pointer',borderRadius:'4px',fontSize:'14px',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(74,158,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>EXPLORE ANOTHER DECISION</button>
        <button onClick={onNewProfile} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(240,240,240,0.6)',padding:'14px 28px',cursor:'pointer',borderRadius:'4px',fontSize:'14px',transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}>BUILD A NEW PROFILE</button>
      </div>
    </div>
  )
}

function TurningPoint({ tp, choice, setChoice, number }: any) {
  return (
    <div style={{background:'rgba(74,158,255,0.03)',border:'1px solid rgba(74,158,255,0.25)',borderRadius:'8px',padding:'28px',marginBottom:'24px',animation:'fadeUp 0.8s ease both'}}>
      <div style={{color:'#4A9EFF',fontSize:'11px',letterSpacing:'3px',marginBottom:'12px'}}>TURNING POINT {number}</div>
      <p style={{fontFamily:'Georgia,serif',fontSize:'16px',lineHeight:1.7,color:'rgba(240,240,240,0.85)',marginBottom:'20px'}}>{tp?.situation}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
        {['A','B'].map(opt => (
          <button key={opt} onClick={() => setChoice(opt)} style={{background:choice===opt?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.03)',border:`1px solid ${choice===opt?'#4A9EFF':'rgba(255,255,255,0.1)'}`,color:choice===opt?'#4A9EFF':'rgba(240,240,240,0.7)',padding:'16px',cursor:'pointer',borderRadius:'4px',textAlign:'left' as const,fontFamily:'Georgia,serif',fontSize:'14px',lineHeight:1.5,transition:'all 0.2s'}}>
            {opt === 'A' ? tp?.choiceA : tp?.choiceB}
          </button>
        ))}
      </div>
    </div>
  )
}
