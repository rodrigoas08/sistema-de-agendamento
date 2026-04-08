import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login | Área Administrativa",
	description: "Acesse a área administrativa para gerenciar seus agendamentos.",
};

/**
 * Login Page - Dedicated route for user authentication
 * 
 * @returns {JSX.Element} The rendered login page
 */
export default function LoginPage() {
	return (
		<main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-red-500 selection:text-white">
			{/* Decorative background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
				<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
			</div>
			
			<div className="relative z-10 w-full flex justify-center">
				<LoginForm />
			</div>
		</main>
	);
}
