import { twMerge } from "tailwind-merge";

const Key = (props) => {
    const { className, children, ...rest } = props;

    return (
        <div
            className={twMerge(
                "size-14 bg-neutral-300 inline-flex border-white/10 px-3 py-1.5 rounded-2xl text-black/80 justify-center items-center",
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
};

export default Key;
