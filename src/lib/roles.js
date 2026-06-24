// Papéis de usuário (controle simples por e-mail no client).
const SUPERADMIN_EMAILS = ["jasonaraujo321@gmail.com", "jasonaraujo321@hotmail.com"]

export function isSuperadmin(user) {
  const email = user?.email?.toLowerCase?.()
  return !!email && SUPERADMIN_EMAILS.includes(email)
}

export function roleLabel(user) {
  return isSuperadmin(user) ? "Superadmin" : "Usuário"
}

// Cargos pré-estabelecidos para membros da equipe.
// "Outros" abre um campo para digitar um cargo personalizado.
export const TEAM_ROLES = [
  "Advogado",
  "Coordenador",
  "Estagiário",
  "Recepcionista",
  "Sócio",
  "Assistente",
  "Financeiro",
  "Outros",
]
