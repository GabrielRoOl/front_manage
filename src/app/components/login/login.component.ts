/**
 * COMPONENTE DE LOGIN
 * 
 * Responsável por:
 * - Exibir formulário de login com campos de email e senha
 * - Validar entrada do usuário antes de enviar
 * - Comunicar com o AuthService para fazer autenticação
 * - Mostrar mensagens de erro/sucesso ao usuário
 * - Redirecionar para dashboard após login bem-sucedido
 * 
 * ARQUITETURA:
 * - Standalone: true = Componente independente, sem NgModule
 * - Reactive Forms: Gerenciamento programático do formulário (melhor para lógica complexa)
 * 
 * FLUXO PRINCIPAL:
 * 1. Usuário preenche email e senha
 * 2. Clica "Entrar" → método submit() é chamado
 * 3. Valida se form é válido (todos campos obrigatórios preenchidos)
 * 4. Mostra spinner de carregamento (loading = true)
 * 5. Envia credenciais ao AuthService.login()
 * 6. Se sucesso: mostra mensagem e redireciona para home
 * 7. Se erro: mostra mensagem de erro extraída do servidor
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorParserService } from '../../shared/services/error-parser.service';

@Component({
  selector: 'app-login', // Usado como <app-login></app-login>
  standalone: true, // Componente independente sem NgModule
  imports: [CommonModule, ReactiveFormsModule], // Dependências do componente
  templateUrl: './login.component.html', // Template HTML
  styleUrls: ['./login.component.scss'] // Estilos SCSS
})
export class LoginComponent {
  /**
   * PROPRIEDADE: Formulário Reativo
   * 
   * FormGroup = Agrupamento de controles (campos) do formulário
   * 
   * Por que Reactive Forms?
   * - Controle total via TypeScript (não template)
   * - Fácil validação assíncrona e complexa
   * - Estado sempre sincronizado
   * - Melhor para testes unitários
   * 
   * Estrutura:
   * - email: campo de email (opcional nesta versão)
   * - password: campo de senha (obrigatório)
   */
  protected form!: ReturnType<FormBuilder['group']>;

  /**
   * PROPRIEDADE: Flag de Carregamento
   * 
   * Indica se requisição ao servidor está em andamento.
   * Usado no template para:
   * - Desabilitar botão de submit
   * - Mostrar spinner de carregamento
   * - Bloquear múltiplos cliques accidentais
   */
  protected loading = false as boolean;

  /**
   * PROPRIEDADE: Mensagem de Erro
   * 
   * Armazena mensagem de erro para exibição.
   * null = sem erro, string = mensagem do erro
   * 
   * Exemplos:
   * - "Email ou senha inválidos"
   * - "Conta desativada"
   * - "Erro de conexão com servidor"
   */
  protected error: string | null = null;

  /**
   * PROPRIEDADE: Flag de Sucesso
   * 
   * Indica se login foi bem-sucedido.
   * Usado para:
   * - Mostrar mensagem de sucesso temporária
   * - Desabilitar interação com formulário
   * - Trigger redirect automático
   */
  protected success = false as boolean;

  /**
   * PROPRIEDADE: Mensagem de Sucesso
   * 
   * Mensagem exibida ao usuário quando login é bem-sucedido
   */
  protected successMessage = 'Login realizado com sucesso!';

  /**
   * CONSTRUCTOR: Injeção de Dependências
   * 
   * Padrão: Dependency Injection (DI)
   * O Angular fornece automaticamente as dependências.
   * 
   * Dependências:
   * - fb (FormBuilder): Cria e gerencia formulários reativos
   * - auth (AuthService): Comunica com servidor (login/logout)
   * - router (Router): Navega entre páginas/rotas
   * - cdr (ChangeDetectorRef): Força atualização visual (Change Detection)
   * - errorParser (ErrorParserService): Extrai mensagens de erro
   * 
   * O "private" significa: variável acessível apenas dentro desta classe
   */
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private errorParser: ErrorParserService
  ) {
    // Inicializa formulário com campos e validadores
    this.form = this.fb.group({
      // Campo email (opcional - sem validadores)
      email: [''],

      // Campo password (obrigatório - precisa ser preenchido)
      // Validators.required = não pode estar vazio
      password: ['', [Validators.required]]
    });
  }

  /**
   * MÉTODO: Enviar Formulário (submit)
   * 
   * Chamado quando usuário clica botão "Entrar".
   * Executa todo o fluxo de autenticação.
   * 
   * PASSO A PASSO:
   * 1. Valida se formulário é válido (Validators passaram)
   * 2. Se inválido: retorna (não faz nada)
   * 3. Ativa modo carregamento (mostra spinner)
   * 4. Limpa erros anteriores
   * 5. Coleta email/senha do formulário
   * 6. Envia para AuthService.login()
   * 7. Aguarda resposta do servidor (async/await)
   * 8. Se OK: mostra mensagem e redireciona para home
   * 9. Se erro: mostra mensagem de erro extraída
   * 10. Sempre: desativa carregamento e atualiza visual
   * 
   * async = função assíncrona (pode usar await)
   * await = aguarda Promise ser resolvida
   * try/catch = tratamento de erros
   */
  protected async submit() {
    // PASSO 1: Valida se formulário está preenchido corretamente
    // form.invalid = true se algum campo obrigatório está vazio
    if (this.form.invalid) {
      // Retorna sem fazer nada (protege servidor de requisições inválidas)
      return;
    }

    // PASSO 2: Ativa modo carregamento
    // Isso desabilita o botão no template e mostra spinner
    this.loading = true;

    // PASSO 3: Limpa erros anteriores
    this.error = null;

    try {
      // PASSO 4: Coleta valores do formulário
      // form.value = {email: 'user@example.com', password: '123456'}
      const payload = this.form.value;

      // PASSO 5: Envia credenciais ao servidor via AuthService
      // await = aguarda a resposta (pode demorar)
      // AuthService.login() faz POST para http://localhost:8080/auth/login
      await this.auth.login(payload as any);

      // PASSO 6: Login foi bem-sucedido!
      this.success = true;
      this.loading = false;

      // PASSO 7: Força Angular detectar mudanças no visual
      // Necessário porque async operation ocorreu fora do Angular Zone
      // Sem isso, pode haver delay visual (template não atualiza imediatamente)
      this.cdr.detectChanges();

      // PASSO 8: Redireciona para home após sucesso
      // await garante que navegação foi processada
      await this.router.navigate(['/']);

    } catch (err: any) {
      // PASSO 9: Tratamento de erros

      // Extrai mensagem de erro do servidor
      // ErrorParserService trata múltiplos formatos de erro
      // Exemplos:
      // - erro string simples: "Email inválido"
      // - erro JSON: {error: {message: "..."}}
      // - erro array: {errors: [{field: "email", message: "..."}]}
      this.error = this.errorParser.extractMessage(err);

      // Desativa carregamento
      this.loading = false;

      // PASSO 10: Força atualização visual
      // Mostra mensagem de erro imediatamente ao usuário
      this.cdr.detectChanges();
    }
  }
}