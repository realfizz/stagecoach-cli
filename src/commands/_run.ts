export interface RunOptions<T> {
  flags: { json: boolean };
  empty: string;
  work: () => Promise<T>;
  format: (data: T) => string;
}

export async function runCommand<T>(opts: RunOptions<T>): Promise<void> {
  try {
    const data = await opts.work();
    if (Array.isArray(data) && data.length === 0) {
      console.log(opts.empty);
      return;
    }
    console.log(opts.flags.json ? JSON.stringify(data, null, 2) : opts.format(data));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
