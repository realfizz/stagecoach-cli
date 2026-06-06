import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const createdDirs = new Set<string>();

function getConfigDir(): string {
  const dir = process.env.STAGECOACH_CONFIG_DIR;
  if (!dir) {
    throw new Error('STAGECOACH_CONFIG_DIR not set; call setupIsolatedConfigDir() at the top of your test file');
  }
  return dir;
}

function getConfigFile(): string {
  return join(getConfigDir(), 'config.json');
}

export function setupIsolatedConfigDir(testName: string): string {
  const safeName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = join(tmpdir(), `stagecoach-test-${safeName}-${process.pid}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  process.env.STAGECOACH_CONFIG_DIR = dir;
  createdDirs.add(dir);
  return dir;
}

export function setupTestConfig(apiKey = 'test-key'): void {
  writeFileSync(getConfigFile(), JSON.stringify({ bodsApiKey: apiKey }));
}

export function cleanupTestConfig(): void {
  const file = getConfigFile();
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

export function readTestConfig(): Record<string, unknown> {
  const file = getConfigFile();
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, 'utf-8')) as Record<string, unknown>;
}

export const CLI_CWD = `${import.meta.dir}/..`;

export function runCli(args: string): string {
  return execSync(`bun run src/cli.ts ${args}`, {
    encoding: 'utf-8',
    cwd: CLI_CWD,
    env: { ...process.env },
    timeout: 60_000,
  });
}

export function runCliExpectError(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    runCli(args);
    return { stdout: '', stderr: '', exitCode: 0 };
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; status?: number; message?: string };
    return {
      stdout: execError.stdout || '',
      stderr: execError.stderr || execError.message || '',
      exitCode: execError.status ?? 1,
    };
  }
}

process.on('exit', () => {
  for (const dir of createdDirs) {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});
