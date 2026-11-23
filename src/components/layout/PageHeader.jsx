export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-600 uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-950 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-sand-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

/** Section heading used inside pages. */
export function SectionHeading({ eyebrow, title, description, actions, id }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold tracking-[0.2em] text-gold-600 uppercase">{eyebrow}</p>}
        <h2 id={id} className="mt-2 font-display text-2xl font-medium tracking-tight text-ink-950 sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm text-sand-600">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
