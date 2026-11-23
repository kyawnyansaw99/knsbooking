import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Photo from '../ui/Photo.jsx';

/** Experiences & facilities (the `equipment` catalogue) as photo cards with live availability. */
export default function EquipmentPanel({ equipment, inUse }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {equipment.map((item) => {
        const used = inUse[item.id];
        const free = item.quantity - used;
        return (
          <Link
            key={item.id}
            to={`/book?type=equipment&id=${item.id}`}
            className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl p-5 text-white shadow-soft sm:aspect-[3/4]"
          >
            <Photo
              photo={item.photo}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="absolute inset-0 -z-10 size-full transition duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950/90 via-ink-950/30 to-transparent" aria-hidden />

            <span className="absolute top-4 left-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-900 uppercase backdrop-blur">
              {item.category}
            </span>
            <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-gold-400 group-hover:text-ink-950">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>

            <h3 className="font-display text-xl font-medium">{item.name}</h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full ${free === 0 ? 'bg-rose-400' : 'bg-gold-300'}`}
                  style={{ width: `${(free / item.quantity) * 100}%` }}
                />
              </div>
              <span className={`shrink-0 text-xs font-semibold tabular-nums ${free === 0 ? 'text-rose-200' : 'text-white/90'}`}>
                {free}/{item.quantity} open now
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
