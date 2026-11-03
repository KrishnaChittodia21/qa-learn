// Profile (M3): picture, name, password, feedback, delete account. Adapted from system-design-learn's Profile page;
// exam and appearance settings stay on the Settings page, and the admin lists come with the Admin page (M9).
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, LogOut, MessageSquare, SlidersHorizontal, Trash2, TriangleAlert, Upload, UserRound } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { refreshSession, signOut, useSession, type User } from '../lib/session';
import { SignInCard } from '../components/SignInCard';
import { AvatarArt, AvatarFace, AVATARS } from '../components/Avatar';
import { AVATAR_PRESETS, PRESET_PREFIX, presetOf } from '../lib/avatar-presets';
import { PasswordField } from '../components/PasswordField';

const MAX_PICTURE = 2 * 1024 * 1024;
// picture uploads need a Cloudinary account on the service (CLOUDINARY_URL); without it only built-in avatars show
const UPLOADS = import.meta.env.VITE_AVATAR_UPLOADS === '1';
const problem = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');

function Section({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section id={id} className="pf-card panel" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="pf-title">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function Status({ ok, error }: { ok?: string; error?: string }) {
  if (error)
    return (
      <p className="auth-err" role="alert">
        {error}
      </p>
    );
  if (ok)
    return (
      <p className="pf-ok" role="status">
        {ok}
      </p>
    );
  return null;
}

function Picture({ user }: { user: User }) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // a change is only a draft (previewed in the big circle) until Save: a picked avatar, initials, or a chosen file
  type Draft = { kind: 'preset'; url: string } | { kind: 'initials' } | { kind: 'file'; file: File; preview: string };
  const [draft, setDraft] = useState<Draft | null>(null);
  const clear = () => {
    setDraft((d) => {
      if (d?.kind === 'file') URL.revokeObjectURL(d.preview);
      return null;
    });
  };
  useEffect(
    () => () => {
      if (draft?.kind === 'file') URL.revokeObjectURL(draft.preview);
    },
    [draft],
  );
  const pick = (f: File) => {
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return setError('Use a JPG, PNG or WebP picture.');
    if (f.size > MAX_PICTURE) return setError('That picture is over 2 MB. Try a smaller one.');
    setDraft({ kind: 'file', file: f, preview: URL.createObjectURL(f) });
  };
  const upload = async (f: File) => {
    // the service signs the upload; the picture goes straight to Cloudinary, cropped to a 256 px square there
    const { url, params } = await api<{ url: string; params: Record<string, string | number> }>('/api/me/avatar/sign', { body: {} });
    const form = new FormData();
    Object.entries(params).forEach(([k, v]) => form.append(k, String(v)));
    form.append('file', f);
    const res = await fetch(url, { method: 'POST', body: form });
    if (!res.ok) throw new Error('upload');
    const { secure_url } = (await res.json()) as { secure_url: string };
    await api('/api/me/avatar', { method: 'PUT', body: { url: secure_url } });
  };
  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setError('');
    try {
      if (draft.kind === 'file') await upload(draft.file);
      // a built-in avatar ("preset:fox"), or null to go back to initials
      else await api('/api/me/avatar', { method: 'PUT', body: { url: draft.kind === 'preset' ? draft.url : null } });
      await refreshSession(true);
      clear();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : draft.kind === 'file' ? 'The upload failed. Please try again.' : problem(e));
    } finally {
      setBusy(false);
    }
  };
  const shownPreset = draft?.kind === 'preset' ? presetOf(draft.url) : draft ? null : presetOf(user.image);
  return (
    <div className="pf-avatar-row">
      <span className={`pf-avatar ${draft ? 'draft' : ''}`} aria-hidden="true">
        {draft?.kind === 'file' ? (
          <img src={draft.preview} alt="" />
        ) : (
          <AvatarFace image={draft ? (draft.kind === 'preset' ? draft.url : null) : user.image} name={user.name || user.email} />
        )}
      </span>
      <div className="pf-avatar-acts">
        <input
          ref={file}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) pick(e.target.files[0]);
            e.target.value = '';
          }}
        />
        {draft ? (
          <>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void save()}>
              {busy ? 'Saving…' : draft.kind === 'file' ? 'Upload and save' : 'Save picture'}
            </button>
            <button type="button" className="btn-ghost btn-sm" disabled={busy} onClick={clear}>
              Cancel
            </button>
            <p className="pf-hint">Preview. Nothing changes until you save.</p>
          </>
        ) : (
          <>
            {UPLOADS && (
              <button type="button" className="btn btn-sm" onClick={() => file.current?.click()}>
                <Upload size={15} aria-hidden="true" /> {user.image && !presetOf(user.image) ? 'Change picture' : 'Upload a picture'}
              </button>
            )}
            {user.image && (
              <button type="button" className="btn-ghost btn-sm" onClick={() => setDraft({ kind: 'initials' })}>
                Use my initials
              </button>
            )}
            {UPLOADS && <p className="pf-hint">JPG, PNG or WebP, up to 2 MB. It is cropped to a square.</p>}
          </>
        )}
      </div>
      <fieldset className="pf-presets">
        <legend>{UPLOADS ? 'Or pick an avatar' : 'Pick an avatar'}</legend>
        <div className="pf-preset-grid" role="radiogroup" aria-label="Avatars">
          {AVATAR_PRESETS.map((id) => {
            const { label } = AVATARS[id];
            const on = shownPreset === id;
            const url = `${PRESET_PREFIX}${id}`;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={label}
                title={label}
                className={`pf-preset ${on ? 'on' : ''}`}
                disabled={busy}
                // picking the saved one again just drops the draft
                onClick={() => (url === user.image ? clear() : setDraft({ kind: 'preset', url }))}
              >
                <AvatarArt id={id} />
              </button>
            );
          })}
        </div>
      </fieldset>
      <Status error={error} />
    </div>
  );
}

function NameForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/me', { method: 'PATCH', body: { name: name.trim() } });
      await refreshSession(true);
      setStatus({ ok: 'Saved.' });
    } catch (err) {
      setStatus({ error: problem(err) });
    }
  };
  return (
    <form className="auth-form" onSubmit={(e) => void submit(e)}>
      <label className="auth-field">
        <span>Name</span>
        <input className="auth-input" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <p className="pf-hint">Signed in as {user.email}</p>
      <button className="btn btn-sm" type="submit" disabled={!name.trim() || name.trim() === user.name}>
        Save name
      </button>
      <Status {...status} />
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return setStatus({ error: 'Use at least 8 characters for the new password.' });
    try {
      await api('/api/auth/change-password', { body: { currentPassword: current, newPassword: next, revokeOtherSessions: true } });
      setCurrent('');
      setNext('');
      setStatus({ ok: 'Password changed. Other devices were signed out.' });
    } catch (err) {
      setStatus({ error: err instanceof ApiError && err.code === 'INVALID_PASSWORD' ? 'Your current password is not right.' : problem(err) });
    }
  };
  return (
    <form className="auth-form" onSubmit={(e) => void submit(e)}>
      <PasswordField label="Current password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      <PasswordField label="New password (at least 8 characters)" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
      <button className="btn btn-sm" type="submit">
        Change password
      </button>
      <Status {...status} />
      <p className="pf-hint">
        Forgot it? <Link to="/forgot">Reset it by email</Link>.
      </p>
    </form>
  );
}

function DeleteAccount() {
  const nav = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const remove = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/auth/delete-user', { body: { password } });
      await signOut();
      nav('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.code === 'INVALID_PASSWORD' ? 'That password is not right.' : problem(err));
    }
  };
  return (
    <>
      {!confirming ? (
        <button type="button" className="btn btn-sm pf-delete" onClick={() => setConfirming(true)}>
          <Trash2 size={15} aria-hidden="true" /> Delete my account
        </button>
      ) : (
        <form className="auth-form" onSubmit={(e) => void remove(e)}>
          <p>
            <strong>This can’t be undone.</strong> Your account, progress, saved items, picture and feedback are deleted.
          </p>
          <PasswordField label="Your password, to confirm" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="locked-acts">
            <button className="btn btn-sm pf-delete" type="submit">
              Delete everything
            </button>
            <button className="btn-ghost btn-sm" type="button" onClick={() => setConfirming(false)}>
              Keep my account
            </button>
          </div>
        </form>
      )}
      <Status error={error} />
    </>
  );
}

const FEEDBACK_MIN = 10;
interface MyFeedback {
  id: string;
  type: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
  reply: { text: string; at: string } | null;
}
const STATUS_LABEL = { new: 'Waiting', replied: 'Replied', closed: 'Closed' } as const;
const when = (iso: string) => new Date(iso).toLocaleString();

/** The account's own reports and the team's replies (replies show here only; nothing is emailed). */
function MyFeedbackList({ refresh }: { refresh: number }) {
  const [items, setItems] = useState<MyFeedback[] | null>(null);
  useEffect(() => {
    api<MyFeedback[]>('/api/feedback').then(setItems, () => setItems([]));
  }, [refresh]);
  if (!items?.length) return null;
  return (
    <>
      <h3 className="pf-sub">Your feedback</h3>
      <ul className="pf-feedback-list">
        {items.map((f) => (
          <li key={f.id}>
            <span className={`chip ${f.type === 'bug' ? 'fail' : 'pass'}`}>{f.type}</span> <span className="mlabel">{when(f.createdAt)}</span>{' '}
            <span className="muted small">· {STATUS_LABEL[f.status] ?? f.status}</span>
            <p>{f.message}</p>
            {f.reply && (
              <div className="pf-reply">
                <span className="small muted">Reply from the team · {when(f.reply.at)}</span>
                <p>{f.reply.text}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function FeedbackForm({ page }: { page: string }) {
  const [type, setType] = useState<'content' | 'bug'>('content');
  const [sent, setSent] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const [sending, setSending] = useState(false);
  // the service needs at least 10 characters: Send stays off until there is something worth sending
  const missing = FEEDBACK_MIN - message.trim().length;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (missing > 0 || sending) return;
    setSending(true);
    try {
      await api('/api/feedback', { body: { type, page, message: message.trim() } });
      setMessage('');
      setStatus({ ok: 'Thank you! We read every message. Replies show below.' });
      setSent((n) => n + 1);
    } catch (err) {
      setStatus({ error: problem(err) });
    } finally {
      setSending(false);
    }
  };
  const types = [
    ['content', 'Suggest content'],
    ['bug', 'Report a bug'],
  ] as const;
  return (
    <>
      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        <div className="saved-chips" role="radiogroup" aria-label="What is it about?">
          {types.map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={type === id} className={`chip ${type === id ? 'on' : ''}`} onClick={() => setType(id)}>
              {label}
            </button>
          ))}
        </div>
        <label className="auth-field">
          <span>{type === 'bug' ? 'What went wrong, and where?' : 'What would you like to see?'}</span>
          <textarea
            className="answer-box"
            rows={4}
            maxLength={2000}
            value={message}
            aria-describedby="fb-left"
            onChange={(e) => {
              setMessage(e.target.value);
              if (status.ok) setStatus({});
            }}
          />
        </label>
        {message.trim() && missing > 0 && (
          <p id="fb-left" className="pf-hint">
            {missing} more character{missing === 1 ? '' : 's'} to send
          </p>
        )}
        {page && <p className="pf-hint">About the page: {page}</p>}
        <button className="btn btn-primary btn-sm" type="submit" disabled={missing > 0 || sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
        <Status {...status} />
      </form>
      <MyFeedbackList refresh={sent} />
    </>
  );
}

type PaneId = 'you' | 'password' | 'feedback' | 'danger';
const PANES: { id: PaneId; label: string; icon: ReactNode }[] = [
  { id: 'you', label: 'Profile & avatar', icon: <UserRound size={16} aria-hidden="true" /> },
  { id: 'password', label: 'Password', icon: <KeyRound size={16} aria-hidden="true" /> },
  { id: 'feedback', label: 'Suggest or report', icon: <MessageSquare size={16} aria-hidden="true" /> },
  { id: 'danger', label: 'Danger zone', icon: <TriangleAlert size={16} aria-hidden="true" /> },
];

export default function ProfilePage() {
  const session = useSession();
  const [params, setParams] = useSearchParams();
  if (session.status !== 'in') {
    return (
      <div className="page pf-page">
        <SignInCard what="see your profile" loading={session.status === 'loading'} />
      </div>
    );
  }
  const { user } = session;
  // ?section= picks the pane, so links keep working (e.g. the footer's ?section=feedback&from=…)
  const asked = params.get('section') as PaneId | null;
  const pane: PaneId = asked && PANES.some((p) => p.id === asked) ? asked : 'you';
  const open = (id: PaneId) => {
    const next = new URLSearchParams(params);
    next.set('section', id);
    setParams(next, { replace: true });
  };

  return (
    <div className="page pf-page">
      <header className="saved-head rise">
        <span className="mlabel">
          <UserRound size={13} aria-hidden="true" /> Profile
        </span>
        <h1 className="h1">{user.name || 'Your profile'}</h1>
        <button type="button" className="btn-ghost btn-sm pf-signout" onClick={() => void signOut()}>
          <LogOut size={15} aria-hidden="true" /> Sign out
        </button>
      </header>
      <div className="pf-layout rise" style={{ '--i': 1 } as CSSProperties}>
        <nav className="pf-nav panel flat" aria-label="Profile sections">
          {PANES.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`pf-nav-item ${it.id === 'danger' ? 'danger' : ''}`}
              aria-current={pane === it.id ? 'page' : undefined}
              onClick={() => open(it.id)}
            >
              {it.icon} {it.label}
            </button>
          ))}
          <Link to="/settings" className="pf-nav-item">
            <SlidersHorizontal size={16} aria-hidden="true" /> Exam & appearance settings
          </Link>
        </nav>
        <div className="pf-pane" key={pane}>
          {pane === 'you' && (
            <Section id="you" icon={<UserRound size={18} aria-hidden="true" />} title="Profile & avatar">
              <Picture user={user} />
              <NameForm user={user} />
            </Section>
          )}
          {pane === 'password' && (
            <Section id="password" icon={<KeyRound size={18} aria-hidden="true" />} title="Password">
              <PasswordForm />
            </Section>
          )}
          {pane === 'feedback' && (
            <Section id="feedback" icon={<MessageSquare size={18} aria-hidden="true" />} title="Suggest content or report a bug">
              <FeedbackForm page={params.get('from') ?? ''} />
            </Section>
          )}
          {pane === 'danger' && (
            <Section id="delete" icon={<Trash2 size={18} aria-hidden="true" />} title="Delete account">
              <DeleteAccount />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
