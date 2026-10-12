export type Route = "nato" | "calls" | "ship" | "maneuvers" | "knots";

export const ROUTE_TITLES: Record<Route, string> = {
  nato: "NATO Alphabet",
  calls: "Calls",
  ship: "Ship",
  maneuvers: "Maneuvers",
  knots: "Knots"
};
