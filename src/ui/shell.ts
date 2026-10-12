import type { Route } from "../app/route";
import { ROUTE_TITLES } from "../app/route";

export interface ShellContext {
  route: Route;
  menuOpen: boolean;
  radioOpen: boolean;
  seamanshipOpen: boolean;
}

function navLink(route: Route, label: string, activeRoute: Route): string {
  const active = route === activeRoute;
  return `
    <li>
      <button class="nav-menu__link${active ? " nav-menu__link--active" : ""}"
        type="button" data-route="${route}" aria-current="${active ? "page" : "false"}">${label}</button>
    </li>
  `;
}

function navGroup(id: string, label: string, open: boolean, links: string): string {
  return `
    <li class="nav-menu__item">
      <button id="${id}" class="nav-menu__toggle" type="button" aria-expanded="${open}">
        <span>${label}</span>
        <span class="nav-menu__chevron${open ? " nav-menu__chevron--open" : ""}" aria-hidden="true">›</span>
      </button>
      <ul class="nav-submenu${open ? " nav-submenu--open" : ""}">
        ${links}
      </ul>
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
          ${navGroup(
            "radio-toggle",
            "Radio",
            ctx.radioOpen,
            navLink("nato", "NATO Alphabet", ctx.route) + navLink("calls", "Calls", ctx.route)
          )}
          ${navGroup(
            "seamanship-toggle",
            "Seamanship",
            ctx.seamanshipOpen,
            navLink("ship", "Ship", ctx.route) +
              navLink("maneuvers", "Maneuvers", ctx.route) +
              navLink("knots", "Knots", ctx.route)
          )}
        </ul>
      </nav>
      <main class="app-main">${pageHtml}</main>
    </div>
  `;
}
