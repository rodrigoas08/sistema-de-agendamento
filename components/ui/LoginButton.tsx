"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
	loja: z.string().min(1, "Campo obrigatório").max(50, "Máximo de 50 caracteres"),
	usuario: z
		.string()
		.min(1, "Campo obrigatório")
		.email("Usuário deve ser um e-mail válido"),
	senha: z
		.string()
		.min(8, "A senha deve ter no mínimo 8 caracteres")
		.regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
		.regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
		.regex(/[0-9]/, "A senha deve conter pelo menos um número")
		.regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginButton() {
	const [isOpen, setIsOpen] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isValid, isSubmitted },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		mode: "onSubmit",
	});

	const lojaValue = watch("loja");
	const usuarioValue = watch("usuario");
	const senhaValue = watch("senha") || "";

	const passRequirements = [
		{ regex: /.{8,}/, text: "No mínimo 8 caracteres" },
		{ regex: /[A-Z]/, text: "Uma letra maiúscula" },
		{ regex: /[a-z]/, text: "Uma letra minúscula" },
		{ regex: /[0-9]/, text: "Um número" },
		{ regex: /[^A-Za-z0-9]/, text: "Um caractere especial" },
	];

	const onSubmit = (data: LoginFormValues) => {
		console.log("Login validado com sucesso:", data);
		setIsOpen(false);
	};

	return (
		<>
			<Button text="LOGIN" onClick={() => setIsOpen(true)} className="w-25" />

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
							<div>
								<label className="block text-sm font-bold text-gray-700 mb-1">Sua loja</label>
								<div className="relative">
									<input
										type="text"
										{...register("loja")}
										className={cn(
											"w-full pl-4 pr-10 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-black",
											errors.loja && "border-red-500",
										)}
										placeholder="Nome ou ID da loja"
									/>
									{lojaValue && (
										<button
											type="button"
											onClick={() => setValue("loja", "", { shouldValidate: true })}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
										>
											<X size={18} />
										</button>
									)}
								</div>
								{errors.loja && (
									<p className="text-red-500 text-xs mt-1 font-semibold">{errors.loja.message}</p>
								)}
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
								<div className="mt-3 flex flex-col gap-1 text-xs font-semibold">
									{passRequirements.map((req, i) => {
										const isReqValid = req.regex.test(senhaValue);
										return (
											<span
												key={i}
												className={cn(
													"flex items-center gap-1 transition-colors",
													isReqValid ? "text-green-600" : "text-gray-400",
												)}
											>
												<span className="w-4">{isReqValid ? "✓" : "○"}</span>
												{req.text}
											</span>
										);
									})}
								</div>
							</div>

							{isSubmitted && !isValid && (
								<p className="text-red-500 text-sm font-bold text-center">
									É preciso preencher todos os campos corretamente.
								</p>
							)}

							<div className="w-full flex flex-col items-end">
								<button
									type="submit"
									onClick={() => console.log("Botão de login acionado")}
									className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded transition-colors tracking-wide mt-4"
								>
									ENTRAR NA ÁREA ADMINISTRATIVA
								</button>
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										console.log("Esqueci a senha");
									}}
									className="mt-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
								>
									Esqueceu a senha?
								</a>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
