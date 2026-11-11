import Link from "next/link";
import FormAuth from "../FormAuth";

export const metadata = { title: "Cadastro · Caderno do Professor" };

export default function Cadastro() {
  return <FormAuth titulo="Criar sua conta" sub="Cada professor tem o próprio caderno. Seus dados ficam só com você." url="/api/auth/cadastro" botao="Criar conta"
    campos={[
      { nome: "nome", rotulo: "Seu nome", auto: "name" },
      { nome: "email", rotulo: "E-mail", tipo: "email", auto: "email" },
      { nome: "senha", rotulo: "Senha (mínimo 8 caracteres)", tipo: "password", auto: "new-password" },
      { nome: "escola", rotulo: "Escola", auto: "organization", opcional: true },
    ]}
    rodape={<>Já tem conta? <Link href="/entrar">Entrar</Link></>} />;
}
