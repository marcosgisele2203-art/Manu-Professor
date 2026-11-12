import Link from "next/link";
import FormAuth from "../FormAuth";
import { googleConfigurado } from "@/lib/google";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cadastro · Manu Professor" };

export default async function Cadastro({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const { google } = await searchParams;
  return <FormAuth cadastro googleClientId={googleConfigurado() ? process.env.GOOGLE_CLIENT_ID : undefined} aviso={google ? "Você ainda não tem conta. Marque o aceite abaixo e clique de novo em Continuar com Google." : undefined} titulo="Criar sua conta" sub="Cada professor tem o próprio espaço. Seus dados ficam só com você." url="/api/auth/cadastro" botao="Criar conta"
    campos={[
      { nome: "nome", rotulo: "Seu nome", auto: "name" },
      { nome: "email", rotulo: "E-mail", tipo: "email", auto: "email" },
      { nome: "senha", rotulo: "Senha (mínimo 8 caracteres)", tipo: "password", auto: "new-password" },
      { nome: "escola", rotulo: "Escola", auto: "organization", opcional: true },
    ]}
    extra={<label className="auth-check"><input type="checkbox" name="aceite" required /><span>Li e aceito a <Link href="/privacidade" target="_blank">política de privacidade e os termos de uso</Link>.</span></label>}
    rodape={<>Já tem conta? <Link href="/entrar">Entrar</Link></>} />;
}
