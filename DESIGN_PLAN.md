# Plano de Design - Contato Seguro Slim

## Entendimento do Produto (PRD)
O sistema atual carece de uma gestão centralizada de pessoas e de rastreabilidade nos relatos. O objetivo é implementar o cadastro global de pessoas (independente de empresas) e permitir o vínculo dessas pessoas aos relatos através de papéis específicos (relatante, testemunha, vítima, denunciado). A presença ou ausência de um "relatante" ditará se o caso é tratado como anônimo ou identificado.

## Solução Proposta e Decisões de UI/UX
A premissa técnica principal é que o back-end não sofrerá alterações. Toda a lógica de formatação, prevenção de erros e usabilidade será absorvida pelo front-end (React + Ant Design). Para garantir a melhor experiência operacional, adotaremos as seguintes estratégias:

### Épico 1: Gestão de Pessoas
1. **Interface Principal:** Nova rota `/people` com uma tabela de listagem (Ant Design `Table`) exibindo Nome, CPF, E-mail e Data de Nascimento.
2. **Formulário:** Inclusão/Edição via `Modal` para manter o usuário no contexto da listagem.
3. **Máscaras e Formatação:** Aplicação de máscara visual no CPF (`000.000.000-00`) e Data de Nascimento (`DD/MM/YYYY`), com remoção de pontuação, barras e traços no momento do payload para a API, que exige exatamente 11 dígitos numéricos no caso do CPF. Para o caso da Data de Nascimento, uso da biblioteca `dayjs` junto ao `DatePicker` para garantir o envio da data no formato `YYYY-MM-DD`.
4. **Fail-Fast (Prevenção de 409):** Interceptação do status HTTP 409 (Conflict) no cadastro. Caso o CPF já exista, a UI exibirá uma notificação amigável (Ant Design `message`), evitando o vazamento de erros genéricos de servidor para o usuário.

### Épico 2: Envolvimentos no Relato
1. **Interface Principal:** Inclusão de uma nova seção/aba "Envolvidos" na tela já existente de Detalhes do Relato.
2. **Identidade Visual Semântica:** Utilização de `Tags` do Ant Design para rápida identificação visual dos envolvidos, ex: whistleblower (Relatante): Verde, witness (Testemunha): Azul, victim (Vítima): Laranja, denounced (Denunciado): Vermelho.
3. **UX Preventiva no Vínculo:** No formulário de vínculo, o `Select` de seleção de pessoas filtrará ativamente os dados, ocultando pessoas que já estão vinculadas ao relato atual. Isso previne o erro 409 de duplicidade de pessoa no mesmo relato.
4. **Indicador de Anonimato:** Inclusão de uma nova coluna na tela principal de Relatos, chamada "Relatante" e uma `Badge` de destaque no cabeçalho de edição do relato. O estado alternará dinamicamente entre "Anônimo" e "Identificado". Os dados serão exibidos com base no booleano `is_anonymous` retornado pela API de envolvimentos.
5. **Vínculo Otimizado:** O select de adição de envolvidos possuirá busca integrada (Search) para facilitar a localização por nome ou CPF em grandes volumes de dados.

## Mapeamento de Riscos e Mitigações
1. **Deleção em Cascata (Integridade Referencial):** A exclusão de uma Pessoa (Épico 1) que possui vínculo ativo em um Relato (Épico 2) pode gerar violação de chave estrangeira no back-end. **Mitigação:** Tratamento do erro no front-end no momento em que o usuário selecionar a opção de exclusão de uma determinada pessoa. Será realizada uma consulta, e caso a pessoa esteja vinculada a pelo menos um Relato, será exibida uma mensagem de confirmação severa, informando ao usuário que a exclusão daquela pessoa pode impactar na integridade referencial dos dados.
2. **Imutabilidade do Envolvimento:** A API não possui rota `PUT` para atualizar o papel de um envolvido. **Mitigação:** A interface não exibirá opção de edição no vínculo, apenas a ação de exclusão (Delete) para que o usuário crie um novo caso tenha errado.
3. **Formatação de valores:** Alguns dados exibidos no sistema, não contam com formatação, como CPF, CNPJ e Data de Nascimento. Para melhorar a visualização eles serão formatados integralmente no sistema. Tanto na consulta quanto nas modais de inclusão e edição dos dados. Também será aplicada a limpeza dos valores, para evitar caracteres indesejados.