interface SWOTCardProps {
  title: string;
  items: string[];
  tags: string[];
  color: string;
  accent: string;
  tagColor: string;
}

export default function SWOTCard({
  title,
  items,
  tags,
  color,
  accent,
  tagColor,
}: SWOTCardProps) {
  return (
    <div className={`${color} p-4 rounded-xl shadow-sm`}>
      <h2 className={`${accent} text-xl font-semibold mb-3`}>{title}</h2>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className={`${tagColor} ${accent} text-xs font-medium text-gray-600 px-2 py-1 rounded-full`}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex flex-col mt-3 text-sm">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="text-gray-500 text-xl px-1">•</span>
            <span className="text-[#2A2C35]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
