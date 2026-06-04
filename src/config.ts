import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.env.HOME || '', '.config', 'stagecoach');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface Config {
  bodsApiKey?: string;
}

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  const content = readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(content) as Config;
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getBodsApiKey(): string | undefined {
  // First check config file
  const config = loadConfig();
  if (config.bodsApiKey) {
    return config.bodsApiKey;
  }

  // Fallback to environment variable
  return process.env.BODS_API_KEY;
}

export function setBodsApiKey(apiKey: string): void {
  const config = loadConfig();
  config.bodsApiKey = apiKey;
  saveConfig(config);
}
