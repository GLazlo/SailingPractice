import { createCallsController } from "./app/callsController";
import { createGlossaryController } from "./app/glossaryController";
import { createNatoController } from "./app/natoController";
import type { PageController } from "./app/pageController";
import type { Route } from "./app/route";
import { KNOTS_PAGE } from "./domain/knots";
import { MANEUVERS_PAGE } from "./domain/maneuvers";
import { SHIP_PAGE } from "./domain/shipParts";
import { renderShell } from "./ui/shell";
import { renderPlaceholder } from "./ui/views";

const root = document.getElementById("app");
if (!root) throw new Error("Missing #app root element");

let route: Route = "nato";
let menuOpen = false;
let radioOpen = true;
let seamanshipOpen = true;
let painting = false;

const controllers = new Map<Route, PageController>();

function createController(target: Route): PageController {
  switch (target) {
    case "nato":
      return createNatoController(paint);
    case "calls":
      return createCallsController(paint);
    case "ship":
      return createGlossaryController(SHIP_PAGE, paint);
    case "maneuvers":
      return createGlossaryController(MANEUVERS_PAGE, paint);
    case "knots":
      return createGlossaryController(KNOTS_PAGE, paint);
  }
}

function controllerFor(target: Route): PageController | null {
  const existing = controllers.get(target);
  if (existing) return existing;

  const created = createController(target);
  if (created) controllers.set(target, created);
  return created ?? null;
}

function renderPage(controller: PageController | null): string {
  if (controller) return controller.render();
  return renderPlaceholder("Not found", "This page does not exist yet.");
}

function paint(): void {
  // A controller may ask to repaint while it is still being constructed; the
  // paint already in flight will render the up-to-date state anyway.
  if (painting) return;
  painting = true;
  try {
    const controller = controllerFor(route);
    root!.innerHTML = renderShell({ route, menuOpen, radioOpen, seamanshipOpen }, renderPage(controller));
    bindShellEvents();
    controller?.bindEvents();
  } finally {
    painting = false;
  }
}

function navigateTo(next: Route): void {
  if (next !== route) controllers.get(route)?.leave();
  route = next;
  menuOpen = false;
  paint();
}

function bindShellEvents(): void {
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    menuOpen = !menuOpen;
    paint();
  });
  document.getElementById("nav-backdrop")?.addEventListener("click", () => {
    menuOpen = false;
    paint();
  });
  document.getElementById("radio-toggle")?.addEventListener("click", () => {
    radioOpen = !radioOpen;
    paint();
  });
  document.getElementById("seamanship-toggle")?.addEventListener("click", () => {
    seamanshipOpen = !seamanshipOpen;
    paint();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.route as Route));
  });
}

paint();
