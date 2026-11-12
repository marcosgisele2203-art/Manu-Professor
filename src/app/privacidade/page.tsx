import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacidade · Manu Professor" };

export default function Privacidade() {
  const contato = process.env.CONTATO_EMAIL;
  return (
    <main className="content" style={{ marginInline: "auto", maxWidth: 760 }}>
      <div><span className="eyebrow">Manu Professor</span><h1>Privacidade e termos de uso</h1>
        <p className="muted">Como o Manu Professor trata os seus dados e os dos seus alunos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p></div>
      <section className="panel doc-legal">
        <h2>Quais dados guardamos</h2>
        <p><b>Do professor:</b> nome, e-mail, escola (se informada) e senha, guardada de forma criptografada.</p>
        <p><b>Dos alunos:</b> apenas o que o professor cadastra para o próprio trabalho: nome, presenças, notas e entregas de atividades. Não pedimos documentos, endereço, telefone nem dados dos responsáveis.</p>
        <p><b>Materiais:</b> planos de aula, atividades, questões e provas criados pelo professor.</p>

        <h2>Quem vê os dados</h2>
        <p>Cada professor vê somente os próprios dados. O administrador do sistema vê apenas o nome, o e-mail e a escola dos professores e a quantidade de uso da inteligência artificial, nunca as turmas, os alunos ou as notas.</p>

        <h2>Inteligência artificial</h2>
        <p>As funções de IA usam o Claude, da Anthropic. Para gerar um conteúdo, enviamos o tema, a série, a disciplina e o texto que o professor escreveu. <b>Os nomes dos alunos não são enviados à IA.</b> A Anthropic não usa esses dados para treinar seus modelos pelo uso via API.</p>
        <p>O conteúdo gerado pela IA é uma sugestão. O professor deve revisar tudo antes de usar com os alunos.</p>

        <h2>Google Drive</h2>
        <p>Se você usar o botão de salvar no Google Drive, o Manu Professor pede permissão à sua conta Google apenas para criar arquivos no seu Drive (permissão &quot;drive.file&quot;). O sistema não lê, não altera e não apaga nenhum outro arquivo seu, e não guarda o acesso depois que você fecha a página.</p>

        <h2>Responsabilidade do professor</h2>
        <p>Ao cadastrar alunos, o professor confirma que usa esses dados para fins pedagógicos, dentro das atribuições dele na escola, e que não cadastra informações além das necessárias (como dados de saúde ou laudos).</p>

        <h2>Seus direitos</h2>
        <p>Você pode corrigir ou apagar turmas, alunos e materiais a qualquer momento dentro do sistema. Para apagar a sua conta inteira ou pedir uma cópia dos seus dados{contato ? <>, escreva para <b>{contato}</b></> : ", fale com o administrador do sistema"}.</p>

        <h2>Segurança</h2>
        <p>O acesso é protegido por senha e a conexão é criptografada (HTTPS). Os dados ficam em servidor próprio, com acesso restrito.</p>
      </section>
      <p className="small muted">Este texto é um modelo inicial. Antes de divulgar para a rede de ensino, peça a revisão de um advogado ou do encarregado de dados da Secretaria de Educação.</p>
      <div><Link className="btn" href="/cadastro">Voltar</Link></div>
    </main>
  );
}
