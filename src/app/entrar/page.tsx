import Link from "next/link";
import FormAuth from "../FormAuth";

export const metadata = { title: "Entrar · Caderno do Professor" };

export default function Entrar() {
  return <FormAuth titulo="Entrar" sub="Acesse suas turmas, notas e planejamentos." url="/api/auth/login" botao="Entrar"
    campos={[{ nome: "email", rotulo: "E-mail", tipo: "email", auto: "email" }, { nome: "senha", rotulo: "Senha", tipo: "password", auto: "current-password" }]}
    rodape={<>Ainda não tem conta? <Link href="/cadastro">Cadastre-se</Link></>} />;
}
