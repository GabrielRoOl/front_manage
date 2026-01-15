/**
 * ARQUIVO: Modelos de Tipos (Interfaces) de Autenticação
 * 
 * O que é uma Interface?
 * Interface = contrato que define quais propriedades um objeto DEVE ter.
 * Exemplo: Se você disser "enviar LoginRequest", o servidor sabe exatamente
 * que receberá email, username E password.
 * 
 * BENEFÍCIOS:
 * - Type Safety: TypeScript valida tipos em tempo de compilação
 * - Auto-complete: IDE sugere propriedades automaticamente
 * - Documentação: código serve como documentação
 * - Detecção de Erros: erros encontrados ANTES de executar o código
 * 
 * EXEMPLO DE USO:
 * // No login.component.ts:
 * const payload: LoginRequest = {
 *   email: 'user@example.com',
 *   password: '123456'
 * };
 * 
 * // TypeScript verifica:
 * // ✓ Tem a propriedade 'email'?
 * // ✓ Tem a propriedade 'password'?
 * // Se faltar, IDE mostra erro ANTES de rodar código!
 */

/**
 * INTERFACE: LoginRequest (Requisição de Login)
 * 
 * Define as credenciais que o usuário envia para fazer login.
 * 
 * CAMPOS:
 * - username?: string (opcional) - Nome de usuário do usuário
 * - email?: string (opcional) - Email do usuário
 * - password: string (OBRIGATÓRIO) - Senha do usuário
 * 
 * O "?" significa "opcional" (pode ou não estar presente)
 * Sem "?" significa "obrigatório" (DEVE estar presente sempre)
 * 
 * EXEMPLO 1 - Autenticação por Email:
 * {
 *   email: 'joao@example.com',
 *   password: 'senhaSegura123'
 * }
 * 
 * EXEMPLO 2 - Autenticação por Usuário:
 * {
 *   username: 'joao123',
 *   password: 'senhaSegura123'
 * }
 * 
 * EXEMPLO 3 - Autenticação com Ambos:
 * {
 *   username: 'joao123',
 *   email: 'joao@example.com',
 *   password: 'senhaSegura123'
 * }
 * 
 * SEGURANÇA:
 * - NUNCA armazene senha em localStorage (apenas token JWT!)
 * - Sempre use HTTPS para transmitir senha (criptografia)
 * - Servidor DEVE fazer hash bcrypt da senha (não salve em texto plano)
 * - Exemplo servidor (bcrypt): hash = await bcrypt.hash(password, 10);
 */
export interface LoginRequest {
  /**
   * Nome de usuário (opcional)
   * Tipo: string
   * Exemplo: 'joao_silva'
   */
  username?: string;

  /**
   * Email do usuário (opcional)
   * Tipo: string
   * Exemplo: 'joao@example.com'
   * 
   * Validação no servidor: deve ser email válido
   */
  email?: string;

  /**
   * Senha do usuário (OBRIGATÓRIO)
   * Tipo: string
   * Exemplo: 'MinhaSenh@Forte123'
   * 
   * IMPORTANTE:
   * - Nunca registre senha em console.log (risco de segurança)
   * - Servidor faz hash bcrypt: senhaHash = bcrypt.hash(password)
   * - Comparação: bcrypt.compare(passwordDigitada, senhaHash)
   */
  password: string;
}

/**
 * INTERFACE: AuthResponse (Resposta de Autenticação)
 * 
 * Define o que o servidor retorna após login bem-sucedido.
 * 
 * CAMPOS:
 * - token: string (OBRIGATÓRIO) - Token JWT para autenticar requisições
 * - expiresIn?: number (opcional) - Tempo de expiração do token (segundos)
 * - user?: Record<string, any> (opcional) - Dados do usuário autenticado
 * 
 * FLUXO:
 * 1. Servidor valida email/senha
 * 2. Se OK: cria JWT token
 * 3. Armazena token em localStorage
 * 4. Token enviado em headers de requisições futuras
 * 5. Servidor valida token antes de processar requisição
 * 
 * SOBRE JWT (JSON Web Token):
 * JWT é composto por 3 partes separadas por pontos:
 * xxxxx.yyyyy.zzzzz
 * - Primeira parte: header (algoritmo, tipo de token)
 * - Segunda parte: payload (dados do usuário)
 * - Terceira parte: signature (assinatura criptográfica)
 * 
 * EXEMPLO JWT REAL:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
 * eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvIiwiaWF0IjoxNTE2MjM5MDIyfQ.
 * SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 * 
 * EXEMPLOS DE RESPOSTA:
 * 
 * EXEMPLO 1 - Resposta Simples:
 * {
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 * }
 * 
 * EXEMPLO 2 - Resposta com Expiração:
 * {
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   expiresIn: 3600  // Token expira em 3600 segundos (1 hora)
 * }
 * 
 * EXEMPLO 3 - Resposta Completa com User:
 * {
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   expiresIn: 3600,
 *   user: {
 *     id: '123',
 *     name: 'João Silva',
 *     email: 'joao@example.com',
 *     role: 'admin',
 *     avatar: 'https://...'
 *   }
 * }
 * 
 * ARMAZENAMENTO SEGURO:
 * - localStorage é OK para JWT (não pode acessar senha)
 * - Token é READ-ONLY: não pode modificar após gerado
 * - Servidor valida assinatura criptográfica
 * - Se token for forjado, servidor rejeita
 */
export interface AuthResponse {
  /**
   * Token JWT (OBRIGATÓRIO)
   * Tipo: string
   * 
   * Usado para autenticar requisições futuras:
   * Authorization: Bearer <token>
   * 
   * EXEMPLO DE REQUISIÇÃO COM TOKEN:
   * fetch('http://localhost:8080/api/user', {
   *   method: 'GET',
   *   headers: {
   *     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
   *   }
   * })
   * 
   * DECODIFICAR JWT (para inspeção):
   * https://jwt.io - Cola o token e vê o conteúdo
   * OBS: Decodificar ≠ descriptografar, apenas lê o payload
   */
  token: string;

  /**
   * Tempo de Expiração do Token (opcional)
   * Tipo: number (segundos)
   * Exemplo: 3600 = token expira em 1 hora
   * 
   * USO:
   * - Calcular quando token vai expirar
   * - Renovar token antes que expire
   * - Fazer logout automático quando expirar
   * 
   * EXEMPLO DE CÁLCULO:
   * const expiryTime = Date.now() + (response.expiresIn * 1000);
   * // Date.now() = timestamp atual em milissegundos
   * // response.expiresIn = 3600 segundos
   * // * 1000 = converte segundos para milissegundos
   * 
   * RENOVAÇÃO DE TOKEN:
   * Se expiresIn = 3600:
   * - Solicitar novo token após 3000 segundos
   * - Antes que expire, renovar automaticamente
   * - Evita logout inesperado do usuário
   */
  expiresIn?: number;

  /**
   * Dados do Usuário Autenticado (opcional)
   * Tipo: Record<string, any> = Objeto flexível com qualquer propriedade
   * 
   * Record<string, any> significa:
   * - Chaves (keys): qualquer string
   * - Valores (values): qualquer tipo (string, number, boolean, etc)
   * 
   * USO:
   * - Armazenar dados do usuário no frontend
   * - Exibir nome, avatar, email na UI
   * - Guardar role/permissão para autorização
   * - Passar para componentes via @Input ou service
   * 
   * EXEMPLO DE user FLEXÍVEL:
   * user = {
   *   id: '123',              // number
   *   name: 'João',          // string
   *   email: 'joao@...',      // string
   *   avatar: 'https://...',  // string
   *   role: 'admin',          // string (permissão)
   *   verified: true,         // boolean
   *   createdAt: '2024-01-01' // string (data)
   * }
   * 
   * FLEXIBILIDADE DE Record<string, any>:
   * - Diferentes servidores retornam estruturas diferentes
   * - Não precisa recriar interface para cada campo novo
   * - Permite crescimento sem quebrar tipagem
   * 
   * EXEMPLO 1 - User Simples:
   * { id: '1', name: 'João', email: 'joao@example.com' }
   * 
   * EXEMPLO 2 - User com Permissões:
   * {
   *   id: '1',
   *   name: 'João',
   *   role: 'admin',
   *   permissions: ['create_user', 'delete_user']
   * }
   * 
   * EXEMPLO 3 - User com Preferências:
   * {
   *   id: '1',
   *   name: 'João',
   *   preferences: {
   *     theme: 'dark',
   *     language: 'pt-BR',
   *     notifications: true
   *   }
   * }
   */
  user?: Record<string, any>;
}
