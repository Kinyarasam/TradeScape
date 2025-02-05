export function logError(message: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`${message}:`, error.message);
  } else {
    console.error(`${message}:`, error);
  }
}
