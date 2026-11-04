# Documentação de testes
(vídeos e imagens anexadas na pasta test-docs)

## Épico 1: Gestão de Pessoas

### Cenário 1.1: Cadastro de Pessoa e Sanitização de Máscaras
* **O que foi testado:** Criação de um novo registro de pessoa validando a aplicação de máscaras visuais (CPF e Data) e a limpeza dos dados antes do envio para a API.
* **Como foi testado:** 
  1. Acessei a rota `/people` e abri o modal de cadastro.
  2. Preenchi os dados. Digitei o CPF com pontuação (`123.123.123-12`) e a Data de Nascimento no formato local (`DD/MM/YYYY`).
  3. Cliquei em Cadastrar.
  4. Inspecionei o payload na aba Network do navegador para garantir que o CPF foi enviado apenas com números (`12312312312`) e a data no formato ISO (`YYYY-MM-DD`).
* **Qual era o resultado esperado:** A interface aplicar as máscaras durante a digitação, a requisição ser enviada com os dados limpos e o usuário aparecer na listagem.
* **Qual foi o resultado obtido:** As máscaras funcionaram corretamente, o payload foi sanitizado no submit e a nova pessoa foi renderizada na tabela com sucesso.
* **Vídeo:** (teste-docs/gravacaoCenario1CadastramentoPessoa.mkv)

### Cenário 1.2: Edição de Pessoa Existente
* **O que foi testado:** Atualização dos dados de um cadastro existente.
* **Como foi testado:** 
  1. Na listagem de pessoas, cliquei no botão de editar de um registro existente.
  2. Alteri o e-mail e o nome da pessoa.
  3. Salvei as alterações.
* **Qual era o resultado esperado:** O modal fechar, a listagem ser atualizada com os novos dados e o campo `updated_at` (se visível/auditado) refletir a mudança.
* **Qual foi o resultado obtido:** Os dados foram atualizados com sucesso e a listagem refletiu a edição imediatamente.
* **Vídeo:** (teste-docs/gravacaoCenario2EdicaoPessoaExistente.mkv)

### Cenário 1.3: Exclusão de Pessoa sem Vínculos
* **O que foi testado:** Exclusão de uma pessoa que não está vinculada a nenhum relato.
* **Como foi testado:** 
  1. Na listagem, cliquei na ação de excluir de um registro recém-criado.
  2. Confirmei a exclusão no modal de aviso.
* **Qual era o resultado esperado:** A requisição de DELETE retornar sucesso e o registro sumir da tabela.
* **Qual foi o resultado obtido:** O registro foi excluído e removido da listagem corretamente.
* **Vídeo:** (teste-docs/gravacaoCenario3ExclusaoDePessoaSemVinculos.mkv)

### Cenário 1.4: Tentativa de exclusão de pessoa com vínculo
* **O que foi testado:** Tentativa de exclusão de uma pessoa que está vinculada a um relato.
* **Como foi testado:** 
  1. Na listagem de pessoas, cliquei na ação de excluir de um registro que está vinculado a um relato.
  2. Confirmei a exclusão no modal de aviso.
* **Qual era o resultado esperado:** A requisição de DELETE retornar sucesso e o registro sumir da tabela.
* **Qual foi o resultado obtido:** O registro foi excluído e removido da listagem corretamente.
* **Vídeo:** (teste-docs/gravacaoCenario4ExclusaoDePessoaComVinculo.mkv)

## Épico 2: Envolvimento

### Cenário 2.1: Vínculo de Envolvido e Identidade Visual (Caminho Feliz)
* **O que foi testado:** A criação de um vínculo entre uma pessoa e um relato, verificando a listagem correta e a aplicação da identidade visual (Tags semânticas) por papel.
* **Como foi testado:** 
  1. Acessei a tela de detalhes de um relato.
  2. Na aba de "Envolvidos", abri a opção para vincular uma pessoa.
  3. Selecionei um cadastro existente via busca (Search) e escolhi o papel "Testemunha" (`witness`).
  4. Salvei o vínculo.
* **Qual era o resultado esperado:** A requisição `POST` retornar sucesso e a pessoa aparecer imediatamente na listagem do relato com a Tag de cor Azul ("Testemunha").
* **Qual foi o resultado obtido:** Vínculo criado com sucesso e a Tag Azul foi renderizada corretamente na listagem, confirmando a semântica visual.
* **Vídeo:** (teste-docs/gravacaoCenario2.1CadastramentoDeVinculoDePessoaAUmRelato.mkv)

### Cenário 2.2: Transição Dinâmica do Status de Anonimato
* **O que foi testado:** A regra de negócio que dita que um relato sem um Relatante (`whistleblower`) deve ser tratado como anônimo, validando a reatividade da interface.
* **Como foi testado:** 
  1. Acessei um relato sem relatante e verifiquei a Badge do cabeçalho indicando "Anônimo".
  2. Adicionei uma pessoa com o papel "Relatante" (`whistleblower`).
  3. Verifiquei a mudança da Badge.
  4. Excluí o vínculo desse relatante (disparando `DELETE`) e verifiquei a Badge novamente.
* **Qual era o resultado esperado:** O cabeçalho refletir imediatamente o booleano `is_anonymous` da API após cada mutação, atualizando a Badge para "Identificado" ao adicionar o relatante e voltando para "Anônimo" após a exclusão.
* **Qual foi o resultado obtido:** A Badge atualizou dinamicamente sem necessidade de recarregar a página, respeitando a regra de anonimato do back-end.
* **Vídeo:** (teste-docs/gravacaoCenario2.2TransicaoDinamicaDoStatusDeAnonimato.mkv)

### Cenário 2.3: Prevenção de Duplicidade (UX Preventiva e Erro 409)
* **O que foi testado:** O bloqueio de vinculação de uma mesma pessoa mais de uma vez no mesmo relato.
* **Como foi testado:** 
  1. Acessei um relato que já possuía uma pessoa específica vinculada.
  2. Abri o Select de seleção de pessoas para tentar adicioná-la novamente.
  3. Verifiquei se o nome dela aparecia na lista de opções.
* **Qual era o resultado esperado:** Como UX preventiva, o Select deve filtrar ativamente a lista e ocultar pessoas já vinculadas àquele relato. Caso o vínculo fosse forçado, a API deveria retornar HTTP 409 Conflict.
* **Qual foi o resultado obtido:** O front-end filtrou a pessoa corretamente, ocultando-a do dropdown e impedindo o usuário de cometer o erro de duplicidade proativamente.
* **Vídeo:** (teste-docs/gravacaoCenario2.3PrevencaoDeDuplicidade.mkv)