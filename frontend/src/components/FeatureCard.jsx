import { twMerge } from "tailwind-merge";

const FeatureCard = (props) => {
    const { title, description, children, className } = props;

    return (
        <div
            className={twMerge(
                "bg-white border border-gray-200 p-6 rounded-3xl cursor-pointer shadow-sm hover:shadow-md transition-shadow",
                className
            )}
        >
            <div className="aspect-video ">{children}</div>
            <div>
                <h3 className="text-3xl font-medium mt-6 text-gray-900">{title}</h3>
                <p className="text-gray-600 mt-2">{description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;
