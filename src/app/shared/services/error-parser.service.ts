/**
 * SERVIÇO: Parseador de Erros (Error Parser Service)
 * 
 * PROBLEMA:
 * Servidores diferentes retornam erros em formatos diferentes:
 * - Alguns retornam: {error: "mensagem"}
 * - Outros retornam: {message: "mensagem"}
 * - Outros retornam: {errors: [{field: "email", message: "..."}]}
 * - Alguns retornam apenas: "mensagem simples"
 * 
 * SEM este serviço, temos que tratar cada formato em vários lugares do código.
 * COM este serviço, normalizamos todos os formatos em um único lugar.
 * 
 * BENEFÍCIO:
 * - DRY (Don't Repeat Yourself): lógica em um lugar
 * - Fácil manutenção: alterar lógica aqui afeta toda a app
 * - Reutilização: qualquer componente usa o mesmo método
 * 
 * FLUXO:
 * 1. LoginComponent pega erro do servidor
 * 2. Chama errorParser.extractMessage(erro)
 * 3. Método detecta formato e extrai mensagem
 * 4. Retorna mensagem legível para exibir ao usuário
 * 
 * PADRÃO: Service Angular (Singleton via @Injectable)
 */

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorParserService {
  /**
   * MÉTODO: Extrair Mensagem de Erro
   * 
   * Recebe erro em qualquer formato e retorna string legível.
   * 
   * PASSO A PASSO (5 estratégias de parsing):
   * 1. Se erro é string JSON → tenta converter para objeto
   * 2. Se erro tem propriedade "message" → tenta converter ela para JSON
   * 3. Se tem array de erros → extrai o primeiro erro
   * 4. Se tem "message" simples → retorna
   * 5. Se tem "error" simples → retorna
   * Se nenhum funcionar → retorna String(erro)
   * 
   * @param error - Erro em qualquer formato (string, object, array, etc)
   * @returns string - Mensagem legível do erro
   * 
   * EXEMPLOS DE ENTRADA E SAÍDA:
   * 
   * ENTRADA 1 (String simples):
   * Input: "Email já cadastrado"
   * Output: "Email já cadastrado"
   * 
   * ENTRADA 2 (JSON em string):
   * Input: '{"message": "Email inválido"}'
   * Output: "Email inválido"
   * 
   * ENTRADA 3 (Objeto com message):
   * Input: {message: "Senha fraca"}
   * Output: "Senha fraca"
   * 
   * ENTRADA 4 (Array de erros de validação):
   * Input: {errors: [{field: "email", message: "Email inválido"}]}
   * Output: "email: Email inválido"
   * 
   * ENTRADA 5 (Objeto com error):
   * Input: {error: "Servidor indisponível"}
   * Output: "Servidor indisponível"
   */
  extractMessage(error: any): string {
    try {
      // Variável para armazenar objeto parseado
      let errorObj: any = null;

      /**
       * PASSO 1: Detectar String JSON
       * 
       * Se erro é string, pode ser:
       * a) String simples: "Email inválido"
       * b) String JSON: '{"message": "Email inválido"}'
       * 
       * typeof error === 'string' → verifica se é string
       * 
       * Exemplo:
       * error = '{"message": "Email inválido"}'
       * → JSON.parse(error) → {message: "Email inválido"}
       */
      if (typeof error === 'string') {
        try {
          // Tenta converter string JSON para objeto
          errorObj = JSON.parse(error);
          // Se tiver sucesso, errorObj = {message: "Email inválido"}
        } catch {
          // Se não for JSON válido, apenas retorna a string
          return error;
        }
      }
      /**
       * PASSO 2: Detectar error.message como String JSON
       * 
       * Às vezes o servidor retorna:
       * {message: '{"error": "Email inválido"}'}
       * 
       * Precisa fazer parse duas vezes:
       * 1ª: JSON.parse(error) → {message: '{"error": "..."}'}
       * 2ª: JSON.parse(error.message) → {error: "..."}
       * 
       * error?.message = acessa a propriedade 'message' com segurança
       * Exemplo:
       * error = {message: '{"error": "Email inválido"}'}
       * → JSON.parse(error.message) → {error: "Email inválido"}
       */
      else if (error?.message && typeof error.message === 'string') {
        try {
          // Tenta fazer parse na propriedade message
          errorObj = JSON.parse(error.message);
        } catch {
          // Se falhar, retorna o message como está
          return error.message;
        }
      }
      /**
       * PASSO 3: Usar objeto como está
       * 
       * Se não é string, assume que é um objeto já parseado.
       * Exemplo:
       * error = {message: "Email inválido"}
       * errorObj = {message: "Email inválido"}
       */
      else {
        errorObj = error;
      }

      /**
       * PASSO 4: Detectar Array de Erros (Validação)
       * 
       * Muitos servidores retornam validações como array:
       * {
       *   errors: [
       *     {field: "email", message: "Email inválido"},
       *     {field: "password", message: "Senha fraca"}
       *   ]
       * }
       * 
       * Extraímos o PRIMEIRO erro e retornamos formatado.
       * 
       * errorObj?.errors = acessa com segurança
       * Array.isArray() = verifica se é array
       * errorObj.errors.length > 0 = verifica se tem itens
       * 
       * Exemplo:
       * errorObj = {errors: [{field: "email", message: "Email inválido"}, ...]}
       * firstError = {field: "email", message: "Email inválido"}
       * return "email: Email inválido"
       */
      if (
        errorObj?.errors &&
        Array.isArray(errorObj.errors) &&
        errorObj.errors.length > 0
      ) {
        // Pega o primeiro erro do array
        const firstError = errorObj.errors[0];

        // Se tiver field E message, formata como "field: message"
        if (firstError.field && firstError.message) {
          return `${firstError.field}: ${firstError.message}`;
        }

        // Se tiver apenas message, retorna
        if (firstError.message) {
          return firstError.message;
        }

        // Senão, converte para string
        return String(firstError);
      }

      /**
       * PASSO 5: Detectar Message Simples
       * 
       * Formato: {message: "Email inválido"}
       * 
       * errorObj?.message = acessa com segurança
       * typeof errorObj.message === 'string' = verifica se é string
       * 
       * Exemplo:
       * errorObj = {message: "Email inválido"}
       * return "Email inválido"
       */
      if (
        errorObj?.message &&
        typeof errorObj.message === 'string'
      ) {
        return errorObj.message;
      }

      /**
       * PASSO 6: Detectar Error Simples
       * 
       * Formato: {error: "Email inválido"}
       * 
       * Alguns servidores usam "error" em vez de "message"
       * 
       * Exemplo:
       * errorObj = {error: "Email inválido"}
       * return "Email inválido"
       */
      if (
        errorObj?.error &&
        typeof errorObj.error === 'string'
      ) {
        return errorObj.error;
      }

      /**
       * FALLBACK: Nada funcionou
       * 
       * Converte error para string e retorna.
       * String(error) funciona com qualquer tipo:
       * - String: retorna a string
       * - Number: retorna o número como string
       * - Object: retorna [object Object]
       * - null/undefined: retorna "null" ou "undefined"
       * 
       * Exemplo:
       * error = {foo: "bar"}
       * String(error) = "[object Object]"
       * Não é perfeito, mas pelo menos algo é exibido
       */
      return String(error);

    } catch {
      /**
       * CATCH FINAL: Se algo der errado durante parsing
       * 
       * Mesmo em caso de exceção, tentamos retornar algo útil:
       * - Se error é string: retorna como está
       * - Senão: converte para string
       * 
       * Isso garante que SEMPRE retornamos uma string,
       * nunca undefined ou null.
       * 
       * Exemplo:
       * error = undefined
       * String(error) = "undefined"
       * 
       * try/catch garante robustez:
       * Se algo explodir, app não quebra, apenas mostra genérico.
       */
      return typeof error === 'string' ? error : String(error);
    }
  }
}
