import { Icon } from 'tdesign-icons-react';

interface TIconProps {
  name: string;
  size?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export default function TIcon({ name, size = 'medium', style, className }: TIconProps) {
  return <Icon name={name} size={size} style={style} className={className} />;
}
