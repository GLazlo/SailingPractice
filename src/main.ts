import { createCallsController } from "./app/callsController";
import { createNatoController } from "./app/natoController";
import type { PageController } from "./app/pageController";
import type { Route } from "./app/route";
import { renderShell } from "./ui/shell";
import { renderPlaceholder } from "./ui/views";

const root = document.getElementById("app");
if (!root) throw new Error("Missing #app root element");

let route: Route = "nato";
let menuOpen = false;
let radioOpen = true;
let painting = false;

const controllers = new Map<Route, PageController>();

function controllerFor(target: Route): PageController | null {
  const existing = controllers.get(target);
  if (existing) return existing;

  let created: PageController | null = null;
  if (target === "nato") created = createNatoController(paint);
  if (target === "calls") created = createCallsController(paint);
  if (created) controllers.set(target, created);
  return created;
}

function renderPage(controller: PageController | null): string {
  if (controller) return controller.render();
  switch (route) {
    case "ship":
      return renderPlaceholder("Ship", "Ship information is coming soon.");
    case "maneuvers":
      return renderPlaceholder("Maneuvers", "Maneuvers practice is coming soon.");
    default:
      return renderPlaceholder("Not found", "This page does not exist yet.");
  }
}

function paint(): void {
  // A controller may ask to repaint while it is still being constructed; the
  // paint already in flight will render the up-to-date state anyway.
  if (painting) return;
  painting = true;
  try {
    const controller = controllerFor(route);
    root!.innerHTML = renderShell({ route, menuOpen, radioOpen }, renderPage(controller));
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
  document.querySelectorAll<HTMLButtonElement>("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.route as Route));
  });
}

paint();
