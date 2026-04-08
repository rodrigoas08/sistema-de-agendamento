"use client";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";

interface ButtonProps {
	text: string;
	onClick?: () => void;
	className?: string;
	type?: "button" | "submit" | "reset";
}

const Button = ({ text, onClick, className, type = "button" }: ButtonProps) => {
	return (
		<button
			type={type}
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
