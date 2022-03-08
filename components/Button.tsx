import { ButtonHTMLAttributes, FC, ReactElement } from 'react';

export enum ButtonType {
  Primary,
  Secondary,
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  buttonType: ButtonType;
  onClick?: () => void | Promise<void>;
}

const colorMappings: Record<ButtonType, `bg-${string}-${number}`> = {
  [ButtonType.Primary]: 'bg-blue-500',
  [ButtonType.Secondary]: 'bg-green-500',
};

const Button: FC<ButtonProps> = ({
  label,
  buttonType,
  ...props
}: ButtonProps) => {
  const classes = `${colorMappings[buttonType]} rounded-full px-3 py-1 my-2`;
  return (
    <button className={classes} {...props}>
      {label}
    </button>
  );
};

export default Button;
