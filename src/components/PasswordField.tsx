import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** A labelled password input with a show/hide toggle, so a typo can be caught before submitting (styles in auth.css). */
export function PasswordField({ label, ...input }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  const id = useId();
  // a div, not a label around everything: inside a label the button's name would join the field's name
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <span className="auth-pw">
        <input className="auth-input" {...input} id={id} type={shown ? 'text' : 'password'} />
        <button type="button" className="auth-pw-toggle" aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onClick={() => setShown((v) => !v)}>
          {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </span>
    </div>
  );
}
