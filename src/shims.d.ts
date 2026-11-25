declare namespace NodeJS {
  interface ReadableStream {
    on(event: "line", listener: (line: string) => void): this;
    on(event: "close", listener: () => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
  interface WritableStream {
    write(chunk: string): boolean;
  }
}

declare var process: {
  argv: string[];
  cwd(): string;
  env: Record<string, string | undefined>;
  execPath: string;
  exitCode: number | undefined;
  stdin: NodeJS.ReadableStream;
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
};

declare module "node:test" {
  type TestFn = () => void | Promise<void>;
  function test(name: string, fn: TestFn): void;
  export = test;
  export as namespace test;
}

declare module "node:assert/strict" {
  function ok(value: unknown, message?: string | Error): asserts value;
  function equal<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  function notEqual<T>(actual: unknown, expected: T, message?: string | Error): void;
  function deepEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  function match(actual: string, regexp: RegExp, message?: string | Error): void;
  const assert: {
    ok: typeof ok;
    equal: typeof equal;
    notEqual: typeof notEqual;
    deepEqual: typeof deepEqual;
    match: typeof match;
  };
  export = assert;
}

declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8"): string;
  export function readFileSync(path: string | URL, encoding?: string): string | Buffer;
  export function writeFileSync(path: string | URL, data: string, encoding?: string): void;
  export function existsSync(path: string | URL): boolean;
  export function mkdtempSync(prefix: string): string;
  export function rmSync(path: string | URL, options?: { recursive?: boolean; force?: boolean }): void;
  export function mkdirSync(path: string | URL, options?: { recursive?: boolean }): string | undefined;
}

declare module "node:path" {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  const path: {
    join: typeof join;
    resolve: typeof resolve;
    dirname: typeof dirname;
  };
  export = path;
}

declare module "node:os" {
  export function tmpdir(): string;
}

declare module "node:child_process" {
  export function spawnSync(
    command: string,
    args?: string[],
    options?: {
      cwd?: string;
      input?: string;
      encoding?: string;
      env?: Record<string, string | undefined>;
    },
  ): { stdout: string; stderr: string; status: number | null };
}

declare module "node:readline" {
  export interface Interface {
    on(event: "line", listener: (line: string) => void): this;
    on(event: "close", listener: () => void): this;
    close(): void;
  }
  export function createInterface(options: {
    input: NodeJS.ReadableStream;
    output?: NodeJS.WritableStream;
    terminal?: boolean;
    crlfDelay?: number;
  }): Interface;
}
