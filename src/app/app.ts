/**
 * COMPONENTE: Raiz da Aplicação (App Component)
 * 
 * RESPONSABILIDADE:
 * Este é o componente principal (root component) que funciona como o "container"
 * de toda a aplicação Angular. É a base estrutural que fica sempre visível.
 * 
 * FUNÇÕES PRINCIPAIS:
 * 1. Renderizar router-outlet = espaço onde as rotas são carregadas
 * 2. Fornecer estrutura HTML base do layout (header, footer, sidebar, etc)
 * 3. Gerenciar estado compartilhado entre todas as rotas
 * 4. Definir estilos globais da aplicação
 * 
 * ARQUITETURA:
 * - standalone: true = Componente independente (não precisa NgModule)
 * - Moderno, recomendado no Angular 14+
 * 
 * CICLO DE VIDA:
 * 1. Aplicação inicia
 * 2. main.ts carrega AppComponent
 * 3. App renderiza em <app-root> no index.html
 * 4. router-outlet dentro de App carrega componentes das rotas
 * 5. Quando rota muda, componente dentro router-outlet é substituído
 * 
 * EXEMPLO DE ESTRUTURA:
 * <app-root>                    ← Este componente (App)
 *   <app-layout>               ← Template do App (app.html)
 *     <header>...</header>
 *     <router-outlet>          ← Onde os componentes das rotas aparecem
 *       <app-login />          ← Quando em /login
 *       <app-dashboard />      ← Quando em /dashboard
 *     </router-outlet>
 *     <footer>...</footer>
 *   </app-layout>
 * </app-root>
 */

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  /**
   * SELECTOR: Tag HTML do Componente
   * 
   * Define qual tag HTML representa este componente.
   * 
   * O Angular procura por <app-root> no index.html:
   * <app-root></app-root>
   * 
   * E substitui por:
   * <app-root>
   *   [conteúdo do template app.html]
   * </app-root>
   * 
   * CONVENÇÃO:
   * - app- prefixo (identifica componentes da aplicação)
   * - root sufixo (especifica qual é o componente raiz)
   * 
   * Você pode criar qualquer selector:
   * - selector: 'my-component' → <my-component></my-component>
   * - selector: '[appComponent]' → <div appComponent></div>
   * - selector: '.app-component' → <div class="app-component"></div>
   */
  selector: 'app-root',

  /**
   * IMPORTS: Dependências do Componente
   * 
   * Lista tudo que este componente precisa para funcionar.
   * 
   * RouterOutlet:
   * - Diretiva do @angular/router
   * - Cria um "placeholder" onde as rotas são renderizadas
   * - Sem RouterOutlet, navegação não funciona
   * 
   * EXEMPLO DE IMPORTS:
   * imports: [
   *   RouterOutlet,           // Para router-outlet no template
   *   CommonModule,           // Para *ngIf, *ngFor, etc
   *   SomeComponent,          // Para usar <some-component></some-component>
   *   ReactiveFormsModule     // Para FormBuilder, [formGroup], etc
   * ]
   */
  imports: [RouterOutlet],

  /**
   * TEMPLATEURL: Arquivo HTML do Componente
   * 
   * Caminho relativo ao arquivo .ts para o template HTML.
   * 
   * Alternativa (Inline Template):
   * template: `<h1>Bem-vindo!</h1>`
   * 
   * Use templateUrl para templates grandes (mais limpo).
   * Use template para templates pequenos (mais rápido).
   * 
   * ARQUIVO: src/app/app.html
   * Contém toda a estrutura visual e layout da aplicação.
   */
  templateUrl: './app.html',

  /**
   * STYLEURL: Arquivo SCSS do Componente
   * 
   * Caminho relativo para estilos CSS/SCSS.
   * 
   * Alternativa (Inline Styles):
   * styles: [`:host { background: white; }`]
   * 
   * Alternativa (Múltiplos Arquivos):
   * styleUrls: ['./app.scss', './global.scss']
   * 
   * ESCOPO:
   * Estilos aqui afetam apenas este componente (encapsulamento).
   * Estilos globais devem ir em src/styles.scss
   * 
   * ARQUIVO: src/app/app.scss
   * Contém estilos visuais (cores, layout, fontes, etc).
   */
  styleUrl: './app.scss'
})
export class App {
  /**
   * PROPRIEDADE: Título da Aplicação
   * 
   * SIGNAL: Conceito Moderno de Reatividade (Angular 16+)
   * 
   * O que é Signal?
   * Signal é um contentor que armazena valor e notifica quando muda.
   * Atualização é automática e eficiente no Angular.
   * 
   * DIFERENÇAS: Signal vs Outras Abordagens:
   * 
   * 1. PROPERTY SIMPLES (sem reatividade):
   * title = 'front_manage';
   * - Muda o valor, mas Angular não detecta mudança
   * - Template não atualiza automaticamente
   * 
   * 2. RXJS OBSERVABLE (anterior):
   * title$ = new BehaviorSubject('front_manage');
   * - Funciona, mas é verboso
   * - Precisa usar async pipe no template
   * - Mais complexo para iniciantes
   * 
   * 3. SIGNAL (recomendado agora):
   * readonly title = signal('front_manage');
   * - Simples e intuitivo
   * - Angular detecta e atualiza automaticamente
   * - Mais eficiente (não cria observáveis)
   * 
   * SINTAXE:
   * const meuSignal = signal(valorInicial);
   * 
   * Acesso ao valor:
   * meuSignal()        // Obtém o valor atual
   * this.title()       // Retorna 'front_manage'
   * 
   * Modificar o valor:
   * meuSignal.set(novoValor);
   * this.title.set('novo título');
   * 
   * Atualizar baseado no valor anterior:
   * meuSignal.update(valor => valor + ' atualizado');
   * 
   * REATIVIDADE NO TEMPLATE:
   * // Em app.html:
   * <h1>{{ title() }}</h1>
   * 
   * Quando title muda:
   * 1. Componente detecta mudança
   * 2. Template é re-renderizado
   * 3. H1 exibe novo valor automaticamente
   * 
   * EXAMPLE NO TEMPLATE:
   * <title>{{ title() }}</title>  ← Mostra o valor do signal
   * 
   * readonly = não pode reatribuir a variável (proteção)
   * readonly title = signal('A');
   * this.title = signal('B'); ← ERRO!
   * this.title.set('B');      ← OK!
   * 
   * protected = acessível no template e em subclasses
   * private = apenas dentro desta classe
   * public = (padrão) acessível de qualquer lugar
   * 
   * protected readonly = pode ser acessado no template, mas não pode ser
   * reatribuído externamente (segurança).
   */
  protected readonly title = signal('front_manage');

  /**
   * CONSTRUCTOR (vazio)
   * 
   * Não precisa fazer nada no constructor.
   * Se precisasse injetar serviços:
   * 
   * constructor(private auth: AuthService) {}
   * 
   * Mas este componente raiz não precisa de lógica especial
   * ,
   * apenas renderiza o layout base.
   */
}
