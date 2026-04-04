import { cn } from "@/lib/utils";

interface ButtonProps {
	disabled?: boolean;
	handleNext: () => void;
	text: string | React.ReactNode;
	className?: string;
}

export default function Button({
	disabled,
	handleNext,
	text,
	className,
}: ButtonProps) {
	return (
		<button
			disabled={disabled}
			onClick={handleNext}
			className={cn(
				"flex items-center justify-center gap-2.5 w-full lg:px-55 py-4 rounded-md bg-[#e63946] font-['Bebas_Neue'] text-white text-xs lg:text-[20px] tracking-[2px] cursor-pointer transition-all hover:bg-[#c1121f] hover:-translate-y-px disabled:bg-[#e0e0e0] disabled:text-[#c4c4c4] disabled:cursor-not-allowed disabled:transform-none",
				className,
			)}
		>
			{text}
		</button>
	);
}
