/**
 * Formata um número de telefone brasileiro (fixo ou celular)
 * Ex: 11999999999 -> (11) 99999-9999
 * Ex: 1188888888 -> (11) 8888-8888
 */
export function formatPhone(value: string | undefined | null): string {
	if (!value) return "";

	// Remove tudo o que não é dígito
	const digits = value.replace(/\D/g, "");

	// Limita a 11 dígitos
	const clamped = digits.slice(0, 11);

	if (clamped.length <= 2) {
		return clamped.length > 0 ? `(${clamped}` : clamped;
	}
	if (clamped.length <= 6) {
		return `(${clamped.slice(0, 2)}) ${clamped.slice(2)}`;
	}
	if (clamped.length <= 10) {
		return `(${clamped.slice(0, 2)}) ${clamped.slice(2, 6)}-${clamped.slice(6)}`;
	}
	return `(${clamped.slice(0, 2)}) ${clamped.slice(2, 7)}-${clamped.slice(7)}`;
}

/**
 * Remove formatação de telefone para salvar no banco
 * Ex: (11) 99999-9999 -> 11999999999
 */
export function unformatPhone(value: string): string {
	return value.replace(/\D/g, "");
}

/**
 * Formata um número para moeda brasileira
 * Ex: 1000 -> R$ 1.000,00
 */
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}
