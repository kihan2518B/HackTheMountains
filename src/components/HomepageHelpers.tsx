import { IconType } from "react-icons";

interface FeatureCardProps {
    title: string;
    description: string;
    Icon: IconType;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, Icon }) => (
    <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-6">
            <Icon className="text-5xl text-ColorOne mr-4" />
            <h3 className="text-2xl font-semibold text-ColorTwo">{title}</h3>
        </div>
        <p className="text-lg text-ColorThree">{description}</p>
    </div>
);


interface BenefitCardProps {
    index: number;
    title: string;
    description: string;
    Icon: IconType;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ index, title, description, Icon }) => (
    <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-6">
            <Icon className="text-5xl text-ColorOne mr-4" />
            <h3 className="text-2xl font-semibold text-ColorTwo">{title}</h3>
        </div>
        <p className="text-lg text-ColorThree mb-6">{description}</p>
    </div>
);


interface ScreenshotCardProps {
    imageUrl: string;
    description: string;
}

export const ScreenshotCard: React.FC<ScreenshotCardProps> = ({ imageUrl, description }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <img src={imageUrl} alt={description} className="w-full h-64 object-cover" />
        <div className="p-6">
            <p className="text-xl text-ColorTwo font-semibold">{description}</p>
        </div>
    </div>
);


import { UseFormRegister } from "react-hook-form";

interface InputFieldProps {
    label: string;
    name: string;
    register: UseFormRegister<any>;
    error?: {
        message?: string;
    };
}

export const InputField: React.FC<InputFieldProps> = ({ label, name, register, error }) => (
    <div>
        <label className="block text-lg mb-2 font-semibold">{label}</label>
        <input
            type="text"
            className="w-full p-3 border border-ColorThree rounded-lg focus:outline-none focus:ring-2 focus:ring-ColorOne"
            {...register(name, { required: true })}
        />
        {error && <p className="text-red-500 mt-1">{error.message}</p>}
    </div>
);

interface TextareaFieldProps {
    label: string;
    name: string;
    register: UseFormRegister<any>;
    error?: {
        message?: string;
    };
}

export const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, register, error }) => (
    <div>
        <label className="block text-lg mb-2 font-semibold">{label}</label>
        <textarea
            className="w-full p-3 border border-ColorThree rounded-lg focus:outline-none focus:ring-2 focus:ring-ColorOne"
            rows={4}
            {...register(name, { required: true })}
        />
        {error && <p className="text-red-500 mt-1">{error.message}</p>}
    </div>
);


interface ButtonProps {
    type: "button" | "submit" | "reset";
    className?: string;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ type, className, children }) => (
    <button type={type} className={className}>
        {children}
    </button>
);
