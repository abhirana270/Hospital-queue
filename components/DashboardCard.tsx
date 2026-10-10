interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  subtitle?: string;
  trend?: string;
}

const colorMap = {
  blue: {
    container: 'bg-gradient-to-br from-white to-sky-50/60 border-sky-200/80 hover:border-sky-300',
    iconBg: 'bg-sky-100 text-sky-700',
    val: 'text-sky-950',
  },
  green: {
    container: 'bg-gradient-to-br from-white to-emerald-50/60 border-emerald-200/80 hover:border-emerald-300',
    iconBg: 'bg-emerald-100 text-emerald-700',
    val: 'text-emerald-950',
  },
  yellow: {
    container: 'bg-gradient-to-br from-white to-amber-50/60 border-amber-200/80 hover:border-amber-300',
    iconBg: 'bg-amber-100 text-amber-700',
    val: 'text-amber-950',
  },
  red: {
    container: 'bg-gradient-to-br from-white to-rose-50/60 border-rose-200/80 hover:border-rose-300',
    iconBg: 'bg-rose-100 text-rose-700',
    val: 'text-rose-950',
  },
  purple: {
    container: 'bg-gradient-to-br from-white to-purple-50/60 border-purple-200/80 hover:border-purple-300',
    iconBg: 'bg-purple-100 text-purple-700',
    val: 'text-purple-950',
  },
};

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
}: DashboardCardProps) {
  const styles = colorMap[color];

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 ${styles.container}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm ${styles.iconBg}`}>
          {icon}
        </span>
      </div>
      <div className={`text-3xl font-extrabold font-mono tracking-tight ${styles.val}`}>
        {value}
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/80 text-[11px] text-slate-500">
          <span>{subtitle}</span>
          {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
        </div>
      )}
    </div>
  );
}
