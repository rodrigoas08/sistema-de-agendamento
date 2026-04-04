"use client";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";

interface ButtonProps {
	text: string;
	onClick: () => void;
	className?: string;
}

const Button = ({ text, onClick, className }: ButtonProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center justify-center w-fit h-fit gap-2 px-2 py-1 bg-red-500 text-[#fafafa] font-bold rounded-md",
				className,
			)}
		>
			<LogIn size={16} /> <p className="text-base">{text}</p>
		</button>
	);
};

export default Button;
