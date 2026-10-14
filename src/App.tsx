import { useCallback, useEffect, useRef, useState } from 'react';
import { personalityQuestions, prank, stages } from './config/prank';
import {
  advance,
  formatTime,
  freshSession,
  parseSession,
  progress,
  STORAGE_KEY,
  type Session,
} from './state';
import {
  Brand,
  Button,
  Check,
  Choices,
  Icon,
  Modal,
  Notice,
  Select,
  Timed,
} from './ui';
type Answers = Record<string, string>;
const params = new URLSearchParams(location.search);
const debug = params.get('debug') === '1';
const initial = () => {
  let s: Session;
  try {
    s = parseSession(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    s = freshSession();
  }
  if (debug && params.has('stage')) {
    const requested = params.get('stage');
    const n = stages.findIndex((x) => x[0] === requested);
    if (n >= 0) s = { ...s, stage: n };
  }
  return s;
};
const groups = [
  {
    name: 'Getting started',
    icon: 'user',
    start: 0,
    end: 2,
    detail: 'Your connection to AccessOne',
  },
  {
    name: 'Personal profile',
    icon: 'sliders',
    start: 3,
    end: 4,
    detail: 'A few essential preferences',
  },
  {
    name: 'Privacy & permissions',
    icon: 'shield',
    start: 5,
    end: 7,
    detail: 'Your choices, in your control',
  },
  {
    name: 'Verification',
    icon: 'lock',
    start: 8,
    end: 13,
    detail: 'A trusted starting point',
  },
  {
    name: 'Finalization',
    icon: 'spark',
    start: 14,
    end: 23,
    detail: 'Bring everything together',
  },
];
export default function App() {
  const [session, setSession] = useState(initial);
  const [answers, setAnswers] = useState<Answers>({});
  const [modal, setModal] = useState<
    'cancel' | 'help' | 'privacy' | 'status' | null
  >(null);
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [fast, setFast] = useState(debug && params.get('fast') === '1');
  const [mobile, setMobile] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const stage = session.stage;
  const definition = stages[stage];
  const currentGroup = groups.findIndex(
    (g) => stage >= g.start && stage <= g.end,
  );
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      setStorageError(true);
    }
  }, [session]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [stage]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4200);
    return () => clearTimeout(t);
  }, [toast]);
  const next = useCallback(() => setSession(advance), []);
  const answer = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setSession((s) => ({
      ...s,
      questionIds: [...new Set([...s.questionIds, id])],
    }));
  };
  const reset = () => {
    setSession(freshSession());
    setAnswers({});
    setModal(null);
    setToast('Local session data cleared.');
    history.replaceState(null, '', location.pathname);
  };
  const attemptProvider = (provider: string) =>
    setSession((s) => {
      const providers = [...new Set([...s.providers, provider])];
      return {
        ...s,
        providers,
        achievements:
          providers.length >= 5
            ? [...new Set([...s.achievements, 'providers'])]
            : s.achievements,
      };
    });
  return (
    <div
      className={mobile ? 'app mobile-preview' : 'app'}
      onClickCapture={(e) => {
        if (stage < 23 && (e.target as Element).closest('button'))
          setSession((s) => ({ ...s, clicks: s.clicks + 1 }));
      }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {stage === 23 ? (
        <Reveal session={session} reset={reset} toast={setToast} />
      ) : (
        <>
          <header className="header">
            <Brand />
            <div className="header-right">
              <span className="session-status">
                <span className="status-dot" />
                Private session
              </span>
              <span className="header-divider" />
              <button className="text-button" onClick={() => setModal('help')}>
                Need a hand? <Icon name="info" size={16} />
              </button>
            </div>
          </header>
          <div className="workspace">
            <aside className="sidebar">
              <div>
                <div className="eyebrow">PERSONAL ACCESS GATEWAY</div>
                <h2>A proper introduction.</h2>
                <p>
                  Let’s get everything in place
                  <br />
                  for your AccessOne experience.
                </p>
              </div>
              <ol className="step-list">
                {groups.map((g, i) => (
                  <li
                    className={
                      i === currentGroup
                        ? 'active'
                        : i < currentGroup
                          ? 'done'
                          : ''
                    }
                    key={g.name}
                  >
                    <span className="step-icon">
                      {i < currentGroup ? (
                        <Icon name="check" size={16} />
                      ) : (
                        <Icon name={g.icon} size={18} />
                      )}
                    </span>
                    <div>
                      <span className="step-number">0{i + 1}</span>
                      <strong>{g.name}</strong>
                      <small>{g.detail}</small>
                    </div>
                    {i === currentGroup && <span className="active-dot" />}
                  </li>
                ))}
              </ol>
              <div className="sidebar-bottom">
                <div className="shield-stamp">
                  <Icon name="shield" size={25} />
                </div>
                <strong>Personal by design.</strong>
                <p>
                  Your setup stays in this browser.
                  <br />
                  Your preferences stay yours.
                </p>
                <button
                  className="text-button"
                  onClick={() => setModal('privacy')}
                >
                  Our privacy approach <Icon size={14} />
                </button>
              </div>
            </aside>
            <main id="main" className={`main stage-${definition[0]}`}>
              <div className="stage-top">
                <span className="breadcrumb">
                  Setup <span>/</span> {definition[1]}
                </span>
                <span className="step-count mono">
                  {stage === 0
                    ? 'INITIALIZATION'
                    : stage >= 19
                      ? `FINALIZATION ${stage - 18}/4`
                      : `STEP ${stage} OF ${stage < 8 ? 8 : stage < 14 ? 14 : 19}`}
                </span>
              </div>
              <div className="main-content" key={stage}>
                <div className="section-marker">
                  <span />{' '}
                  {stage === 0
                    ? 'WELCOME TO ACCESSONE'
                    : definition[1].toUpperCase()}
                </div>
                <h1 tabIndex={-1} ref={heading}>
                  {definition[2]}
                </h1>
                <p className="subtitle">{definition[3]}</p>
                {storageError && (
                  <Notice>
                    Session storage is unavailable. Keep this tab open to retain
                    progress.
                  </Notice>
                )}
                <Stage
                  key={stage}
                  stage={stage}
                  next={next}
                  answers={answers}
                  answer={answer}
                  session={session}
                  setSession={setSession}
                  fast={fast}
                  attemptProvider={attemptProvider}
                />
              </div>
              <div className="main-bottom">
                <div className="progress-label">
                  <span>SETUP PROGRESS</span>
                  <strong>{progress(stage)}%</strong>
                </div>
                <div
                  className="overall-track"
                  role="progressbar"
                  aria-label="Setup progress"
                  aria-valuenow={progress(stage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span style={{ width: `${progress(stage)}%` }} />
                </div>
                <div className="bottom-meta">
                  <span className="mono">{session.id}</span>
                  {stage > 0 ? (
                    <button
                      className="text-button"
                      onClick={() => setModal('cancel')}
                    >
                      Cancel setup
                    </button>
                  ) : (
                    <span>
                      <Icon name="clock" size={13} /> Estimated setup: 2–3
                      minutes
                    </span>
                  )}
                </div>
              </div>
            </main>
          </div>
          <footer className="footer">
            <span>
              © 2026 AccessOne <span className="footer-divider">/</span>{' '}
              Personal access, thoughtfully configured.
            </span>
            <div>
              <button onClick={() => setModal('privacy')}>Privacy</button>
              <button onClick={() => setModal('status')}>
                <span className="status-dot" />
                All systems operational
              </button>
              <span className="mono version">v7.4.1</span>
            </div>
          </footer>
        </>
      )}
      {modal && (
        <Modal
          title={
            modal === 'cancel'
              ? 'Cancel setup?'
              : modal === 'help'
                ? 'A little guidance.'
                : modal === 'status'
                  ? 'All systems operational.'
                  : 'Your session stays yours.'
          }
          onClose={() => setModal(null)}
        >
          {modal === 'cancel' ? (
            <>
              <p>
                You are {progress(stage)}% complete. You can leave at any time.
              </p>
              <div className="modal-actions">
                <Button onClick={() => setModal(null)}>Continue setup</Button>
                <Button secondary onClick={reset}>
                  Escape while you still can
                </Button>
              </div>
            </>
          ) : modal === 'help' ? (
            <>
              <p>
                Follow the prompts to configure your access. Nothing here
                requires an account password, a payment, or access to your
                device.
              </p>
              <p>
                Made a choice you’d like to change? Use the Back button where
                available. Session progress resumes in this tab after a refresh.
              </p>
              <Button onClick={() => setModal(null)}>Got it</Button>
            </>
          ) : modal === 'status' ? (
            <>
              <p>
                All session operations run locally in your browser. Provider
                integrations are currently unavailable.
              </p>
              <p className="mono">*Unfortunately.</p>
              <Button onClick={() => setModal(null)}>Understood</Button>
            </>
          ) : (
            <>
              <p>
                No passwords, precise locations, payment details, tracking, or
                account connections. Questionnaire answers exist only in this
                page’s memory.
              </p>
              <p>
                This tab stores stage progress and interaction counters in
                session storage. Free-text answers are never saved. No form
                content is transmitted.
              </p>
              <Button secondary onClick={reset}>
                Reset local prank data
              </Button>
            </>
          )}
        </Modal>
      )}
      <div className="toast" role="status" aria-live="polite">
        {toast && (
          <>
            <Icon name="check" size={16} />
            {toast}
          </>
        )}
      </div>
      {debug && (
        <details className="debug">
          <summary>Developer controls</summary>
          <label>
            Jump to stage
            <select
              aria-label="Jump to stage"
              value={stage}
              onChange={(e) =>
                setSession((s) => ({ ...s, stage: Number(e.target.value) }))
              }
            >
              {stages.map((s, i) => (
                <option key={s[0]} value={i}>
                  {i}. {s[1]}
                </option>
              ))}
            </select>
          </label>
          <Check checked={fast} onChange={setFast}>
            Fast-forward animations
          </Check>
          <Check checked={mobile} onChange={setMobile}>
            Preview mobile layout
          </Check>
          <button
            onClick={() =>
              setSession((s) => ({ ...s, stage: 23, endedAt: Date.now() }))
            }
          >
            Preview reveal
          </button>
          <button onClick={reset}>Reset local prank data</button>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
type StageProps = {
  stage: number;
  next: () => void;
  answers: Answers;
  answer: (id: string, value: string) => void;
  session: Session;
  setSession: React.Dispatch<React.SetStateAction<Session>>;
  fast: boolean;
  attemptProvider: (p: string) => void;
};
function Stage({
  stage,
  next,
  answers: a,
  answer,
  session: s,
  setSession,
  fast,
  attemptProvider,
}: StageProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');
  const [cookieConfig, setCookieConfig] = useState(false);
  const [tiles, setTiles] = useState<number[]>([]);
  const [robot, setRobot] = useState(false);
  const [codeRound, setCodeRound] = useState(0);
  const [code, setCode] = useState('');
  const [calibration, setCalibration] = useState(0);
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);
  const [dropped, setDropped] = useState(false);
  const [ranking, setRanking] = useState(['Circle', 'Square', 'Triangle']);
  const [profilePage, setProfilePage] = useState(0);
  const toggle = (key: string, v: boolean) =>
    setChecks((c) => ({ ...c, [key]: v }));
  useEffect(() => {
    if (stage !== 12 || calibration === 0) return;
    setReady(false);
    const t = setTimeout(
      () => setReady(true),
      fast ? 100 : prank.timing.calibration + Math.random() * 1000,
    );
    return () => clearTimeout(t);
  }, [calibration, fast, stage]);
  const choices = (id: string, label: string, options: string[]) => (
    <Choices
      label={label}
      options={options}
      value={a[id]}
      onChange={(v) => answer(id, v)}
    />
  );
  const select = (id: string, label: string, options: string[]) => (
    <Select
      label={label}
      options={options}
      value={a[id]}
      onChange={(v) => answer(id, v)}
    />
  );
  const continueButton = (enabled = true, label = 'Continue') => (
    <div className="actions">
      <Button disabled={!enabled} onClick={next}>
        {label}
      </Button>
      <span className="action-note">
        <Icon name="lock" size={12} /> Saved in this session
      </span>
    </div>
  );
  const checklist = (id: string, text: string) => (
    <Check checked={!!checks[id]} onChange={(v) => toggle(id, v)}>
      {text}
    </Check>
  );
  if (stage === 0)
    return (
      <>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <span className="orbit-point p1" />
          <span className="orbit-point p2" />
          <span className="art-label label-one">ONE CONNECTION</span>
          <span className="art-label label-two">BUILT AROUND YOU</span>
          <div className="access-tile">
            <svg viewBox="0 0 32 32">
              <path d="M5 25 16 5l11 20h-8l-3-6-3 6z" fill="currentColor" />
            </svg>
            <span>ACCESS, ALIGNED.</span>
          </div>
          <span className="art-coordinate">AX / 01</span>
        </div>
        <div className="welcome-intro">
          <h2>A few steps to your own space.</h2>
          <p>
            Set up your profile, choose your preferences, and establish your
            personal access. We’ll take it from here.
          </p>
        </div>
        <Button onClick={next}>Begin setup</Button>
        <div className="welcome-assurance">
          <span>
            <Icon name="shield" size={15} /> No password required
          </span>
          <span>
            <Icon name="globe" size={15} /> Browser-based setup
          </span>
        </div>
      </>
    );
  if (stage === 1)
    return (
      <>
        <div className="overview-list">
          {[
            [
              'user',
              'Make it personal',
              'Set your profile and regional preferences.',
            ],
            [
              'shield',
              'Stay in control',
              'Review your privacy and session settings.',
            ],
            [
              'check',
              'Get ready to go',
              'Complete a few straightforward checks.',
            ],
          ].map(([icon, title, text], i) => (
            <div key={title}>
              <span className="overview-icon">
                <Icon name={icon} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <span className="mono">0{i + 1}</span>
            </div>
          ))}
        </div>
        <Notice>
          Everything you need is right here. No passwords, payment details, or
          external accounts required.
        </Notice>
        {continueButton(true, 'Let’s get started')}
      </>
    );
  if (stage === 2)
    return (
      <>
        <div className="provider-grid">
          {prank.providers.map((p, i) => (
            <button
              key={p}
              aria-label={p}
              className={
                s.providers.includes(p) ? 'provider attempted' : 'provider'
              }
              onClick={() => {
                attemptProvider(p);
                setProvider(p);
              }}
            >
              <span
                className={`provider-symbol provider-${i}`}
                aria-hidden="true"
              >
                {p === 'Microsoft' ? (
                  <span className="ms-logo">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                ) : p === 'Apple' ? (
                  '●'
                ) : p === 'PlayStation' ? (
                  'PS'
                ) : p === 'Xbox' ? (
                  'X'
                ) : p === 'Discord' ? (
                  '◉'
                ) : (
                  p.slice(0, 1)
                )}
              </span>
              <span>{p}</span>
              {s.providers.includes(p) ? (
                <span className="provider-unavailable">Unavailable</span>
              ) : (
                <Icon size={14} />
              )}
            </button>
          ))}
        </div>
        {provider && (
          <div className="provider-notice" role="status">
            <Icon name="info" size={18} />
            <div>
              <strong>{provider} is unavailable</strong>
              <p>
                {s.providers.length <= 3
                  ? prank.providerReasons[
                      Math.min(2, prank.providers.indexOf(provider))
                    ]
                  : prank.providerReasons[
                      prank.providers.indexOf(provider) %
                        prank.providerReasons.length
                    ]}
              </p>
              <small>
                No connection was made. No credentials are requested.
              </small>
            </div>
          </div>
        )}
        {s.providers.length >= 3 && (
          <Notice>
            Automated sign-in methods are currently unavailable. Please use
            Manual Identity Setup.
          </Notice>
        )}
        <div className="manual-route">
          <span>Prefer another way?</span>
          <button className="text-button" onClick={next}>
            Continue manually <Icon size={16} />
          </button>
        </div>
        <p className="fineprint">
          Provider options do not connect to external accounts.
        </p>
      </>
    );
  if (stage === 3 && profilePage === 0)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if ((a.nickname || '').trim().length < 3) {
            setError(
              'Name entropy below recommended threshold. Use at least 3 characters.',
            );
            return;
          }
          setError('');
          setProfilePage(1);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      >
        <Notice>
          Use a nickname. Do not enter passwords, addresses, payment
          information, government identifiers, or other sensitive information.
        </Notice>
        <div className="form-grid">
          <label className="field">
            Preferred nickname
            <input
              autoComplete="off"
              maxLength={32}
              value={a.nickname || ''}
              onChange={(e) => answer('nickname', e.target.value)}
              aria-invalid={!!error}
              aria-label="Preferred nickname"
              placeholder="Something we can call you"
            />
            {error && (
              <span className="error" role="alert">
                {error}
              </span>
            )}
          </label>
          <label className="field">
            Display name <span className="optional">Optional</span>
            <input
              autoComplete="off"
              maxLength={32}
              value={a.display || ''}
              onChange={(e) => answer('display', e.target.value)}
              placeholder="Your public-facing alias"
            />
          </label>
          {select('pronouns', 'Pronouns · optional', [
            'Prefer not to say',
            'They / them',
            'She / her',
            'He / him',
            'Any pronouns',
          ])}
          {select('age', 'Approximate age category', [
            'Under 18',
            '18–24',
            '25–34',
            '35+',
            'Time is a social construct',
          ])}
        </div>
        {choices('hand', 'Dominant hand', [
          'Left',
          'Right',
          'Ambidextrous',
          'Depends what I’m holding',
        ])}
        <div className="actions">
          <Button type="submit">Continue</Button>
          <span className="action-note">
            Nicknames only. We’re on a first-alias basis.
          </span>
        </div>
      </form>
    );
  if (stage === 3)
    return (
      <>
        <div className="assessment-top">
          <span className="mono">PROFILE / 02 OF 02</span>
          <span>PREFERENCE ALIGNMENT</span>
        </div>
        <div className="form-grid">
          {select('color', 'Favorite color', [
            'Green',
            'Blue',
            'Red',
            'Yellow',
            'Black',
            'The default one',
          ])}
          {select('food', 'Preferred food category', [
            'Pasta',
            'Pizza',
            'Sushi',
            'Anything someone else cooks',
          ])}
          {select('season', 'Favorite season', [
            'Spring',
            'Summer',
            'Autumn',
            'Winter',
          ])}
          {select('pets', 'Cat or dog?', [
            'Cat',
            'Dog',
            'Both',
            'Neither',
            'Whichever pays rent',
          ])}
        </div>
        {choices('morning', 'Your natural schedule', [
          'Morning person',
          'Night person',
          'Barely a person',
        ])}
        {choices('drink', 'Preferred operating fluid', [
          'Coffee',
          'Tea',
          'Water',
          'Unidentified liquid',
        ])}
        {choices('tabs', 'Browser tabs currently open', [
          '1–5',
          '6–15',
          '16–40',
          'I cannot see the icons',
        ])}
        {choices('necessary-tabs', 'How many are actually necessary?', [
          'All of them',
          'Most of them',
          'Three, probably',
          'This is a personal attack',
        ])}
        {choices('alarms', 'Alarms required to wake up', [
          '1',
          '2',
          '3',
          'A small orchestra',
        ])}
        {choices('tomorrow', 'How often do you say “I’ll do it tomorrow”?', [
          'Rarely',
          'Sometimes',
          'Daily',
          'I’ll answer tomorrow',
        ])}
        {choices('pigeons', 'How trustworthy are pigeons?', [
          'Very',
          'Somewhat',
          'Under investigation',
          'Government contractors',
        ])}
        {choices('cereal', 'Is cereal soup?', [
          'Yes',
          'No',
          'I need legal counsel',
        ])}
        <div className="actions">
          <Button
            disabled={
              ![
                'color',
                'food',
                'season',
                'pets',
                'morning',
                'drink',
                'tabs',
                'necessary-tabs',
                'alarms',
                'tomorrow',
                'pigeons',
                'cereal',
              ].every((k) => !!a[k])
            }
            onClick={next}
          >
            Save profile
          </Button>
          <button className="text-button" onClick={() => setProfilePage(0)}>
            ← Basic profile
          </button>
        </div>
      </>
    );
  if (stage === 4)
    return (
      <>
        <div className="form-grid">
          {select('timezone', 'Approximate timezone', [
            'UTC−08:00',
            'UTC−05:00',
            'UTC±00:00',
            'UTC+02:00',
            'UTC+05:30',
            'UTC+08:00',
            'UTC+12:00',
            'Prefer not to specify',
          ])}
          {select('language', 'Interface language', [
            'English',
            'English, but more formal',
            'English, reluctantly',
          ])}
          {select('region', 'Country / region', [
            'Prefer not to specify',
            'Europe',
            'North America',
            'South America',
            'Asia',
            'Africa',
            'Oceania',
          ])}
          {select('environment', 'Urban environment preference', [
            'Large city',
            'Small city',
            'Town',
            'Countryside',
            'Cave with Wi-Fi',
          ])}
        </div>
        {choices('digits', 'Preferred number of digits in a postal code', [
          '4',
          '5',
          '6',
          'As few as possible',
        ])}
        <Notice>
          No address or actual city is requested. This is preference
          configuration only.
        </Notice>
        {continueButton(
          !!a.timezone &&
            !!a.language &&
            !!a.region &&
            !!a.environment &&
            !!a.digits,
        )}
      </>
    );
  if (stage === 5)
    return (
      <>
        <div
          className="document-panel"
          tabIndex={0}
          aria-label="Terms of access"
        >
          <div className="document-heading">
            <Icon name="document" />
            <span className="mono">TERMS OF ACCESS / REV. 7.4</span>
          </div>
          <h3>01. Scope of the arrangement</h3>
          <p>
            By continuing, you agree to participate in a sequence of locally
            rendered interface screens. AccessOne makes no promises concerning
            the eventual usefulness of said screens.
          </p>
          <h3>02. Your responsibilities</h3>
          <p>
            Please use a fictional nickname. Do not submit sensitive
            information. You may discontinue setup at any point using your
            browser or the Cancel setup control.
          </p>
          <h3>03. Service availability</h3>
          <p>
            Provider buttons are interface demonstrations only. No external
            authentication, account creation, or credential collection occurs.
          </p>
          <h3>04. Expectations management</h3>
          <p>
            A progress indicator represents an organizational aspiration, rather
            than a binding agreement with linear time.
          </p>
          <h3>05. The agreement to agree</h3>
          <p>
            By acknowledging this agreement, you acknowledge that an agreement
            has been acknowledged. No further agreement is implied, except where
            previously acknowledged.
          </p>
          <h3>06. Data and retention</h3>
          <p>
            Questionnaire answers are kept only in memory. Stage progress and
            counters remain in this tab’s session storage until reset or the
            tab’s session ends.
          </p>
          <h3>07. Governing principle</h3>
          <p>
            There is no need for section seven. Legal felt six was an awkward
            number.
          </p>
        </div>
        {checklist('terms', 'I have reviewed and accept the terms of access.')}
        {continueButton(!!checks.terms, 'Accept & continue')}
      </>
    );
  if (stage === 6)
    return (
      <>
        <div className="privacy-columns">
          <div>
            <span className="eyebrow">WHAT STAYS LOCAL</span>
            <ul>
              <li>Progress through this form</li>
              <li>Temporary interface state</li>
              <li>Interaction counters</li>
              <li>Existential regret</li>
            </ul>
          </div>
          <div>
            <span className="eyebrow">WHAT WE DON’T COLLECT</span>
            <ul>
              <li>Passwords or payment data</li>
              <li>Private account credentials</li>
              <li>Precise location</li>
              <li>Your immortal soul</li>
            </ul>
          </div>
        </div>
        <Notice>
          There are no analytics or tracking requests. Answers are not saved to
          session storage and are cleared on refresh.
        </Notice>
        {checklist(
          'read',
          'I acknowledge that I have read the Privacy Summary.',
        )}
        {checklist(
          'honest',
          'I acknowledge that I probably did not actually read it.',
        )}
        {checks.read && !checks.honest && (
          <p className="validation" role="status">
            Statistical anomaly detected. Please complete the honesty
            acknowledgement.
          </p>
        )}
        {continueButton(!!checks.read && !!checks.honest)}
      </>
    );
  if (stage === 7)
    return (
      <>
        <div className="cookie-heading">
          <Icon name="sliders" size={30} />
          <div>
            <h2>A small amount of local memory.</h2>
            <p>
              No tracking. No actual browser cookies. Several unnecessary
              categories.
            </p>
          </div>
        </div>
        {cookieConfig && (
          <div className="cookie-settings">
            {[
              'Essential',
              'Functional',
              'Preference',
              'Analytics',
              'Emotional Support Cookies',
              'Cookies That Are Actually Biscuits',
              'Cookies That Exist Mainly Because This Menu Needed More Options',
            ].map((c, i) => (
              <div className="toggle-row" key={c}>
                <span>
                  <strong>{c}</strong>
                  <small>
                    {i === 0
                      ? 'Session progress. Always available.'
                      : i === 3
                        ? 'Not installed. Nothing to measure.'
                        : 'A purely local interface preference.'}
                  </small>
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    aria-label={c}
                    checked={i === 0 || !!checks[c]}
                    disabled={i === 0 || i === 3}
                    onChange={(e) => toggle(c, e.target.checked)}
                  />
                  <span />
                </label>
              </div>
            ))}
          </div>
        )}
        <div className="stack-actions">
          <Button onClick={next}>
            {cookieConfig ? 'Save preferences' : 'Accept essential cookies'}
          </Button>
          {!cookieConfig && (
            <Button secondary onClick={() => setCookieConfig(true)}>
              Configure preferences
            </Button>
          )}
          <button
            className="text-button"
            onClick={() => {
              setChecks({});
              next();
            }}
          >
            Reject unnecessary cookies <Icon size={15} />
          </button>
        </div>
      </>
    );
  if (stage === 8)
    return (
      <>
        {!robot ? (
          <div className="robot-check">
            <Check checked={robot} onChange={setRobot}>
              I am not a robot.
            </Check>
            <span className="mono">ACCESS CHECK / 01</span>
          </div>
        ) : (
          <>
            <Notice>
              That is exactly what a robot would say. Select every square
              containing something you’d rather be doing right now.
            </Notice>
            <div className="captcha-grid">
              {[
                'Sleeping',
                'Eating',
                'Going outside',
                'Watching a film',
                'Reading',
                'Absolutely nothing',
                'Petting a dog',
                'Making coffee',
                'Anything else',
              ].map((tile, i) => (
                <button
                  aria-pressed={tiles.includes(i)}
                  className={
                    tiles.includes(i) ? 'captcha-tile selected' : 'captcha-tile'
                  }
                  key={tile}
                  onClick={() =>
                    setTiles((t) =>
                      t.includes(i) ? t.filter((x) => x !== i) : [...t, i],
                    )
                  }
                >
                  <span className={`abstract abstract-${i}`} />
                  <strong>{tile}</strong>
                  {tiles.includes(i) && <Icon name="check" size={16} />}
                </button>
              ))}
            </div>
            <div className="actions">
              <Button
                disabled={!tiles.length}
                onClick={() => {
                  setSession((v) => ({ ...v, captchas: v.captchas + 1 }));
                  next();
                }}
              >
                Verify selection
              </Button>
              <span className="fineprint">Any honest answer is accepted.</span>
            </div>
          </>
        )}
      </>
    );
  if (stage === 9)
    return (
      <>
        {choices(
          'suspicion',
          'Which object is most likely plotting against you?',
          ['Printer', 'Toaster', 'Chair', 'Duck'],
        )}
        <div className="rank-panel">
          <h3>Arrange shapes from least to most suspicious.</h3>
          <p>
            Drag to reorder, or use the arrow buttons. We respect your judgment.
          </p>
          {ranking.map((r, i) => (
            <div
              key={r}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', r)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const item = e.dataTransfer.getData('text/plain');
                if (!ranking.includes(item)) return;
                const list = ranking.filter((x) => x !== item);
                list.splice(i, 0, item);
                setRanking(list);
              }}
            >
              <span className="mono">0{i + 1}</span>
              <strong>{r}</strong>
              <button
                aria-label={`Move ${r} up`}
                disabled={i === 0}
                onClick={() =>
                  setRanking((old) => {
                    const n = [...old];
                    [n[i - 1], n[i]] = [n[i], n[i - 1]];
                    return n;
                  })
                }
              >
                ↑
              </button>
              <button
                aria-label={`Move ${r} down`}
                disabled={i === ranking.length - 1}
                onClick={() =>
                  setRanking((old) => {
                    const n = [...old];
                    [n[i + 1], n[i]] = [n[i], n[i + 1]];
                    return n;
                  })
                }
              >
                ↓
              </button>
            </div>
          ))}
        </div>
        {a.suspicion && (
          <Notice>
            Behavioral signature accepted. There is no objectively correct
            answer, especially about the printer.
          </Notice>
        )}
        <div className="actions">
          <Button
            disabled={!a.suspicion}
            onClick={() => {
              setSession((v) => ({ ...v, captchas: v.captchas + 1 }));
              next();
            }}
          >
            Confirm assessment
          </Button>
        </div>
      </>
    );
  if (stage === 10)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code !== (codeRound === 0 ? '482731' : '196204')) {
            setError(
              'Code mismatch. It is literally the code above this field.',
            );
            return;
          }
          answer(`code-${codeRound}`, 'verified');
          setError('');
          setCode('');
          if (codeRound === 0) setCodeRound(1);
          else next();
        }}
      >
        <div className="verification-code">
          <span className="eyebrow">
            {codeRound === 0 ? 'PRIMARY' : 'SECONDARY'} VERIFICATION CODE
          </span>
          <strong className="mono">
            {codeRound === 0 ? '482 731' : '196 204'}
          </strong>
          <span>This code is displayed locally. No message has been sent.</span>
        </div>
        {codeRound === 1 && (
          <Notice>
            Code accepted. Secondary verification is required to verify the
            verification.
          </Notice>
        )}
        <label className="field code-field">
          Enter the six-digit code
          <input
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={!!error}
            aria-label="Enter the six-digit code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
          />
          {error && (
            <span role="alert" className="error">
              {error}
            </span>
          )}
        </label>
        <Button type="submit">Verify code</Button>
      </form>
    );
  if (stage === 11)
    return (
      <Timed
        duration={prank.timing.compatibility}
        fast={fast}
        onDone={next}
        caption="ENVIRONMENT ASSESSMENT"
        messages={[
          'Checking JavaScript…',
          'Checking local interface storage…',
          'Checking pointer input…',
          'Checking keyboard support…',
          'Checking rendering…',
          'Checking UTF-8…',
          'Checking ability to click buttons…',
          'Suspicious amount of patience detected.',
          'Compatibility score: 99.8%',
        ]}
      />
    );
  if (stage === 12)
    return (
      <>
        <div className="calibration-board">
          <div className={`target-ring ${ready ? 'ready' : ''}`}>
            <Icon name="sliders" size={32} />
          </div>
          <h2>
            {calibration === 0
              ? 'Let’s establish a baseline.'
              : calibration > 3
                ? 'Interaction latency calibrated.'
                : ready
                  ? 'Ready. Click now.'
                  : 'Synchronizing local interaction clock…'}
          </h2>
          <p>
            {calibration === 0
              ? 'Three short response checks. Click when the control becomes active.'
              : `Calibration sample ${Math.min(calibration, 3)} / 3`}
          </p>
          <Button
            disabled={calibration > 0 && !ready && calibration <= 3}
            onClick={() => {
              if (calibration >= 3) {
                next();
                return;
              }
              setCalibration((c) => c + 1);
            }}
          >
            {calibration === 0
              ? 'Start calibration'
              : ready
                ? 'Register interaction'
                : 'Measuring response…'}
          </Button>
        </div>
        <Notice>
          Calibration operates entirely inside this page. No device identifiers,
          browser fingerprint, camera, microphone, or location are accessed.
        </Notice>
      </>
    );
  if (stage === 13)
    return (
      <>
        <div className="human-task">
          <span className="task-index">01</span>
          <div>
            <h3>Place a circle inside a square.</h3>
            <div className="drop-zone">
              <button
                className={`drag-circle ${dropped ? 'placed' : ''}`}
                draggable
                aria-label="Circle: activate to place in square"
                onClick={() => setDropped(true)}
                onDragStart={(e) =>
                  e.dataTransfer.setData('text/plain', 'circle')
                }
              >
                {dropped && <Icon name="check" />}
              </button>
              <button
                className="drop-square"
                aria-label="Place circle in square"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.getData('text/plain') === 'circle')
                    setDropped(true);
                }}
                onClick={() => setDropped(true)}
              >
                {dropped ? 'Placed ✓' : 'Place here'}
              </button>
            </div>
            <small>
              Drag, tap the circle, or activate it with your keyboard.
            </small>
          </div>
        </div>
        <div className="human-task">
          <span className="task-index">02</span>
          <div>
            <h3>Click the button three times.</h3>
            <Button
              secondary
              disabled={count >= 3}
              onClick={() => setCount((c) => c + 1)}
            >
              {count >= 3
                ? 'Click quota achieved'
                : `Click registered: ${count} / 3`}
            </Button>
          </div>
        </div>
        <div className="human-task">
          <span className="task-index">03</span>
          <div>
            {choices('human', 'Which statement sounds most human?', [
              'I experience emotions.',
              'I sometimes walk into rooms and forget why.',
              '01001000 01101001.',
            ])}
          </div>
        </div>
        {dropped &&
          count >= 3 &&
          a.human === 'I sometimes walk into rooms and forget why.' && (
            <Notice>
              Humanity probability: 99.7%. Remaining 0.3% accepted under
              tolerance policy.
            </Notice>
          )}
        {continueButton(
          dropped &&
            count >= 3 &&
            a.human === 'I sometimes walk into rooms and forget why.',
        )}
      </>
    );
  if (stage === 14) {
    const length = Math.min(
      personalityQuestions.length,
      Math.max(1, prank.personalityLength),
    );
    const index = Math.min(s.personalityIndex, length - 1);
    const question = personalityQuestions[index];
    return (
      <div className="personality">
        <div className="assessment-top">
          <span className="mono">
            QUESTION {String(index + 1).padStart(2, '0')} / {length}
          </span>
          <span>
            {index >= 19
              ? 'Consistency monitoring active'
              : 'PERSONAL PREFERENCE INDEX'}
          </span>
        </div>
        <h2>{question}</h2>
        <Choices
          label="How much do you agree?"
          options={[
            'Strongly disagree',
            'Disagree',
            'Neutral',
            'Agree',
            'Strongly agree',
          ]}
          value={a[`personality-${index}`]}
          onChange={(v) => answer(`personality-${index}`, v)}
        />
        {index === 32 && a[`personality-${index}`]?.includes('agree') && (
          <p className="validation">
            Confidence level exceeds recommended operational baseline.
          </p>
        )}
        <div className="question-dots" aria-hidden="true">
          {personalityQuestions.slice(0, length).map((_, i) => (
            <span key={i} className={i <= index ? 'filled' : ''} />
          ))}
        </div>
        <div className="question-navigation">
          <button
            className="text-button"
            disabled={index === 0}
            onClick={() =>
              setSession((v) => ({
                ...v,
                personalityIndex: Math.max(0, v.personalityIndex - 1),
              }))
            }
          >
            ← Previous question
          </button>
          <Button
            disabled={!a[`personality-${index}`]}
            onClick={() => {
              if (index === length - 1) next();
              else setSession((v) => ({ ...v, personalityIndex: index + 1 }));
            }}
          >
            {index === length - 1 ? 'Complete assessment' : 'Next question'}
          </Button>
        </div>
        <p className="fineprint">
          Take a moment with each statement. Your answers never leave this page.
        </p>
      </div>
    );
  }
  if (stage === 15)
    return (
      <Timed
        duration={prank.timing.falseComplete}
        fast={fast}
        onDone={next}
        caption="100% COMPLETE"
        messages={[
          'All checks passed.',
          'Profile initialization complete.',
          'You’re all set.',
        ]}
      />
    );
  if (stage === 16)
    return (
      <>
        <div className="requirement">
          <div className="requirement-symbol">
            <Icon name="document" size={30} />
          </div>
          <div>
            <span className="mono">REQUIREMENT AX-019-B</span>
            <h2>Supplementary preference integrity.</h2>
            <p>
              Your setup is 93% complete. The remaining 7% was identified after
              the previous 100%.
            </p>
            <p>
              We appreciate your continued commitment to reaching the end of
              this sentence, and subsequently this process.
            </p>
          </div>
        </div>
        {continueButton(true, 'Resolve requirement')}
      </>
    );
  if (stage === 17)
    return (
      <>
        {select('wifi', 'Choose a fictional first Wi-Fi network', [
          'Linksys',
          'NETGEAR',
          'FBI Surveillance Van',
          'I genuinely don’t remember',
        ])}
        {choices('betrayal', 'Which childhood object would betray you first?', [
          'Teddy bear',
          'Nightlight',
          'Toy piano',
          'All of them',
        ])}
        {choices('snack', 'Preferred emergency snack', [
          'Crackers',
          'Chocolate',
          'Cheese',
          'The emergency itself',
        ])}
        {select('recovery', 'Your plan when the Wi-Fi stops working', [
          'Restart the router',
          'Stare at the router',
          'Negotiate with the router',
          'Remember the outdoors exist',
        ])}
        <label className="field">
          Attempts before restarting the router{' '}
          <strong className="range-value">{a.router || '3'}</strong>
          <input
            type="range"
            min="1"
            max="12"
            value={a.router || '3'}
            onChange={(e) => answer('router', e.target.value)}
          />
          <span className="range-labels">
            <span>1 reasonable attempt</span>
            <span>12 acts of faith</span>
          </span>
        </label>
        {continueButton(!!a.wifi && !!a.betrayal && !!a.snack && !!a.recovery)}
      </>
    );
  if (stage === 18)
    return (
      <>
        {choices('button', 'Which button looks more clickable?', [
          'A — Continue',
          'B — Continue',
        ])}
        {choices('radius', 'Preferred corner radius', [
          '8px',
          '10px',
          '12px',
          '14px',
        ])}
        <label className="field">
          Loading spinner speed{' '}
          <span
            className="spinner-demo"
            style={{
              animationDuration: `${2200 - Number(a.spinner || 1000)}ms`,
            }}
          />
          <input
            type="range"
            min="200"
            max="1800"
            value={a.spinner || '1000'}
            onChange={(e) => answer('spinner', e.target.value)}
          />
          <span className="range-labels">
            <span>Contemplative</span>
            <span>Unnecessarily urgent</span>
          </span>
        </label>
        {choices('gray', 'Preferred shade of gray', [
          'Graphite',
          'Almost graphite',
          'Politely graphite',
          'Graphite, but different',
        ])}
        {choices('checkbox', 'Preferred checkbox animation', [
          'Quietly checked',
          'Checked with conviction',
          'No unnecessary movement',
        ])}
        {continueButton(
          !!a.button && !!a.radius && !!a.gray && !!a.checkbox,
          'Apply precise preferences',
        )}
      </>
    );
  if (stage === 19)
    return (
      <>
        <dl className="summary-table">
          {[
            ['Account method', 'Manual'],
            ['Verification', 'Passed'],
            ['Humanity', 'Probable'],
            ['Personality profile', 'Generated'],
            ['Browser', 'Compatible'],
            ['Security', 'Suspiciously adequate'],
            ['Patience', 'Exceptional'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>
                <span className="status-dot" />
                {v}
              </dd>
            </div>
          ))}
        </dl>
        {checklist(
          'summary',
          'I confirm that the information above is mostly accurate.',
        )}
        {continueButton(!!checks.summary, 'Approve final review')}
      </>
    );
  if (stage === 20)
    return (
      <>
        <Notice>
          Finalization dependency discovered. We must verify that your earlier
          verification was, in fact, verified.
        </Notice>
        {checklist('verify', 'I confirm that I completed the verification.')}
        {checklist(
          'verify-again',
          'I confirm my confirmation of the completed verification.',
        )}
        {choices('purpose', 'How meaningful did the verification feel?', [
          'Extremely',
          'Moderately',
          'I have lost perspective',
        ])}
        {continueButton(
          !!checks.verify && !!checks['verify-again'] && !!a.purpose,
          'Verify verification',
        )}
      </>
    );
  if (stage === 21)
    return (
      <>
        <div className="final-seal">
          <Icon name="shield" size={48} />
          <span className="eyebrow">ALL REQUIREMENTS RESOLVED*</span>
          <h2>Your dedication has been noted.</h2>
          <p>Everything is ready for the final initialization sequence.</p>
          <span className="fineprint">
            *To the best of our current, rapidly changing knowledge.
          </span>
        </div>
        {checklist(
          'final',
          'I am ready to finalize this account, whatever that means at this point.',
        )}
        {continueButton(!!checks.final, 'Finalize Account')}
      </>
    );
  if (stage === 22)
    return (
      <Timed
        duration={prank.timing.processing}
        fast={fast}
        onDone={next}
        messages={prank.loadingMessages}
        caption="FINAL ACCOUNT INITIALIZATION"
      />
    );
  return null;
}
function Reveal({
  session: s,
  reset,
  toast,
}: {
  session: Session;
  reset: () => void;
  toast: (s: string) => void;
}) {
  const [reward, setReward] = useState(false);
  const elapsed =
    (s.endedAt || Date.now()) - (s.startedAt || s.endedAt || Date.now());
  const copy = async () => {
    const url = new URL(location.href);
    url.search = '';
    url.hash = '';
    try {
      await navigator.clipboard.writeText(url.href);
      toast('Prank link copied. Choose your next victim responsibly.');
    } catch {
      toast(`Copy this link: ${url.href}`);
    }
  };
  return (
    <main className="reveal" id="main">
      <div className="reveal-top">
        <Brand />
        <span className="mono">SESSION COMPLETE. PURPOSE UNDEFINED.</span>
      </div>
      <div className="reveal-intro">
        <span className="eyebrow">ACCESS GRANTED TO ABSOLUTELY NOTHING</span>
        {prank.friendNickname && <p>{prank.friendNickname},</p>}
        <h1>{prank.finalMessage}</h1>
        <p>You gave us your time. We gave you a progress bar.</p>
      </div>
      <div className="receipt">
        <div className="receipt-title">
          <span className="mono">YOUR BUREAUCRACY RECEIPT</span>
          <Icon name="document" />
        </div>
        <div className="receipt-headline">
          <span>Time you will never get back</span>
          <strong className="mono">{formatTime(elapsed)}</strong>
        </div>
        <div className="stats-grid">
          {[
            ['Buttons clicked', s.clicks],
            ['Questions answered', s.questionIds.length],
            ['Progress bar lies', s.lies],
            ['Providers rejected', s.providers.length],
            ['CAPTCHAs survived', s.captchas],
            ['Chance this was worth it', '0.03%'],
          ].map(([k, v]) => (
            <div key={k}>
              <strong className="mono">{v}</strong>
              <span>{k}</span>
            </div>
          ))}
        </div>
        <div className="receipt-notes">
          <p>
            You completed {s.captchas} CAPTCHAs,{' '}
            {s.questionIds.filter((x) => x.startsWith('code-')).length} fake
            verification codes,{' '}
            {s.questionIds.filter((x) => x.startsWith('personality-')).length}{' '}
            personality questions, privacy settings, cookie configuration,
            browser calibration, and humanity verification.
          </p>
          <p>For absolutely nothing.</p>
        </div>
        <dl className="receipt-details">
          <div>
            <dt>Patience rating</dt>
            <dd>Disturbingly high</dd>
          </div>
          <div>
            <dt>Sunk-cost resistance</dt>
            <dd>Failed</dd>
          </div>
          <div>
            <dt>Ability to leave</dt>
            <dd>The tab had an X button the entire time.</dd>
          </div>
        </dl>
        <div className="reward">
          <span className="eyebrow">YOUR REWARD</span>
          <button onClick={() => setReward(true)}>🎉 Nothing</button>
          {reward && (
            <p role="status">
              Thank you for your participation. Your sacrifice has advanced
              science by approximately 0%.
            </p>
          )}
        </div>
      </div>
      <div className="achievements">
        <span className="eyebrow">
          A REMARKABLE LACK OF TRANSFERABLE SKILLS
        </span>
        <h2>At least you earned these.</h2>
        <div>
          {prank.achievements
            .filter((a) => s.achievements.includes(a.id))
            .map((a) => (
              <article key={a.id}>
                <span className="achievement-icon">
                  <Icon name="spark" />
                </span>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                </div>
              </article>
            ))}
        </div>
      </div>
      <div className="reveal-actions">
        <Button onClick={copy}>Copy prank link</Button>
        <Button secondary onClick={reset}>
          Restart this terrible experience
        </Button>
        <button
          className="text-button"
          onClick={() =>
            toast('Feedback recorded locally and immediately ignored.')
          }
        >
          I hate you
        </button>
      </div>
      <p className="reveal-privacy">
        No accounts were created. No questionnaire answers were transmitted. All
        of this happened locally.
      </p>
      <footer className="reveal-footer">
        AccessOne © 2026. Nobody asked for this.
        <span className="mono">v7.4.1-enterprise-final-final2</span>
      </footer>
    </main>
  );
}
