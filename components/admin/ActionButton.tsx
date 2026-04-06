import React from "react";
import Link from "next/link";

interface ActionButtonProps {
	icon: React.ReactNode;
	title?: string;
	onClick?: () => void;
	href?: string;
	className?: string;
	disabled?: boolean;
	target?: string;
	rel?: string;
	children?: React.ReactNode;
	mobileActionBtn?: boolean;
}

/**
 * Botão de ação reutilizável para o painel administrativo.
 * Suporta tanto o comportamento de botão quanto o de link (usando Next.js Link).
 * Segue o padrão estético definido no projeto.
 */
export default function ActionButton({
	icon,
	title,
	onClick,
	href,
	className = "",
	disabled = false,
	target,
	rel,
	children,
	mobileActionBtn,
}: ActionButtonProps) {
	// Estilização base: layout > box > visual > interativo
	const baseClasses = `
		flex items-center justify-center gap-2
		w-max md:w-8 md:h-8 p-2
		rounded border-2 border-gray-200 
		text-sm 
		transition-all 
		${disabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer"}
		${
		mobileActionBtn &&
		"flex flex-1 items-center justify-center gap-1.5 py-2 rounded border-2 border-gray-200 font-['Barlow_Condensed'] text-xs font-semibold tracking-[1.5px] transition-all"
	}
		${className}
	`
		.replace(/\s+/g, " ")
		.trim();

	if (href && !disabled) {
		return (
			<Link
				href={href}
				title={title}
				target={target}
				rel={rel}
				className={baseClasses}
			>
				{icon}
				{children}
			</Link>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={baseClasses}
		>
			{icon}
			{children}
		</button>
	);
}
