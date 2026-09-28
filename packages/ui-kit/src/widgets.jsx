/**
 * widgets.jsx — the code kit's widget set, Flutter-style: small composable
 * primitives styled *only* from theme.jsx tokens (inline styles, no CSS files).
 * Behaviors that differ per design language (app bar shape, checkbox shape,
 * tab indicator) read from `theme.behavior`.
 */
import { Check } from 'lucide-react';
import { useTheme } from './theme.jsx';

/* ---------- Basics ---------- */

export function Text({ variant = 'body', color, style, children, ...rest }) {
  const t = useTheme();
  return (
    <span
      {...rest}
      style={{
        ...t.type[variant],
        color: color ?? (variant === 'caption' ? t.color.text2 : t.color.text),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Icon({ as, size = 20, color, ...rest }) {
  const t = useTheme();
  const Comp = as;
  return <Comp aria-hidden="true" size={size} color={color ?? t.color.text} strokeWidth={2} {...rest} />;
}

/* ---------- Screen scaffold ---------- */

export function Scaffold({ appBar, bottomBar, fab, children }) {
  const t = useTheme();
  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        background: t.color.background, color: t.color.text,
      }}
    >
      {appBar}
      <main className="scaffold-scroll" style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
      </main>
      {bottomBar}
      {fab}
    </div>
  );
}

/* Decorative window controls — the Adwaita/Yaru headerbar signature. */
function WindowControls() {
  const t = useTheme();
  return (
    <span aria-hidden="true" style={{ display: 'flex', gap: 6, paddingRight: 4 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 12, height: 12, borderRadius: 999, background: t.color.fill, boxShadow: `inset 0 0 0 1px ${t.color.border}` }} />
      ))}
    </span>
  );
}

export function AppBar({ title, subtitle, actions }) {
  const t = useTheme();
  const centered = t.behavior.appBarTitle === 'center';
  const headerbar = t.behavior.appBar === 'headerbar';
  const surface =
    t.behavior.appBar === 'blur'
      ? { background: `${t.color.background}d9`, backdropFilter: 'saturate(180%) blur(20px)' }
      : { background: headerbar ? t.color.surfaceAlt : t.color.surface, borderBottom: `1px solid ${t.color.divider}` };
  return (
    <header
      style={{
        ...surface,
        position: 'relative', zIndex: 10,
        paddingTop: 'calc(env(safe-area-inset-top) + 6px)', paddingBottom: 6,
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          maxWidth: 680, margin: '0 auto', padding: '0 8px', minHeight: 48,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, textAlign: centered ? 'center' : 'left', padding: '0 8px' }}>
          <Text variant="headline" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subtitle}
            </Text>
          )}
        </div>
        {headerbar && <WindowControls />}
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 4 }}>{actions}</div>}
      </div>
    </header>
  );
}

export function NavigationBar({ items, active, onChange }) {
  const t = useTheme();
  return (
    <nav
      role="navigation"
      aria-label="Primary"
      style={{
        display: 'flex', zIndex: 10,
        borderTop: `1px solid ${t.color.divider}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: t.behavior.tabBar === 'blur' ? `${t.color.background}d9` : t.color.surface,
        ...(t.behavior.tabBar === 'blur' ? { backdropFilter: 'saturate(180%) blur(20px)' } : {}),
      }}
    >
      {items.map(({ id, label, icon: IconComp }) => {
        const isActive = id === active;
        const itemStyle = {
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '9px 0 7px', color: isActive ? t.color.brand : t.color.text2, transition: 'color .15s',
        };
        const pill = t.behavior.tabBar === 'pill' && {
          padding: '3px 18px', borderRadius: 999,
          background: isActive ? t.color.brandSoft : 'transparent',
          transition: 'background .15s',
        };
        return (
          <button key={id} type="button" className="pressable" style={itemStyle}
            aria-current={isActive ? 'page' : undefined} onClick={() => onChange(id)}>
            <span style={{ display: 'flex', borderRadius: 999, ...pill }}>
              <Icon as={IconComp} size={22} color={isActive ? t.color.brand : t.color.text2} />
            </span>
            <Text variant="caption" style={{ fontSize: 11, fontWeight: isActive ? 600 : 400 }}>{label}</Text>
          </button>
        );
      })}
    </nav>
  );
}

export function Fab({ icon: IconComp, label, onClick }) {
  const t = useTheme();
  return (
    <button
      type="button" className="pressable" aria-label={label} onClick={onClick}
      style={{
        position: 'absolute', right: 20, bottom: 'calc(env(safe-area-inset-bottom) + 76px)',
        width: 56, height: 56, borderRadius: t.behavior.fabShape || 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: t.color.brand, color: t.color.onBrand,
        boxShadow: t.dark ? 'none' : '0 4px 14px rgba(0,0,0,0.25)',
      }}
    >
      <Icon as={IconComp} size={24} color={t.color.onBrand} />
    </button>
  );
}

/* ---------- Controls ---------- */

export function Button({ children, variant = 'filled', icon: IconComp, onClick, disabled, style }) {
  const t = useTheme();
  const variants = {
    filled: { background: t.color.brand, color: t.color.onBrand },
    tonal: { background: t.color.brandSoft, color: t.color.brand },
    text: { color: t.color.brand },
    danger: { background: t.color.danger, color: t.color.onDanger },
  };
  return (
    <button
      type="button" className="pressable" onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 42, padding: '0 20px', borderRadius: t.radius.button,
        fontSize: t.type.label.fontSize, fontWeight: 600, ...variants[variant],
        opacity: disabled ? 0.45 : 1, ...style,
      }}
    >
      {IconComp && <Icon as={IconComp} size={18} color="currentColor" />}
      {children}
    </button>
  );
}

export function IconButton({ icon: IconComp, label, onClick, tone = 'neutral' }) {
  const t = useTheme();
  return (
    <button
      type="button" className="pressable"
      aria-label={label} onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: t.radius.control,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: tone === 'danger' ? t.color.danger : t.color.text2,
      }}
    >
      <Icon as={IconComp} size={18} color="currentColor" />
    </button>
  );
}

export function Checkbox({ checked, onChange, label }) {
  const t = useTheme();
  const round = t.behavior.checkbox === 'circle';
  return (
    <button
      type="button" className="pressable" role="checkbox" aria-checked={checked} aria-label={label}
      onClick={onChange}
      style={{
        width: 26, height: 26, flexShrink: 0,
        borderRadius: round ? 999 : t.radius.control,
        border: checked ? `2px solid ${t.color.brand}` : `2px solid ${t.color.divider}`,
        background: checked ? t.color.brand : 'transparent',
        color: t.color.onBrand,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {checked && <Check size={16} strokeWidth={3} />}
    </button>
  );
}

export function TextInput({ value, onChange, placeholder, maxLength, autoFocus, label }) {
  const t = useTheme();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <Text variant="label">{label}</Text>}
      <input
        value={value} maxLength={maxLength} placeholder={placeholder} autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        style={{
          height: 46, padding: '0 14px', borderRadius: t.radius.input,
          border: `1px solid ${t.color.border}`, background: t.color.surface,
          color: t.color.text, outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />
    </label>
  );
}

export function Radio({ label, checked, onChange }) {
  const t = useTheme();
  return (
    <button
      type="button" role="radio" aria-checked={checked} className="pressable"
      onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '10px 4px', textAlign: 'left', borderRadius: t.radius.control, boxSizing: 'border-box',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 20, height: 20, flexShrink: 0, borderRadius: 999, boxSizing: 'border-box',
          border: `2px solid ${checked ? t.color.brand : t.color.divider}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {checked && <span style={{ width: 10, height: 10, borderRadius: 999, background: t.color.brand }} />}
      </span>
      <Text variant="body">{label}</Text>
    </button>
  );
}

/* ---------- Containers ---------- */

export function Card({ children, style }) {
  const t = useTheme();
  return (
    <div
      style={{
        background: t.color.surface, borderRadius: t.radius.card,
        border: `1px solid ${t.color.border}`, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12, ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ListTile({ leading, title, subtitle, trailing, onClick }) {
  const t = useTheme();
  const content = (
    <>
      {leading}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text variant="body" style={{ fontWeight: 500 }}>{title}</Text>
        {subtitle && <Text variant="caption">{subtitle}</Text>}
      </span>
      {trailing}
    </>
  );
  const style = {
    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    padding: '11px 4px', textAlign: 'left', borderRadius: t.radius.control, boxSizing: 'border-box',
  };
  return onClick ? (
    <button type="button" className="pressable" style={style} onClick={onClick}>{content}</button>
  ) : (
    <div style={style}>{content}</div>
  );
}

export function Divider() {
  const t = useTheme();
  return <div style={{ height: 1, background: t.color.divider }} />;
}

export function ProgressBar({ value }) {
  const t = useTheme();
  return (
    <div
      role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}
      style={{ height: t.behavior.progressBarHeight, borderRadius: 999, background: t.color.fill, overflow: 'hidden' }}
    >
      <div style={{ width: `${Math.round(value * 100)}%`, height: '100%', background: t.color.brand, borderRadius: 999, transition: 'width .3s' }} />
    </div>
  );
}

export function Badge({ children }) {
  const t = useTheme();
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 999,
        background: t.color.fill, color: t.color.text,
        font: t.type.caption, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/* ---------- Dialog ---------- */

export function Dialog({ open, onClose, title, children, actions }) {
  const t = useTheme();
  if (!open) return null;
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: t.color.scrim, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400, background: t.color.surface,
          borderRadius: t.radius.dialog, border: `1px solid ${t.color.border}`,
          padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
          boxShadow: '0 18px 50px rgba(0,0,0,0.3)',
        }}
      >
        <Text variant="title">{title}</Text>
        {children}
        {actions && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{actions}</div>}
      </div>
    </div>
  );
}
