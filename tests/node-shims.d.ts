declare module "node:test" {
  type TestFn = () => void | Promise<void>;
  function test(name: string, fn: TestFn): void;
  export = test;
  export as namespace test;
}

declare module "node:assert/strict" {
  function ok(value: unknown, message?: string | Error): asserts value;
  function deepEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  const assert: {
    ok: typeof ok;
    deepEqual: typeof deepEqual;
  };
  export = assert;
}

declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8"): string;
  export function readFileSync(path: string | URL, encoding?: string): string | Buffer;
}
