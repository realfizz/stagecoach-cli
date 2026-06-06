import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function getConfigDir(): string {
  return process.env.STAGECOACH_CONFIG_DIR || join(homedir(), '.config', 'stagecoach');
}

function getConfigFile(): string {
  return join(getConfigDir(), 'config.json');
}

interface Config {
  bodsApiKey?: string;
}

function ensureConfigDir(): void {
  if (!existsSync(getConfigDir())) {
    mkdirSync(getConfigDir(), { recursive: true });
  }
}

export function loadConfig(): Config {
  const file = getConfigFile();
  if (!existsSync(file)) {
    return {};
  }
  try {
    const content = readFileSync(file, 'utf-8');
    return JSON.parse(content) as Config;
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(getConfigFile(), JSON.stringify(config, null, 2));
}

export function getBodsApiKey(): string | undefined {
  const config = loadConfig();
  if (config.bodsApiKey) {
    return config.bodsApiKey;
  }

  if (typeof process.env !== 'undefined' && process.env.BODS_API_KEY) {
    return process.env.BODS_API_KEY;
  }

  return undefined;
}

export function setBodsApiKey(apiKey: string): void {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key cannot be empty');
  }
  const config = loadConfig();
  config.bodsApiKey = apiKey.trim();
  saveConfig(config);
}
