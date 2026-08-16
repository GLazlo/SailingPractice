import type { Route } from "../app/route";
import { ROUTE_TITLES } from "../app/route";

export interface ShellContext {
  route: Route;
  menuOpen: boolean;
  radioOpen: boolean;
}

function navLink(route: Route, label: string, activeRoute: Route, extraClass = ""): string {
  const active = route === activeRoute;
  return `
    <li>
      <button class="nav-menu__link${extraClass ? ` ${extraClass}` : ""}${active ? " nav-menu__link--active" : ""}"
        type="button" data-route="${route}" aria-current="${active ? "page" : "false"}">${label}</button>
    </li>
  `;
}

export function renderShell(ctx: ShellContext, pageHtml: string): string {
  return `
    <div class="app-shell">
      <header class="app-header">
        <button id="menu-toggle" class="menu-toggle" type="button"
          aria-label="${ctx.menuOpen ? "Close menu" : "Open menu"}" aria-expanded="${ctx.menuOpen}">
          <span class="menu-toggle__bar"></span>
          <span class="menu-toggle__bar"></span>
          <span class="menu-toggle__bar"></span>
        </button>
        <h1 class="app-header__title">${ROUTE_TITLES[ctx.route]}</h1>
      </header>
      <div id="nav-backdrop" class="nav-backdrop${ctx.menuOpen ? " nav-backdrop--visible" : ""}"></div>
      <nav id="nav-drawer" class="nav-drawer${ctx.menuOpen ? " nav-drawer--open" : ""}" aria-hidden="${!ctx.menuOpen}">
        <ul class="nav-menu">
          <li class="nav-menu__item">
            <button id="radio-toggle" class="nav-menu__toggle" type="button" aria-expanded="${ctx.radioOpen}">
              <span>Radio</span>
              <span class="nav-menu__chevron${ctx.radioOpen ? " nav-menu__chevron--open" : ""}" aria-hidden="true">›</span>
            </button>
            <ul class="nav-submenu${ctx.radioOpen ? " nav-submenu--open" : ""}">
              ${navLink("nato", "NATO Alphabet", ctx.route)}
              ${navLink("calls", "Calls", ctx.route)}
            </ul>
          </li>
          ${navLink("ship", "Ship", ctx.route, "nav-menu__link--top")}
          ${navLink("maneuvers", "Maneuvers", ctx.route, "nav-menu__link--top")}
        </ul>
      </nav>
      <main class="app-main">${pageHtml}</main>
    </div>
  `;
}
