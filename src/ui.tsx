import { useEffect, useRef, useState, type ReactNode } from 'react';
export function Icon({
  name = 'arrow',
  size = 20,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    lock: (
      <>
        <rect x="6" y="10" width="12" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="9" cy="18" r="2" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    document: (
      <>
        <path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h6" />
      </>
    ),
    spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.info}
    </svg>
  );
}
export function Brand() {
  return (
    <span className="brand">
      <span className="brandmark">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M5 25 16 5l11 20h-8l-3-6-3 6z" fill="currentColor" />
        </svg>
      </span>
      AccessOne<span className="brand-dot">®</span>
    </span>
  );
}
export function Button({
  children,
  onClick,
  disabled = false,
  secondary = false,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  secondary?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      className={secondary ? 'button secondary' : 'button'}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {!secondary && <Icon size={17} />}
    </button>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <Icon name="info" size={17} />
      <div>{children}</div>
    </div>
  );
}
export function Check({
  children,
  checked,
  onChange,
}: {
  children: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}
export function Choices({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="field choices">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={value === option}
            className={value === option ? 'choice selected' : 'choice'}
            onClick={() => onChange(option)}
          >
            {option}
            {value === option && <Icon name="check" size={15} />}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
export function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="field">
      {label}
      <span className="select-wrap">
        <select
          aria-label={label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </span>
    </label>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      aria-labelledby="modal-title"
    >
      <button
        aria-label="Close dialog"
        className="icon-button modal-close"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <span className="eyebrow">ACCESSONE SUPPORT</span>
      <h2 id="modal-title">{title}</h2>
      {children}
    </dialog>
  );
}
export function Timed({
  duration,
  messages,
  onDone,
  fast,
  caption = 'LOCAL PROCESS',
}: {
  duration: number;
  messages: string[];
  onDone: () => void;
  fast: boolean;
  caption?: string;
}) {
  const [ratio, setRatio] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const start = Date.now();
    const total = fast ? 450 : duration;
    const timer = setInterval(() => {
      const r = Math.min(1, (Date.now() - start) / total);
      setRatio(r);
      if (r === 1) {
        clearInterval(timer);
        done.current();
      }
    }, 60);
    return () => clearInterval(timer);
  }, [duration, fast]);
  const index = Math.min(
    messages.length - 1,
    Math.floor(ratio * messages.length),
  );
  return (
    <div className="processing">
      <div className="scan-orbit">
        <Icon name="shield" size={42} />
        <i />
      </div>
      <span className="eyebrow">{caption}</span>
      <h2 aria-live="polite">{messages[index]}</h2>
      <div
        className="process-track"
        role="progressbar"
        aria-label="Processing progress"
        aria-valuenow={Math.floor(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ transform: `scaleX(${Math.min(0.99, ratio)})` }} />
      </div>
      <div className="process-meta mono">
        <span>SESSION OPERATIONS</span>
        <span>{Math.min(99, Math.floor(ratio * 100))}%</span>
      </div>
      <div className="process-log">
        {messages.slice(Math.max(0, index - 3), index).map((m) => (
          <div key={m}>
            <Icon name="check" size={14} />
            {m.replace('…', '')}
          </div>
        ))}
      </div>
    </div>
  );
}
