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
        <p><b>Do professor:</b> nome, e-mail, foto (se enviada ou vinda da conta Google), escolas, etapas e disciplinas informadas no perfil, e senha, guardada de forma criptografada.</p>
        <p><b>Dos alunos:</b> apenas o que o professor cadastra para o próprio trabalho: nome, presenças, notas e entregas de atividades. Não pedimos documentos, endereço, telefone nem dados dos responsáveis.</p>
        <p><b>Materiais:</b> horário, calendário, diário, planos de aula, atividades, questões, provas, materiais e slides criados pelo professor.</p>

        <h2>Quem vê os dados</h2>
        <p>Cada professor vê somente os próprios dados.</p>
        <p>O <b>administrador</b> do sistema (responsável técnico) vê no painel apenas o nome, o e-mail e as escolas dos professores e a quantidade de uso da inteligência artificial. Para que nada se perca em caso de falha, o sistema faz todos os dias uma <b>cópia de segurança completa</b> (inclusive turmas, alunos, frequência e notas), guardada no Google Drive do administrador. O administrador pode baixar e restaurar essa cópia; ela deve ser usada somente para recuperar dados, nunca para consultar ou repassar informações dos alunos.</p>

        <h2>Inteligência artificial</h2>
        <p>As funções de IA usam o Claude, da Anthropic. Para gerar um conteúdo, enviamos o que a função precisa: tema, série, disciplina, nome da turma, habilidades, recursos, datas do calendário e o texto que o professor escreveu. <b>A lista de alunos e as notas não são enviadas à IA.</b></p>
        <p>Algumas funções enviam <b>imagens ou arquivos</b> escolhidos pelo professor: na <b>correção por foto</b>, a foto da folha de respostas (que pode ter o nome do aluno escrito; a IA é instruída a ler só as marcações e o sistema não pede o nome); e na leitura do <b>calendário escolar</b> e das <b>habilidades</b>, o PDF ou print enviado. A foto da folha não fica guardada no sistema.</p>
        <p>A Anthropic não usa os dados enviados pela API para treinar seus modelos.</p>
        <p>O conteúdo gerado pela IA é uma sugestão. O professor deve revisar tudo antes de usar com os alunos.</p>

        <h2>Google Drive</h2>
        <p>Se você entrar com o Google, usamos apenas o seu nome e e-mail da conta Google para criar o seu cadastro.</p>
        <p>Para salvar seus arquivos no Google Drive, o Manu Professor pede permissão apenas para criar arquivos no seu Drive (permissão &quot;drive.file&quot;). Ele cria a pasta &quot;Manu Professor&quot; com as pastas das suas turmas e não lê, não altera e não apaga nenhum outro arquivo seu. Quando você entra com o Google, essa permissão fica guardada de forma criptografada para que você não precise autorizar de novo. Você pode retirá-la a qualquer momento em myaccount.google.com, na parte de apps conectados à sua conta.</p>

        <h2>Dados guardados no aparelho</h2>
        <p>Para funcionar sem internet, o sistema guarda no navegador do aparelho uma cópia dos dados do professor e as alterações que ainda não foram enviadas. Ao tocar em <b>Sair</b>, essa cópia é apagada. Use o sistema em aparelhos pessoais ou saia ao terminar em aparelhos compartilhados.</p>

        <h2>Responsabilidade do professor</h2>
        <p>Ao cadastrar alunos, o professor confirma que usa esses dados para fins pedagógicos, dentro das atribuições dele na escola, e que não cadastra informações além das necessárias (como dados de saúde ou laudos).</p>

        <h2>Seus direitos</h2>
        <p>Você pode corrigir ou apagar turmas, alunos e materiais a qualquer momento dentro do sistema. Para apagar a sua conta inteira ou pedir uma cópia dos seus dados{contato ? <>, escreva para <b>{contato}</b></> : ", fale com o administrador do sistema"}.</p>

        <h2>Segurança</h2>
        <p>O acesso é protegido por senha ou pela conta Google, e a conexão é criptografada (HTTPS). O acesso de administrador só vale para e-mails autorizados que entram pela conta Google. Os dados ficam em servidor próprio, com acesso restrito, e têm cópia de segurança diária.</p>
      </section>
      <p className="small muted">Este texto é um modelo inicial. Antes de divulgar para a rede de ensino, peça a revisão de um advogado ou do encarregado de dados da Secretaria de Educação.</p>
      <div><Link className="btn" href="/cadastro">Voltar</Link></div>
    </main>
  );
}
