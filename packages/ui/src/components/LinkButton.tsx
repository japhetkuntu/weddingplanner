import { Link, type LinkProps } from "react-router-dom";
import { buttonClassNames, type ButtonVariant, type ButtonSize } from "./Button";

export interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A react-router Link styled exactly like <Button> — for navigation that should look like an action. */
export function LinkButton({ variant = "primary", size = "md", className, ...props }: LinkButtonProps) {
  return <Link className={buttonClassNames(variant, size, className)} {...props} />;
}
