import Link from "next/link";
import LoginButton from "./ui/LoginButton";

export default function Header() {
	return (
		<header className="flex items-center justify-between h-16 px-4 md:px-18 lg:px-58 bg-[#0a0a0a] border-b-2 border-b-[#e63946] shrink-0 z-20 relative">
			<Link
				href="/"
				className="font-['Bebas_Neue'] text-[26px] text-white tracking-[3px] flex items-center gap-2.5 no-underline"
			>
				<span className="w-2.5 h-2.5 bg-[#e63946] rounded-full inline-block"></span>
				Seu<em className="text-[#e63946] italic">Negócio</em>
			</Link>
			<nav className="flex gap-2 items-center">
				<LoginButton />
			</nav>
		</header>
	);
}
