// One chip for every pick control across the app. The native input type drives
// semantics (screen readers announce radio-group vs checkbox); the indicator
// SHAPE is the visual cue — a circle for single-select (radio), a square for
// multi-select (checkbox). Selected state fills the indicator and tints the chip.
interface OptionChipProps {
  type: 'radio' | 'checkbox';
  name?: string;
  label: string;
  desc?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function OptionChip({
  type,
  name,
  label,
  desc,
  checked,
  disabled,
  onChange,
  className = '',
}: OptionChipProps) {
  const isRadio = type === 'radio';
  return (
    <label
      className={`group flex items-center gap-2.5 cursor-pointer text-[var(--light-text)] text-sm min-h-[44px] py-2 px-3 rounded-md border border-white/10 bg-white/[0.02] transition-colors hover:bg-white/5 hover:border-[var(--light-blue)] has-[:checked]:border-[var(--light-blue)] has-[:checked]:bg-[var(--light-blue)]/10 has-[:disabled]:opacity-60 has-[:disabled]:cursor-not-allowed has-[:disabled]:hover:bg-white/[0.02] has-[:disabled]:hover:border-white/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--light-blue)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--lighter-dark)] ${className}`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`grid place-items-center shrink-0 w-[18px] h-[18px] border-2 border-[var(--dark-text)] text-white transition-colors ${
          isRadio ? 'rounded-full' : 'rounded-[5px]'
        } group-has-[:checked]:border-[var(--light-blue)] group-has-[:checked]:bg-[var(--light-blue)]`}
      >
        {isRadio ? (
          <span className="w-2 h-2 rounded-full bg-white scale-0 transition-transform group-has-[:checked]:scale-100" />
        ) : (
          <i className="fas fa-check text-[0.6rem] scale-0 transition-transform group-has-[:checked]:scale-100" />
        )}
      </span>
      <span className="flex flex-col min-w-0">
        <span className="font-medium leading-tight">{label}</span>
        {desc && (
          <span className="text-[var(--dark-text)] text-xs leading-snug mt-0.5">{desc}</span>
        )}
      </span>
    </label>
  );
}
