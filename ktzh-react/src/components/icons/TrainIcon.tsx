interface TrainIconProps {
  className?: string;
}

export default function TrainIcon({ className }: TrainIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="3" width="22" height="10" rx="2" fill="#60a5fa" />
      <rect x="1" y="5" width="4" height="5" rx="0.5" fill="#1e2030" />
      <rect x="6" y="5" width="4" height="5" rx="0.5" fill="#1e2030" />
      <rect x="11" y="5" width="4" height="5" rx="0.5" fill="#1e2030" />
      <circle cx="4" cy="14" r="2" fill="#93c5fd" />
      <circle cx="18" cy="14" r="2" fill="#93c5fd" />
      <rect x="22" y="6" width="2" height="4" rx="1" fill="#60a5fa" />
    </svg>
  );
}
