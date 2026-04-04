import { useLocale } from '../../context/LocaleContext';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export default function LogoIcon({ className, size = 36 }: LogoIconProps) {
  const { locale } = useLocale();
  const src = locale === 'ru' ? '/logo-ru.png' : '/logo-en.png';

  return (
    <img
      src={src}
      alt="KTZ Logo"
      width={size * 2.6}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
}
