import Link from "next/link";
import FormAuth from "../FormAuth";
import { googleConfigurado } from "@/lib/google";

export const dynamic = "force-dynamic";

export const metadata = { title: "Entrar · Manu Professor" };

export default function Entrar() {
  return <FormAuth googleClientId={googleConfigurado() ? process.env.GOOGLE_CLIENT_ID : undefined} titulo="Entrar" sub="Acesse suas turmas, notas e planejamentos." url="/api/auth/login" botao="Entrar"
    campos={[{ nome: "email", rotulo: "E-mail", tipo: "email", auto: "email" }, { nome: "senha", rotulo: "Senha", tipo: "password", auto: "current-password" }]}
    rodape={<>Ainda não tem conta? <Link href="/cadastro">Cadastre-se</Link>
      <details className="esqueci"><summary>Esqueci minha senha</summary>
        <p>Peça ao administrador do Manu Professor da sua escola uma <b>senha provisória</b>{process.env.CONTATO_EMAIL ? <> (<a href={`mailto:${process.env.CONTATO_EMAIL}`}>{process.env.CONTATO_EMAIL}</a>)</> : null}. Com ela você entra e cria uma senha nova.</p>
        <p>Se você criou a conta com o Google, use o botão <b>Continuar com Google</b>: não precisa de senha.</p></details></>} />;
}
