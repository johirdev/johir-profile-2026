export default function PasswordStrength({ value }: { value: string }) {
  const checks = [value.length >= 10, /[a-z]/i.test(value) && /\d/.test(value), /[^a-z0-9]/i.test(value), value.length >= 14];
  const score = checks.filter(Boolean).length;
  const tone = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-500"][score];
  if (!value) return <span className="mt-1.5 block text-[11px] text-muted">At least 10 characters with a letter and a number.</span>;
  return (
    <span className="mt-2 flex items-center gap-2">
      <span className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < score ? tone : "bg-elev"}`} />
        ))}
      </span>
      <span className="text-[11px] text-muted">{["Too weak", "Weak", "Okay", "Strong", "Excellent"][score]}</span>
    </span>
  );
}
