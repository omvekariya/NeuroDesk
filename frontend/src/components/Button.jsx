import { twMerge } from "tailwind-merge";

const Button = (props) => {
    const { variant = "primary", className, size, children, ...rest } = props;

    const baseClasses = "border h-12 rounded-full px-6 font-medium";
    const variantClasses = {
        primary: "bg-lime-400 text-neutral-950 border-lime-400",
        secondary: "border-gray-300 text-gray-700 bg-transparent",
    };
    const sizeClasses = {
        sm: "h-10",
        default: "h-12",
    };

    const classes = twMerge(
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.default,
        className
    );

    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
};

export default Button;
