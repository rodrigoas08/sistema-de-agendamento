import AgendamentoPage from "@/components/agendamento/AgendamentoFlow";

/**
 * Rota de agendamento no contexto do barbershop (dynamic segment)
 * Reutiliza o componente original que já consome o BarbershopContext
 */
export default function BarbershopAgendamento() {
	return <AgendamentoPage />;
}
