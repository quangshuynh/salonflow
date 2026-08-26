// The real `server-only` package throws on import outside a React Server
// Component graph, which would make every query module untestable. Vitest
// aliases it here instead. The guard still applies to the application build —
// only the test runner sees this file.
export {};
