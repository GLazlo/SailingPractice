export interface PageController {
  /** Markup for the page body, inside the app shell. */
  render(): string;
  /** Wire listeners after the markup has been placed in the DOM. */
  bindEvents(): void;
  /** Release the microphone and reset when navigating away. */
  leave(): void;
}
