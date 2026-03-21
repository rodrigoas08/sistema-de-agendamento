"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const loginSchema = z.object({
	usuario: z
		.string()
		.min(1, "Campo obrigatório")
		.email("Usuário deve ser um e-mail válido"),
	senha: z.string().min(1, "Campo obrigatório"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [loginError, setLoginError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		mode: "onSubmit",
	});

	const usuarioValue = watch("usuario");
	const senhaValue = watch("senha") || "";

	const onSubmit = async (data: LoginFormValues) => {
		setLoginError("");
		setIsLoading(true);
		const supabase = createClient();
		const { error } = await supabase.auth.signInWithPassword({
			email: data.usuario,
			password: data.senha,
		});
		setIsLoading(false);
		if (error) {
			setLoginError("E-mail ou senha incorretos.");
			return;
		}
		window.location.href = "/admin";
	};

	const handleGoogleLogin = async () => {
		const supabase = createClient();
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${location.origin}/auth/callback`,
			},
		});
	};

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	}, [isOpen]);

	return (
		<>
			<Button
				text="LOGIN"
				onClick={() => setIsOpen(true)}
				className="w-25 cursor-pointer"
			/>

			{isOpen && (
				<div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
					<button
						onClick={() => setIsOpen(false)}
						className="absolute top-6 right-6 p-2 text-gray-800 hover:bg-gray-100 rounded-full"
					>
						<X size={24} />
					</button>

					<div className="w-full max-w-md bg-white rounded-lg">
						<h2 className="text-3xl font-black text-center mb-8 text-black">
							Acesso Administrativo
						</h2>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col">
							<div className="w-full flex flex-col items-center">
								<button
									type="button"
									onClick={handleGoogleLogin}
									className="flex items-center justify-center gap-3 w-full border-2 border-gray-200 hover:border-black hover:bg-gray-50 text-black font-bold py-3.5 rounded transition-all tracking-wide"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="w-5 h-5"
									>
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
									Continuar com Google
								</button>
								<div className="flex items-center gap-3 w-full my-6 text-sm text-gray-400 font-semibold before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200 uppercase">
									Ou entre usando senha
								</div>
							</div>

							<div>
								<label className="block text-sm font-bold text-gray-700 mb-1">Usuário</label>
								<div className="relative">
									<input
										type="text"
										{...register("usuario")}
										className={cn(
											"w-full pl-4 pr-10 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-black",
											errors.usuario && "border-red-500",
										)}
										placeholder="seu@email.com"
									/>
									{usuarioValue && (
										<button
											type="button"
											onClick={() => setValue("usuario", "", { shouldValidate: true })}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
										>
											<X size={18} />
										</button>
									)}
								</div>
								{errors.usuario && (
									<p className="text-red-500 text-xs mt-1 font-semibold">
										{errors.usuario.message}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
								<div className="relative">
									<input
										type="password"
										{...register("senha")}
										className={cn(
											"w-full pl-4 pr-10 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-black",
											errors.senha && "border-red-500",
										)}
										placeholder="Sua senha"
									/>
									{senhaValue && (
										<button
											type="button"
											onClick={() => setValue("senha", "", { shouldValidate: true })}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
										>
											<X size={18} />
										</button>
									)}
								</div>
								{errors.senha && (
									<p className="text-red-500 text-xs mt-1 font-semibold">
										{errors.senha.message}
									</p>
								)}
							</div>

							{loginError && (
								<p className="text-red-500 text-sm font-bold text-center bg-red-50 border border-red-200 rounded px-3 py-2">
									{loginError}
								</p>
							)}

							<div className="w-full flex flex-col items-end">
								<button
									type="submit"
									disabled={isLoading}
									className="flex items-center justify-center w-full mt-4 py-4 text-white font-bold bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded transition-colors tracking-wide"
								>
									{isLoading ? (
										<Loader2 className="animate-spin" />
									) : (
										"ENTRAR NA ÁREA ADMINISTRATIVA"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
