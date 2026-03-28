import Link from "next/link";
import Image from "next/image";
import LoginButton from "./ui/LoginButton";

interface HeaderProps {
	imageLogo?: string;
}

export default function Header({ imageLogo }: HeaderProps) {
	return (
		<header className="flex items-center justify-between h-16 px-4 md:px-18 lg:px-58 bg-[#0a0a0a] border-b-2 border-b-[#e63946] shrink-0 z-20 relative">
			<Link
				href="/"
				className="flex items-center gap-2.5 font-['Bebas_Neue'] text-xl md:text-[26px]  text-white tracking-[2px]  no-underline"
			>
				{imageLogo ? (
					<Image src={imageLogo} alt="Logo" width={50} height={50} />
				) : (
					<>
						<span>
							SEU <em className="text-[#e63946] italic">NEGÓCIO</em>
						</span>
					</>
				)}
			</Link>
			<nav className="flex gap-2 items-center">
				<LoginButton />
			</nav>
		</header>
	);
}
