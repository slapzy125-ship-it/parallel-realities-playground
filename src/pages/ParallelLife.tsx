import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import AnimatedSection from "@/components/AnimatedSection";
import GlowButton from "@/components/GlowButton";
import MagneticCard from "@/components/MagneticCard";

// ─────────────────────────────────────────────────────────────────────
// PARALLEL LIFE — a documentary-style alternate-timeline simulator.
// Self-contained on purpose. No game UI. No stats. No choices.
// ─────────────────────────────────────────────────────────────────────

const BG = "#0A0A0C";
const TEXT = "#F0F0F0";
const MUTED = "#8A7A5A";
const ACCENT = "#D4A843";
const CARD = "#16141A";
const BORDER = "#2A281E";
const SERIF = `'Cormorant Garamond', 'Source Serif Pro', Georgia, 'Times New Roman', serif`;
const SANS = `-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif`;

const STORAGE_KEY = "revenio_parallel_profile";

type Profile = {
  // Step 1
  firstName: string;
  age: string;
  grewUp: string;
  livesNow: string;
  familyBackground: string;
  birthOrder: string;
  finances: string;
  threeWords: string;
  strength: string;
  weakness: string;
  // Step 2
  relStatus: string;
  partnerName: string;
  partnerDuration: string;
  howMet: string;
  closestFriend: string;
  shaper: string;
  parentRel: string;
  endedRelationship: string;
  // Step 3
  highSchool: string;
  wentToCollege: string;
  collegeWhere: string;
  collegeStudy: string;
  collegeWhy: string;
  otherSchools: string;
  careerPath: string;
  currentRole: string;
  industry: string;
  income: string;
  onTrack: string;
  // Step 4
  ownRent: string;
  livingSituation: string;
  hasChildren: string;
  childrenDetail: string;
  socialCircle: string;
  physicalHealth: string;
  mentalHealth: string;
  typicalWeek: string;
  proudest: string;
  regret: string;
  // Step 5
  decision: string;
  decisionWhen: string;
  decisionWhy: string;
  alternative: string;
  whyNot: string;
  hypothesis: string;
  wantToKnow: string;
};

const EMPTY: Profile = {
  firstName: "", age: "", grewUp: "", livesNow: "",
  familyBackground: "", birthOrder: "", finances: "",
  threeWords: "", strength: "", weakness: "",
  relStatus: "", partnerName: "", partnerDuration: "", howMet: "",
  closestFriend: "", shaper: "", parentRel: "", endedRelationship: "",
  highSchool: "", wentToCollege: "", collegeWhere: "", collegeStudy: "",
  collegeWhy: "", otherSchools: "", careerPath: "", currentRole: "",
  industry: "", income: "", onTrack: "",
  ownRent: "", livingSituation: "", hasChildren: "", childrenDetail: "",
  socialCircle: "", physicalHealth: "", mentalHealth: "",
  typicalWeek: "", proudest: "", regret: "",
  decision: "", decisionWhen: "", decisionWhy: "",
  alternative: "", whyNot: "", hypothesis: "", wantToKnow: "",
};

type Simulation = {
  immediateAftermath: string;
  firstYear: string;
  formativeYears: string;
  middleYears: string;
  laterYears: string;
  finalChapter: string;
  messageToRealSelf: string;
  keyDifferences: string[];
  overallJudgment: string;
};

// ───────────────── primitives ─────────────────

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontFamily: SANS, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>
        {children}
      </div>
      {hint && (
        <div style={{ fontFamily: SERIF, fontSize: 14, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{hint}</div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${BORDER}`,
  color: TEXT,
  fontFamily: SANS,
  fontSize: 16,
  padding: "10px 0",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  borderBottom: `1px solid ${BORDER}`,
  border: `1px solid ${BORDER}`,
  borderRadius: 4,
  padding: 12,
  minHeight: 100,
  resize: "vertical",
  fontFamily: SERIF,
  fontSize: 16,
  lineHeight: 1.6,
};

function Field({
  label, hint, value, onChange, placeholder, type = "text",
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Label hint={hint}>{label}</Label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function TextareaField({
  label, hint, value, onChange, placeholder, big,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; big?: boolean;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Label hint={hint}>{label}</Label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...textareaStyle, minHeight: big ? 160 : 100, fontSize: big ? 18 : 16 }}
      />
    </div>
  );
}

function SelectField({
  label, hint, value, onChange, options,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; options: string[];
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Label hint={hint}>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, appearance: "none", paddingRight: 24 }}
      >
        <option value="" style={{ background: BG }}>Select…</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: BG }}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ───────────────── main ─────────────────

export default function ParallelLife() {
  const { tier, userId, isLoading: subLoading } = useSubscription();
  const [stage, setStage] = useState<"profile" | "review" | "loading" | "output">("profile");
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [sim, setSim] = useState<Simulation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // resume
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.firstName) {
          setResumeAvailable(true);
        }
      }
    } catch {}
  }, []);

  // persist as user fills
  useEffect(() => {
    if (profile.firstName) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
    }
  }, [profile]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const loadResume = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
    setResumeAvailable(false);
  };

  const dismissResume = () => setResumeAvailable(false);

  // ───── auth gate ─────
  if (subLoading) {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }
  if (!userId) {
    return (
      <CenteredMessage>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: TEXT, marginBottom: 16 }}>
          Sign in to see the life you didn't live.
        </div>
        <Link
          to="/auth"
          style={{
            display: "inline-block",
            background: ACCENT, color: BG,
            padding: "12px 28px", fontFamily: SANS, fontSize: 13,
            letterSpacing: 2, textTransform: "uppercase", textDecoration: "none",
            borderRadius: 2,
          }}
        >
          Sign In
        </Link>
      </CenteredMessage>
    );
  }

  // ───── render by stage ─────
  return (
    <div style={{ background: BG, color: TEXT, minHeight: "calc(100vh - 72px)", fontFamily: SANS }}>
      {resumeAvailable && stage === "profile" && (
        <div style={{
          maxWidth: 720, margin: "32px auto 0", padding: 16,
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4,
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
        }}>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: TEXT }}>
            You have a profile saved from before. Continue where you left off?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={loadResume} style={primaryBtn}>Resume</button>
            <button onClick={dismissResume} style={ghostBtn}>Start fresh</button>
          </div>
        </div>
      )}

      {stage === "profile" && (
        <ProfileForm
          step={step} setStep={setStep} profile={profile} set={set}
          onComplete={() => setStage("review")}
        />
      )}

      {stage === "review" && (
        <Review
          profile={profile}
          onBack={() => setStage("profile")}
          onRun={async () => {
            setStage("loading");
            setError(null);
            try {
              const result = await runSimulation(profile);
              setSim(result);
              setStage("output");
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (e: any) {
              setError(e?.message || "Something went wrong. Please try again.");
              setStage("review");
            }
          }}
        />
      )}

      {stage === "loading" && <Loading firstName={profile.firstName} />}

      {stage === "output" && sim && (
        <Output
          sim={sim}
          profile={profile}
          tier={tier}
          onExploreAnotherDecision={() => {
            setSim(null);
            setStage("profile");
            setStep(5);
          }}
          onNewProfile={() => {
            try { localStorage.removeItem(STORAGE_KEY); } catch {}
            setProfile(EMPTY);
            setSim(null);
            setStep(1);
            setStage("profile");
          }}
        />
      )}

      {error && (
        <div style={{
          maxWidth: 720, margin: "16px auto", padding: 12,
          background: "#3a1a1a", color: "#ffb3b3", border: "1px solid #5a2a2a",
          fontFamily: SANS, fontSize: 14, borderRadius: 4,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ───────────────── profile form ─────────────────

function ProfileForm({
  step, setStep, profile, set, onComplete,
}: {
  step: number;
  setStep: (n: number) => void;
  profile: Profile;
  set: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  onComplete: () => void;
}) {
  const totalSteps = 5;
  const stepValid = useMemo(() => {
    if (step === 1) return !!(profile.firstName && profile.age && profile.grewUp && profile.livesNow);
    if (step === 5) return !!(profile.decision && profile.alternative);
    return true;
  }, [step, profile]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 96px" }}>
      <Progress step={step} total={totalSteps} />

      {step === 1 && (
        <Step title="Tell us who you are"
          intro="These are the basics the simulation builds on — your real life as the starting point.">
          <Field label="First name" value={profile.firstName} onChange={(v) => set("firstName", v)} />
          <Field label="Current age" type="number" value={profile.age} onChange={(v) => set("age", v)} />
          <Field label="Where you grew up" placeholder="City, Country" value={profile.grewUp} onChange={(v) => set("grewUp", v)} />
          <Field label="Where you live now" placeholder="City, Country" value={profile.livesNow} onChange={(v) => set("livesNow", v)} />
          <SelectField label="Family background growing up" value={profile.familyBackground} onChange={(v) => set("familyBackground", v)}
            options={["Both parents together","Parents divorced when young","Single parent household","Raised by grandparents or other family","Moved around a lot"]} />
          <SelectField label="Birth order" value={profile.birthOrder} onChange={(v) => set("birthOrder", v)}
            options={["Only child","Oldest sibling","Middle sibling","Youngest sibling"]} />
          <SelectField label="Family's financial situation growing up" value={profile.finances} onChange={(v) => set("finances", v)}
            options={["Struggled financially","Working class comfortable","Middle class","Upper middle class","Wealthy"]} />
          <Field label="Three words people who know you best would use" value={profile.threeWords} onChange={(v) => set("threeWords", v)} />
          <Field label="Your greatest strength" value={profile.strength} onChange={(v) => set("strength", v)} />
          <Field label="Your greatest weakness — the thing you struggle with most" value={profile.weakness} onChange={(v) => set("weakness", v)} />
        </Step>
      )}

      {step === 2 && (
        <Step title="The people in your life"
          intro="Love, family, friendship — the relationships that bend the trajectory of who we become.">
          <SelectField label="Current relationship status" value={profile.relStatus} onChange={(v) => set("relStatus", v)}
            options={["Single","In a relationship","Engaged","Married","Divorced","Widowed","It is complicated"]} />
          <Field label="Partner's name (optional)" value={profile.partnerName} onChange={(v) => set("partnerName", v)} />
          <Field label="How long together (optional)" value={profile.partnerDuration} onChange={(v) => set("partnerDuration", v)} />
          <TextareaField label="How did you meet your partner or most significant relationship" value={profile.howMet} onChange={(v) => set("howMet", v)} />
          <TextareaField label="Your closest friend — name and one sentence about them" value={profile.closestFriend} onChange={(v) => set("closestFriend", v)} />
          <TextareaField label="One person who shaped who you are more than anyone else" hint="Name and how." value={profile.shaper} onChange={(v) => set("shaper", v)} />
          <SelectField label="Your relationship with your parents now" value={profile.parentRel} onChange={(v) => set("parentRel", v)}
            options={["Very close","Good","Distant but okay","Complicated or strained","One or both have passed away"]} />
          <TextareaField label="A relationship that ended and left a mark on you (optional)" value={profile.endedRelationship} onChange={(v) => set("endedRelationship", v)} />
        </Step>
      )}

      {step === 3 && (
        <Step title="What you spend your time on"
          intro="School, work, a hobby, or nothing yet — whatever fills your days right now. Everything on this page is optional.">
          <TextareaField label="High school (optional)" hint="Name or describe it, and one thing you were known for there." value={profile.highSchool} onChange={(v) => set("highSchool", v)} />
          <SelectField label="Have you been to college or university? (optional)" value={profile.wentToCollege} onChange={(v) => set("wentToCollege", v)} options={["Yes","No","Still in high school","Plan to","Don't plan to"]} />
          {profile.wentToCollege === "Yes" && (
            <>
              <Field label="Where you went (optional)" value={profile.collegeWhere} onChange={(v) => set("collegeWhere", v)} />
              <Field label="What you studied (optional)" value={profile.collegeStudy} onChange={(v) => set("collegeStudy", v)} />
              <TextareaField label="Why you chose it (optional)" value={profile.collegeWhy} onChange={(v) => set("collegeWhy", v)} />
            </>
          )}
          <TextareaField label="Other schools you got into but didn't attend (optional)" value={profile.otherSchools} onChange={(v) => set("otherSchools", v)} />
          <TextareaField label="What do you spend most of your time on?" hint="This could be school, work, a hobby, sports, caregiving, gaming, music — or nothing in particular yet. Just be honest." big value={profile.careerPath} onChange={(v) => set("careerPath", v)} />
          <Field label="If you have a job or role, what is it? (optional)" placeholder="Student, barista, intern, software engineer, none yet…" value={profile.currentRole} onChange={(v) => set("currentRole", v)} />
          <Field label="Industry, field, or main interest (optional)" value={profile.industry} onChange={(v) => set("industry", v)} />
          <SelectField label="Income range (optional)" value={profile.income} onChange={(v) => set("income", v)}
            options={["No income yet","Under 30k","30k to 60k","60k to 100k","100k to 150k","150k to 250k","250k plus","Prefer not to say"]} />
          <SelectField label="Are you where you thought you'd be at this age? (optional)" value={profile.onTrack} onChange={(v) => set("onTrack", v)}
            options={["Yes","No","Not sure","Too early to tell"]} />
        </Step>
      )}

      {step === 4 && (
        <Step title="Where your life has taken you"
          intro="The shape of your days right now — home, health, the people around you.">
          <SelectField label="Do you own or rent your home" value={profile.ownRent} onChange={(v) => set("ownRent", v)}
            options={["Own","Rent","Live with family","Other"]} />
          <Field label="What does your living situation look like" placeholder="Apartment in a city, house in suburbs, rural property…" value={profile.livingSituation} onChange={(v) => set("livingSituation", v)} />
          <SelectField label="Do you have children" value={profile.hasChildren} onChange={(v) => set("hasChildren", v)}
            options={["Yes","No","Not yet"]} />
          {profile.hasChildren === "Yes" && (
            <Field label="How many and rough ages" value={profile.childrenDetail} onChange={(v) => set("childrenDetail", v)} />
          )}
          <SelectField label="Close friends nearby, or mostly distant from your circle?" value={profile.socialCircle} onChange={(v) => set("socialCircle", v)}
            options={["Close friends nearby","Some friends nearby","Mostly distant","Almost no one nearby"]} />
          <SelectField label="Physical health generally" value={profile.physicalHealth} onChange={(v) => set("physicalHealth", v)}
            options={["Very healthy","Pretty good","Some issues","Dealing with something significant"]} />
          <SelectField label="Mental health generally" value={profile.mentalHealth} onChange={(v) => set("mentalHealth", v)}
            options={["Thriving","Mostly good","Some struggles","Difficult period"]} />
          <TextareaField label="What does a typical week look like for you" big value={profile.typicalWeek} onChange={(v) => set("typicalWeek", v)} />
          <TextareaField label="What are you most proud of in your life so far" big value={profile.proudest} onChange={(v) => set("proudest", v)} />
          <TextareaField label="What do you most regret, or wonder about" big value={profile.regret} onChange={(v) => set("regret", v)} />
        </Step>
      )}

      {step === 5 && (
        <Step title="The decision that changed everything"
          intro="This is the hinge. The moment the simulation will rewrite."
          emphasis>
          <TextareaField
            label="The decision"
            hint="Describe it in as much detail as possible. The more specific, the more truthful the alternate timeline becomes."
            placeholder="For example — I chose to go to Miami of Ohio instead of Elon University. I chose it because the scholarship was better and it was closer to home. I have always wondered what would have happened if I had taken the risk and gone to Elon."
            value={profile.decision}
            onChange={(v) => set("decision", v)}
            big
          />
          <Field label="When did you make this decision" placeholder="Age or year" value={profile.decisionWhen} onChange={(v) => set("decisionWhen", v)} />
          <TextareaField label="Why did you make the choice you made" value={profile.decisionWhy} onChange={(v) => set("decisionWhy", v)} />
          <Field label="The alternative you did not take" value={profile.alternative} onChange={(v) => set("alternative", v)} />
          <TextareaField label="Why didn't you take it" value={profile.whyNot} onChange={(v) => set("whyNot", v)} />
          <TextareaField label="What do you think would have been different" hint="Your hypothesis. The simulation will surprise you." value={profile.hypothesis} onChange={(v) => set("hypothesis", v)} />
          <TextareaField label="What do you most want to know about the alternate timeline" placeholder="Would I have met my partner? Would I have more money? Would I be happier?" value={profile.wantToKnow} onChange={(v) => set("wantToKnow", v)} />
        </Step>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          style={{ ...ghostBtn, opacity: step === 1 ? 0.3 : 1 }}
        >Back</button>
        {step < totalSteps ? (
          <button
            onClick={() => stepValid && setStep(step + 1)}
            disabled={!stepValid}
            style={{ ...primaryBtn, opacity: stepValid ? 1 : 0.4 }}
          >Continue</button>
        ) : (
          <button
            onClick={() => stepValid && onComplete()}
            disabled={!stepValid}
            style={{ ...primaryBtn, opacity: stepValid ? 1 : 0.4 }}
          >Review</button>
        )}
      </div>
    </div>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        fontFamily: SANS, fontSize: 11, letterSpacing: 3, textTransform: "uppercase",
        color: MUTED, marginBottom: 12,
      }}>
        Step {step} of {total}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2,
            background: i < step ? ACCENT : BORDER,
            transition: "background 0.3s",
          }} />
        ))}
      </div>
    </div>
  );
}

function Step({
  title, intro, children, emphasis,
}: {
  title: string; intro: string; children: React.ReactNode; emphasis?: boolean;
}) {
  return (
    <div>
      <h1 style={{
        fontFamily: SERIF, color: TEXT,
        fontSize: emphasis ? 48 : 36, fontWeight: 400,
        margin: "0 0 12px", lineHeight: 1.1,
      }}>{title}</h1>
      <p style={{
        fontFamily: SERIF, color: MUTED,
        fontSize: emphasis ? 20 : 17, fontStyle: "italic",
        marginBottom: emphasis ? 48 : 36, lineHeight: 1.5,
      }}>{intro}</p>
      <div>{children}</div>
    </div>
  );
}

// ───────────────── review ─────────────────

function Review({
  profile, onBack, onRun,
}: { profile: Profile; onBack: () => void; onRun: () => void }) {
  const rows: Array<[string, string]> = [
    ["Name", profile.firstName],
    ["Age", profile.age],
    ["Grew up", profile.grewUp],
    ["Lives in", profile.livesNow],
    ["Relationship", profile.relStatus + (profile.partnerName ? ` (${profile.partnerName})` : "")],
    ["Work", `${profile.currentRole}${profile.industry ? ", " + profile.industry : ""}`],
    ["The decision", profile.decision],
    ["The alternative", profile.alternative],
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 96px" }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, margin: "0 0 12px" }}>
        Ready, {profile.firstName}?
      </h1>
      <p style={{ fontFamily: SERIF, fontSize: 18, color: MUTED, fontStyle: "italic", marginBottom: 40, lineHeight: 1.6 }}>
        Here's the life we're working from. The simulation begins where the decision is made.
      </p>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: 28, borderRadius: 4, marginBottom: 40 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontFamily: SERIF, fontSize: 17, color: TEXT, lineHeight: 1.5 }}>{v || "—"}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <GlowButton onClick={onRun} gold={true} style={{ fontSize: 14, padding: "18px 42px" }}>
          Run the Simulation
        </GlowButton>
        <div style={{ fontFamily: SERIF, fontSize: 14, color: MUTED, fontStyle: "italic", marginTop: 16, lineHeight: 1.6, maxWidth: 480, margin: "16px auto 0" }}>
          The simulation will take your real life as its starting point and show you in detail how that one different decision would have rippled through every part of your existence.
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={onBack} style={ghostBtn}>Go back and edit</button>
        </div>
      </div>
    </div>
  );
}

// ───────────────── loading ─────────────────

function Loading({ firstName }: { firstName: string }) {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 32, color: TEXT, marginBottom: 16 }}>
        Composing your parallel life{dots}
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", color: MUTED, fontSize: 18, lineHeight: 1.6 }}>
        {firstName ? `${firstName}, this takes a moment.` : "This takes a moment."} We're tracing the
        threads from one decision through years of consequence.
      </div>
    </div>
  );
}

// ───────────────── output ─────────────────

function Output({
  sim, profile, tier, onExploreAnotherDecision, onNewProfile,
}: {
  sim: Simulation;
  profile: Profile;
  tier: "free" | "legend" | "immortal";
  onExploreAnotherDecision: () => void;
  onNewProfile: () => void;
}) {
  const isFree = tier === "free";
  const isLegend = tier === "legend";

  const decisionAge = parseInt(profile.decisionWhen, 10);
  const baseAge = isNaN(decisionAge) ? Math.max(0, parseInt(profile.age, 10) - 5 || 18) : decisionAge;

  const sections: Array<{ id: keyof Simulation | "paywall"; label: string; yearLabel: string; body: string }> = [
    { id: "immediateAftermath", label: "Immediately after", yearLabel: `Age ${baseAge}`, body: sim.immediateAftermath },
    { id: "firstYear", label: "The first year", yearLabel: `Age ${baseAge + 1}`, body: sim.firstYear },
    { id: "formativeYears", label: "The formative years", yearLabel: `Age ${baseAge + 1}–${baseAge + 5}`, body: sim.formativeYears },
    { id: "middleYears", label: "The middle years", yearLabel: `Age ${baseAge + 5}–${baseAge + 20}`, body: sim.middleYears },
    { id: "laterYears", label: "The later years", yearLabel: `Age ${baseAge + 20}–retirement`, body: sim.laterYears },
    { id: "finalChapter", label: "The final chapter", yearLabel: "Old age & legacy", body: sim.finalChapter },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 120px" }}>
      <HeaderCard profile={profile} judgment={sim.overallJudgment} />

      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 32, marginTop: 64 }}>
        {sections.map((s, idx) => {
          const isLocked =
            (isFree && idx >= 2) ||
            (isLegend && idx >= 4);

          // For free: show paywall right after firstYear (idx 1)
          // For legend: show paywall right after formativeYears (idx 3)
          const showPaywallAfter =
            (isFree && idx === 1) || (isLegend && idx === 3);

          if (isLocked) {
            // skip locked sections, paywall is rendered after the last visible one
            return null;
          }

          return (
            <TimelineRow
              key={s.id as string}
              yearLabel={s.yearLabel}
              title={s.label}
              body={s.body}
              showPaywallAfter={showPaywallAfter}
              paywallTier={isFree ? "free" : "legend"}
              delay={idx * 120}
            />
          );
        })}

        {/* Key differences + message — gated to immortal-visible only */}
        {!isFree && !isLegend && (
          <>
            <KeyDifferences differences={sim.keyDifferences} />
            <MessageFromOtherSelf
              firstName={profile.firstName}
              text={sim.messageToRealSelf}
            />
          </>
        )}
      </div>

      {/* Reset actions */}
      <div style={{
        marginTop: 64, paddingTop: 32, borderTop: `1px solid ${BORDER}`,
        display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
      }}>
        <button onClick={onExploreAnotherDecision} style={ghostBtn}>Explore another decision</button>
        <button onClick={onNewProfile} style={ghostBtn}>Build a new profile</button>
        <ShareButton profile={profile} judgment={sim.overallJudgment} />
      </div>
    </div>
  );
}

function HeaderCard({ profile, judgment }: { profile: Profile; judgment: string }) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 32 }}>
      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 4, color: ACCENT, textTransform: "uppercase", marginBottom: 16 }}>
        A Parallel Life
      </div>
      <h1 style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 400, margin: "0 0 24px", lineHeight: 1 }}>
        {profile.firstName}
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 6 }}>What you chose</div>
          <div style={{ fontFamily: SERIF, fontSize: 17, color: TEXT, lineHeight: 1.5 }}>{profile.decision}</div>
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase", marginBottom: 6 }}>What if you hadn't</div>
          <div style={{ fontFamily: SERIF, fontSize: 17, color: TEXT, lineHeight: 1.5 }}>{profile.alternative}</div>
        </div>
      </div>
      <div style={{
        fontFamily: SERIF, fontSize: 22, fontStyle: "italic", color: TEXT,
        lineHeight: 1.5, paddingTop: 16, borderTop: `1px solid ${BORDER}`,
      }}>
        {judgment}
      </div>
    </div>
  );
}

function TimelineRow({
  yearLabel, title, body, showPaywallAfter, paywallTier, delay = 0,
}: {
  yearLabel: string;
  title: string;
  body: string;
  showPaywallAfter: boolean;
  paywallTier: "free" | "legend";
  delay?: number;
}) {
  return (
    <>
      <div style={{ paddingTop: 8 }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, letterSpacing: 2, color: ACCENT,
          textTransform: "uppercase", position: "sticky", top: 88,
        }}>{yearLabel}</div>
      </div>
      <AnimatedSection delay={delay} direction="up">
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, margin: "0 0 20px", color: TEXT, lineHeight: 1.2 }}>
            {title}
          </h2>
          <Narrative text={body} />
          {showPaywallAfter && (
            <div style={{ marginTop: 40 }}>
              {paywallTier === "free" ? <FreePaywall /> : <LegendPaywall />}
            </div>
          )}
        </div>
      </AnimatedSection>
    </>
  );
}

function Narrative({ text }: { text: string }) {
  // pull the first sentence out as a highlighted quote for visual rhythm
  const trimmed = (text || "").trim();
  const split = trimmed.split(/(?<=[.!?])\s+/);
  const quote = split[0] || "";
  const rest = split.slice(1).join(" ");
  return (
    <div>
      {quote && (
        <div style={{
          background: "#141208", borderLeft: `2px solid ${ACCENT}`,
          padding: "14px 20px", marginBottom: 20, borderRadius: 2,
          fontFamily: SERIF, fontSize: 22, fontStyle: "italic", color: TEXT, lineHeight: 1.4,
        }}>
          {quote}
        </div>
      )}
      {rest && (
        <p style={{ fontFamily: SERIF, fontSize: 19, color: TEXT, lineHeight: 1.7, margin: 0 }}>
          {rest}
        </p>
      )}
    </div>
  );
}

function KeyDifferences({ differences }: { differences: string[] }) {
  return (
    <>
      <div style={{ paddingTop: 8 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}>
          The contrasts
        </div>
      </div>
      <div>
        <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, margin: "0 0 20px", color: TEXT }}>
          Key differences
        </h2>
        <ol style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {differences.map((d, i) => (
            <li key={i} style={{
              fontFamily: SERIF, fontSize: 18, color: TEXT, lineHeight: 1.6,
              padding: "16px 0", borderBottom: i === differences.length - 1 ? "none" : `1px solid ${BORDER}`,
              display: "flex", gap: 16,
            }}>
              <span style={{ color: ACCENT, fontFamily: SANS, fontSize: 14, fontWeight: 600, minWidth: 24 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function MessageFromOtherSelf({ firstName, text }: { firstName: string; text: string }) {
  return (
    <>
      <div style={{ paddingTop: 8 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}>
          Across the multiverse
        </div>
      </div>
      <div style={{
        background: "linear-gradient(180deg, #1A1810, #0A0A0C)",
        border: `1px solid ${ACCENT}33`,
        padding: 40, borderRadius: 4, marginTop: 8,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 3, color: ACCENT, textTransform: "uppercase", marginBottom: 16 }}>
          A message for {firstName}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 22, fontStyle: "italic", color: TEXT, lineHeight: 1.6 }}>
          {text}
        </div>
      </div>
    </>
  );
}

// ───────────────── paywalls ─────────────────

function FreePaywall() {
  return (
    <div style={paywallStyle}>
      <h3 style={{ fontFamily: SERIF, fontSize: 32, color: TEXT, margin: "0 0 12px", fontWeight: 400 }}>
        Your parallel life continues
      </h3>
      <p style={{ fontFamily: SERIF, fontSize: 18, color: MUTED, fontStyle: "italic", margin: "0 0 24px", lineHeight: 1.6 }}>
        See how the next 10 years unfolded — your career, your relationships, where you ended up living, who you became.
      </p>
      <Link to="/pricing" style={primaryLink}>Unlock with Legend — $10/month</Link>
      <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 16 }}>
        Or unlock everything — your full life to old age — with <Link to="/pricing" style={{ color: ACCENT }}>Immortal at $20/month</Link>.
      </div>
    </div>
  );
}

function LegendPaywall() {
  return (
    <div style={paywallStyle}>
      <h3 style={{ fontFamily: SERIF, fontSize: 32, color: TEXT, margin: "0 0 12px", fontWeight: 400 }}>
        Your story does not end here
      </h3>
      <p style={{ fontFamily: SERIF, fontSize: 18, color: MUTED, fontStyle: "italic", margin: "0 0 24px", lineHeight: 1.6 }}>
        The most profound changes happen in the years ahead. See your middle years, your later life, and receive a message from your other self.
      </p>
      <Link to="/pricing" style={primaryLink}>Upgrade to Immortal — $20/month</Link>
    </div>
  );
}

const paywallStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #1A1810, #0A0A0C)",
  border: `1px solid ${ACCENT}55`,
  borderRadius: 4,
  padding: 40,
  textAlign: "center",
};

// ───────────────── share ─────────────────

function ShareButton({ profile, judgment }: { profile: Profile; judgment: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `My parallel life — ${profile.firstName}\n\nWhat I chose: ${profile.decision}\nWhat if I hadn't: ${profile.alternative}\n\n${judgment}\n\nGenerate yours at revenio.net/parallel`;

    // Try generating a shareable image card on canvas
    try {
      const blob = await generateShareCard(profile.firstName, profile.decision, profile.alternative, judgment);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `parallel-life-${profile.firstName.toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button onClick={handleShare} style={{ ...primaryBtn, background: ACCENT, color: BG }}>
      {copied ? "Copied & downloaded ✓" : "Share your parallel life"}
    </button>
  );
}

async function generateShareCard(name: string, decision: string, alternative: string, judgment: string): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // bg
  ctx.fillStyle = "#0A0A0C";
  ctx.fillRect(0, 0, 1200, 630);

  // accent bar
  ctx.fillStyle = ACCENT;
  ctx.fillRect(80, 80, 4, 80);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 18px -apple-system, Inter, sans-serif";
  ctx.fillText("A PARALLEL LIFE", 110, 110);

  ctx.fillStyle = TEXT;
  ctx.font = "400 96px Georgia, serif";
  ctx.fillText(name, 110, 200);

  // judgment
  ctx.fillStyle = TEXT;
  ctx.font = "italic 28px Georgia, serif";
  wrapText(ctx, judgment, 110, 290, 1000, 40);

  // decision & alternative
  ctx.fillStyle = MUTED;
  ctx.font = "600 14px -apple-system, Inter, sans-serif";
  ctx.fillText("WHAT I CHOSE", 110, 460);
  ctx.fillStyle = TEXT;
  ctx.font = "400 20px Georgia, serif";
  wrapText(ctx, truncate(decision, 90), 110, 490, 480, 28);

  ctx.fillStyle = ACCENT;
  ctx.font = "600 14px -apple-system, Inter, sans-serif";
  ctx.fillText("WHAT IF I HADN'T", 620, 460);
  ctx.fillStyle = TEXT;
  ctx.font = "400 20px Georgia, serif";
  wrapText(ctx, truncate(alternative, 90), 620, 490, 480, 28);

  ctx.fillStyle = MUTED;
  ctx.font = "400 14px -apple-system, Inter, sans-serif";
  ctx.fillText("revenio.net/parallel", 110, 590);

  return await new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy);
      line = w + " ";
      yy += lineHeight;
    } else line = test;
  }
  if (line) ctx.fillText(line.trim(), x, yy);
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// ───────────────── AI call ─────────────────

async function runSimulation(profile: Profile): Promise<Simulation> {
  const system = `You are simulating an alternate life timeline for a real person based on one different decision they made. You have their complete life profile. Your job is to write a detailed, realistic, emotionally honest account of how their life would have unfolded differently.

RULES:
1. Use the person's real name throughout: ${profile.firstName}.
2. Reference real details from their profile constantly — their actual hometown (${profile.grewUp}), current city (${profile.livesNow}), partner (${profile.partnerName || "—"}), what they spend time on (${profile.currentRole || profile.careerPath || "—"}, ${profile.industry || "—"}), strengths (${profile.strength}), weaknesses (${profile.weakness}).
3. Be specific and surprising. Do not just confirm their hypothesis. Real life is complicated.
4. Show how things would have played out differently — in relationships, places they end up, opportunities, who they become. Be concrete, not abstract.
5. Reference real places, real industries, real career networks tied to their alternative path.
6. Be emotionally honest. The alternate life isn't simply better or worse — it's genuinely different.
7. Write in present tense, second person ("you did this, you felt this").
8. Each section: 150–250 words. Detailed and specific.
9. Reference their stated strengths and weaknesses and show how those traits played out differently.
10. The final messageToRealSelf must be genuinely moving — a message from a parallel version of ${profile.firstName} across the multiverse. True, not sentimental.

ALTERNATE TIMELINE RULE — CRITICAL:
Never mention specific people from the real life timeline who the player would not have met on the alternate path. If the player's decision changed their location, school, or job, assume they did not meet anyone they met after that decision point. Only reference people who existed in their life BEFORE the decision was made — family, childhood friends, anyone from before "${profile.decisionWhen || "the decision"}". Their current partner (${profile.partnerName || "—"}), current friends, and current coworkers most likely never appear in this timeline unless they would have crossed paths anyway. Invent new people for the alternate life. Be honest about who is missing.

LANGUAGE RULE — CRITICAL:
Write at a clear conversational reading level. Use simple direct language. Every sentence should describe something specific and concrete — a place, a person, an event, a feeling shown through action. Never use abstract language. No therapy speak. No words like "ripple effect," "trajectory," "seminal," "journey of self-discovery," "transformative," "manifest," "energy," "alignment." Write like a smart friend telling you a story over a beer. Short sentences. Concrete details. Real places, real feelings, real consequences shown through what actually happens — not described in the abstract.

RESPOND WITH ONLY THIS JSON — NO MARKDOWN, NO BACKTICKS:
{"immediateAftermath":"…","firstYear":"…","formativeYears":"…","middleYears":"…","laterYears":"…","finalChapter":"…","messageToRealSelf":"…","keyDifferences":["…","…","…","…","…"],"overallJudgment":"one sentence — broadly better, worse, or just different, and why"}`;

  const userMsg = `Here is ${profile.firstName}'s real-life profile.

WHO THEY ARE
- Name: ${profile.firstName}
- Age now: ${profile.age}
- Grew up: ${profile.grewUp}
- Lives now: ${profile.livesNow}
- Family background: ${profile.familyBackground}
- Birth order: ${profile.birthOrder}
- Family finances growing up: ${profile.finances}
- How others describe them: ${profile.threeWords}
- Greatest strength: ${profile.strength}
- Greatest weakness: ${profile.weakness}

PEOPLE
- Relationship status: ${profile.relStatus}
- Partner: ${profile.partnerName || "—"}${profile.partnerDuration ? ` (${profile.partnerDuration})` : ""}
- How they met: ${profile.howMet}
- Closest friend: ${profile.closestFriend}
- Most formative person: ${profile.shaper}
- Relationship with parents now: ${profile.parentRel}
- A relationship that ended: ${profile.endedRelationship || "—"}

EDUCATION & WORK
- High school: ${profile.highSchool}
- College: ${profile.wentToCollege === "Yes" ? `${profile.collegeWhere}, studied ${profile.collegeStudy} — chose because: ${profile.collegeWhy}` : "Did not attend"}
- Other schools they got into but didn't attend: ${profile.otherSchools}
- Career path: ${profile.careerPath}
- Current role: ${profile.currentRole} in ${profile.industry}
- Income: ${profile.income}
- On the track they expected? ${profile.onTrack}

LIFE NOW
- Living: ${profile.ownRent} — ${profile.livingSituation}
- Children: ${profile.hasChildren}${profile.childrenDetail ? ` — ${profile.childrenDetail}` : ""}
- Social circle: ${profile.socialCircle}
- Physical health: ${profile.physicalHealth}
- Mental health: ${profile.mentalHealth}
- Typical week: ${profile.typicalWeek}
- Most proud of: ${profile.proudest}
- Most regret / wonder about: ${profile.regret}

THE DECISION
- Decision made: ${profile.decision}
- When: ${profile.decisionWhen}
- Why made: ${profile.decisionWhy}
- The alternative not taken: ${profile.alternative}
- Why not taken: ${profile.whyNot}
- Their hypothesis about what would've changed: ${profile.hypothesis}
- What they most want to know: ${profile.wantToKnow}

Now generate ${profile.firstName}'s parallel life — the timeline where they took the alternative instead. Follow the rules. Return only the JSON.`;

  const { data, error } = await supabase.functions.invoke("ai-scene", {
    body: {
      worldId: "parallel",
      isOpening: true,
      system,
      messages: [{ role: "user", content: userMsg }],
    },
  });

  if (error) {
    const msg = (error as any)?.message || "";
    throw new Error(msg || "The simulation could not be generated. Please try again.");
  }
  if (data?.error) throw new Error(data.error);

  const raw = (data?.content || []).map((c: any) => c.text || "").join("");
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("The simulation returned an unreadable response. Please try again.");
  const parsed = JSON.parse(match[0]);

  return {
    immediateAftermath: parsed.immediateAftermath || "",
    firstYear: parsed.firstYear || "",
    formativeYears: parsed.formativeYears || "",
    middleYears: parsed.middleYears || "",
    laterYears: parsed.laterYears || "",
    finalChapter: parsed.finalChapter || "",
    messageToRealSelf: parsed.messageToRealSelf || "",
    keyDifferences: Array.isArray(parsed.keyDifferences) ? parsed.keyDifferences.slice(0, 5) : [],
    overallJudgment: parsed.overallJudgment || "",
  };
}

// ───────────────── shared bits ─────────────────

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "calc(100vh - 72px)", background: BG, color: TEXT,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center", fontFamily: SANS,
    }}>
      {children}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: ACCENT,
  color: BG,
  border: "none",
  padding: "12px 24px",
  fontFamily: SANS,
  fontSize: 12,
  letterSpacing: 2,
  textTransform: "uppercase",
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: 2,
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: TEXT,
  border: `1px solid ${BORDER}`,
  padding: "12px 24px",
  fontFamily: SANS,
  fontSize: 12,
  letterSpacing: 2,
  textTransform: "uppercase",
  cursor: "pointer",
  borderRadius: 2,
};

const primaryLink: React.CSSProperties = {
  display: "inline-block",
  background: ACCENT,
  color: BG,
  padding: "14px 28px",
  fontFamily: SANS,
  fontSize: 13,
  letterSpacing: 2,
  textTransform: "uppercase",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: 2,
};
