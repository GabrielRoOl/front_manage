/**
 * SERVIÇO: Autenticação (AuthService)
 * 
 * RESPONSABILIDADE:
 * Gerencia toda a lógica de autenticação do usuário:
 * - Fazer login (enviar credenciais, receber token)
 * - Armazenar token em localStorage (persistência)
 * - Recuperar token para requisições autenticadas
 * - Fazer logout (limpar sessão)
 * 
 * Por que um Service?
 * - Centraliza lógica de autenticação em um lugar
 * - Vários componentes usam (DRY - Don't Repeat Yourself)
 * - Fácil testar (mock em testes)
 * - Fácil trocar implementação (outro tipo de autenticação)
 * 
 * PADRÃO: Angular Service (Singleton via @Injectable)
 * @providedIn: 'root' = uma única instância em toda a app
 * 
 * INJEÇÃO DE DEPENDÊNCIA:
 * Você NÃO precisa instanciar: new AuthService()
 * Angular injeta automaticamente em qualquer componente que pedir
 * 
 * Exemplo:
 * constructor(private auth: AuthService) { } // Angular injeta!
 * 
 * FLUXO DE AUTENTICAÇÃO COMPLETO:
 * 1. Usuário acessa /login
 * 2. Preenche email e senha no LoginComponent
 * 3. Clica "Entrar" → LoginComponent.submit()
 * 4. submit() valida form e chama this.auth.login(credenciais)
 * 5. AuthService.login() faz POST para http://localhost:8080/auth/login
 * 6. Servidor valida credenciais com banco de dados
 * 7. Se OK: servidor cria JWT token contendo {userId, email, role}
 * 8. Servidor retorna {token: "xxx...", expiresIn: 3600}
 * 9. AuthService armazena token em localStorage
 * 10. LoginComponent mostra mensagem de sucesso
 * 11. Navega automaticamente para /dashboard
 * 12. Futuras requisições enviam token no header:
 *     Authorization: Bearer xxx...
 * 13. Servidor valida token antes de processar requisição
 */

import { Injectable } from '@angular/core';
import { LoginRequest, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * PROPRIEDADE: URL Base do Servidor
   * 
   * Armazena endereço base do servidor de autenticação.
   * Todos os endpoints são construídos relativos a esta URL.
   * 
   * private = acessível apenas dentro desta classe (encapsulamento)
   * 
   * EXEMPLO:
   * - base = 'http://localhost:8080'
   * - Endpoint = base + '/auth/login'
   * - URL final = 'http://localhost:8080/auth/login'
   * 
   * VARIÁVEIS DE AMBIENTE (melhor prática):
   * Em produção, não coloque URL hardcoded.
   * Use variáveis de ambiente:
   * 
   * // No arquivo environment.ts:
   * export const environment = {
   *   apiUrl: 'https://api.example.com'
   * };
   * 
   * // No service:
   * import { environment } from '../../environments/environment';
   * private base = environment.apiUrl;
   * 
   * DESENVOLVIMENTO vs PRODUÇÃO:
   * - Dev: http://localhost:8080
   * - Prod: https://api.example.com (sem porta, HTTPS obrigatório)
   */
  private base = 'http://localhost:8080';

  /**
   * MÉTODO: Fazer Login
   * 
   * Envia credenciais (email/senha) ao servidor, recebe token JWT,
   * e armazena token localmente para autenticar requisições futuras.
   * 
   * PARÂMETRO:
   * payload: LoginRequest = {email: string, password: string}
   * 
   * RETORNO:
   * Promise<AuthResponse> = {token: string, expiresIn?: number, user?: object}
   * 
   * EXCEÇÃO:
   * Lança Error se:
   * - Servidor retornar 401 (não autorizado)
   * - Servidor retornar 500 (erro interno)
   * - Network error (sem conexão)
   * 
   * SEGURANÇA:
   * - Senha é enviada apenas 1 vez (no login)
   * - Depois usa token JWT (não precisa de senha)
   * - Servidor DEVE fazer hash bcrypt da senha:
   *   const senhaHash = await bcrypt.hash(password, 10);
   * - Servidor NUNCA retorna a senha
   * - Comunicação DEVE usar HTTPS em produção (criptografia)
   * 
   * FLUXO PASSO A PASSO:
   * 1. Valida parametros de entrada
   * 2. Faz requisição POST com credenciais
   * 3. Aguarda resposta do servidor (pode demorar)
   * 4. Valida status HTTP (resp.ok = 200-299)
   * 5. Se erro: extrai mensagem de erro e lança
   * 6. Se sucesso: converte JSON e armazena token
   * 7. Retorna dados completos
   * 
   * EXEMPLO DE USO:
   * try {
   *   const response = await authService.login({
   *     email: 'joao@example.com',
   *     password: 'senhaSegura'
   *   });
   *   console.log('Token:', response.token);
   *   console.log('User:', response.user);
   * } catch (error) {
   *   console.error('Login falhou:', error.message);
   * }
   * 
   * ERROS COMUNS:
   * - "Email ou senha inválidos" → credenciais erradas
   * - "Email não verificado" → usuário não confirmou email
   * - "Conta desativada" → admin desativou conta
   * - "Servidor indisponível" → servidor fora do ar
   */
  async login(payload: LoginRequest): Promise<AuthResponse> {
    /**
     * PASSO 1: Fazer Requisição POST
     * 
     * fetch() = API nativa do navegador para HTTP requests
     * 
     * Alternativas:
     * - HttpClient (Angular) = mais features, mais código
     * - axios (biblioteca) = promessas, interceptadores
     * - superagent = simples e poderoso
     * 
     * fetch() é suficiente para casos simples.
     * 
     * Sintaxe:
     * fetch(url, {
     *   method: 'POST',    // tipo de requisição
     *   headers: {...},    // metadados da requisição
     *   body: JSON.stringify(payload)  // corpo com dados
     * })
     * 
     * ${this.base}/auth/login = template literal string
     * Exemplo: 'http://localhost:8080/auth/login'
     */
    const resp = await fetch(`${this.base}/auth/login`, {
      /**
       * method: 'POST' = HTTP Method (tipo de requisição)
       * 
       * GET = ler dados (sem corpo)
       * POST = enviar dados (com corpo)
       * PUT = atualizar dados (com corpo)
       * DELETE = apagar dados
       * 
       * Login usa POST porque envia credenciais no corpo.
       */
      method: 'POST',

      /**
       * headers = metadados da requisição (informações sobre dados)
       * 
       * 'Content-Type': 'application/json' significa:
       * "Os dados no corpo são em formato JSON"
       * 
       * Servidor lê este header e sabe como processar o corpo.
       * 
       * OUTROS HEADERS COMUNS:
       * 'Authorization': 'Bearer token...' (autenticação)
       * 'Accept': 'application/json' (tipo que aceita na resposta)
       * 'User-Agent': '...' (qual navegador)
       */
      headers: { 'Content-Type': 'application/json' },

      /**
       * body = corpo da requisição (dados sendo enviados)
       * 
       * JSON.stringify(payload) converte objeto para string JSON
       * 
       * Exemplo:
       * payload = {email: 'joao@example.com', password: '123'}
       * JSON.stringify(payload) = '{"email":"joao@example.com","password":"123"}'
       * 
       * IMPORTANTE: apenas POST, PUT, DELETE usam body
       * GET não usa body (dados vão em query string)
       */
      body: JSON.stringify(payload)
    });

    /**
     * PASSO 2: Validar Resposta HTTP
     * 
     * resp.ok = booleano indicando sucesso
     * - true = status 200-299 (sucesso)
     * - false = status 400-599 (erro)
     * 
     * Exemplos:
     * - 200 OK = login bem-sucedido
     * - 401 Unauthorized = email/senha errados
     * - 500 Internal Server Error = erro do servidor
     */
    if (!resp.ok) {
      /**
       * TRATAMENTO DE ERRO
       * 
       * resp.text() = lê corpo da resposta como texto
       * 
       * Exemplo de erro:
       * Servidor retorna status 401 com:
       * {"message": "Email ou senha inválidos"}
       * 
       * text = '{"message": "Email ou senha inválidos"}'
       * 
       * throw new Error() = lança exceção (programa para no erro)
       * A exceção é capturada no try/catch do componente
       */
      const text = await resp.text();
      throw new Error(text || `Login failed: ${resp.status}`);
    }

    /**
     * PASSO 3: Converter Resposta JSON
     * 
     * resp.json() = lê corpo como JSON e converte para objeto
     * 
     * Resposta do servidor:
     * {
     *   "token": "eyJhbGciOiJIUzI1NiIs...",
     *   "expiresIn": 3600,
     *   "user": {
     *     "id": "123",
     *     "name": "João Silva",
     *     "email": "joao@example.com"
     *   }
     * }
     * 
     * JSON.parse() = converte string JSON para objeto
     * resp.json() faz isso automaticamente
     * 
     * data = {token: "...", expiresIn: 3600, user: {...}}
     */
    const data = await resp.json();

    /**
     * PASSO 4: Armazenar Token em localStorage
     * 
     * localStorage = armazenamento permanente do navegador
     * Persiste entre:
     * - Abas diferentes
     * - Recargas de página
     * - Fechamento do navegador
     * 
     * Até que:
     * - Usuário faça logout (remova token)
     * - Cache do navegador seja limpo
     * - Token expire (expiresIn)
     * 
     * SEGURANÇA:
     * localStorage é acessível via JavaScript, então:
     * - Não é 100% seguro (XSS attack pode ler token)
     * - Alternativa mais segura: cookie com httpOnly flag
     * - Para produção, considere usar cookies
     * 
     * CHAVE:
     * Chave = 'auth_token' (nome do item armazenado)
     * Valor = token JWT
     * 
     * data?.token = acesso seguro (não lança erro se null)
     * 
     * localStorage.setItem(chave, valor)
     * = armazena valor com a chave
     */
    if (data?.token) {
      localStorage.setItem('auth_token', data.token);
    }

    /**
     * PASSO 5: Retornar Dados Completos
     * 
     * AuthResponse = {token, expiresIn?, user?}
     * 
     * Componente usa estes dados para:
     * - Mostra mensagem de sucesso
     * - Navega para dashboard
     * - Exibe nome do usuário
     * 
     * as AuthResponse = type casting
     * Diz ao TypeScript: "confia em mim, isso é AuthResponse"
     */
    return data as AuthResponse;
  }

  /**
   * MÉTODO: Obter Token Armazenado
   * 
   * Recupera o token JWT do localStorage para autenticar requisições.
   * 
   * USO:
   * - Guard verifica se usuário está logado
   * - Componente inclui token em requisições
   * - Interceptador adiciona token em headers
   * 
   * RETORNO:
   * - string = token encontrado (ex: "eyJhbGciOi...")
   * - null = nenhum token armazenado (usuário não logado)
   * 
   * EXEMPLO:
   * const token = authService.getToken();
   * if (token) {
   *   // Usuário está logado
   * } else {
   *   // Usuário não está logado
   * }
   * 
   * INCLUIR EM REQUISIÇÕES:
   * const token = this.auth.getToken();
   * fetch('http://localhost:8080/api/profile', {
   *   headers: {
   *     'Authorization': 'Bearer ' + token
   *   }
   * })
   */
  getToken(): string | null {
    /**
     * localStorage.getItem(chave) = recupera valor
     * 
     * Se existe: retorna valor (string)
     * Se não existe: retorna null
     * 
     * Exemplo:
     * Se localStorage tem: {auth_token: "eyJhbGci..."}
     * getToken() retorna: "eyJhbGci..."
     * 
     * Se localStorage está vazio:
     * getToken() retorna: null
     */
    return localStorage.getItem('auth_token');
  }

  /**
   * MÉTODO: Fazer Logout
   * 
   * Remove token do armazenamento local, encerrando sessão.
   * Após logout:
   * - getToken() retorna null
   * - Requisições futuras não têm autenticação
   * - Usuário é redirecionado para /login
   * 
   * FLUXO:
   * 1. Usuário clica "Sair" no menu
   * 2. Componente chama authService.logout()
   * 3. Token é removido do localStorage
   * 4. getToken() volta a retornar null
   * 5. Guard redireciona para /login
   * 6. Usuário vê tela de login
   * 
   * RETORNO:
   * void = não retorna nada
   * Operação sempre é bem-sucedida
   * 
   * LIMPEZA:
   * Você pode limpar outros dados aqui:
   * - localStorage.removeItem('user_data')
   * - sessionStorage.clear()
   * - Resetar estado global (RxJS, Signals)
   * 
   * EXEMPLO EXPANDIDO:
   * logout(): void {
   *   // Remove token
   *   localStorage.removeItem('auth_token');
   *   
   *   // Remove dados do usuário
   *   localStorage.removeItem('user');
   *   
   *   // Limpa sessão
   *   sessionStorage.clear();
   *   
   *   // Notifica componentes (RxJS Subject)
   *   this.logoutSubject.next(true);
   * }
   */
  logout(): void {
    /**
     * localStorage.removeItem(chave) = remove item
     * 
     * Exemplo:
     * Se localStorage tem: {auth_token: "eyJhbGci..."}
     * removeItem('auth_token') → localStorage fica vazio
     * 
     * getToken() passa a retornar: null
     */
    localStorage.removeItem('auth_token');
  }
}
