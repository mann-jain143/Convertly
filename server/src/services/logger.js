const levels = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
};

function write(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaJson = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[${timestamp}] [${levels[level]}] ${message}${metaJson}`);
}

export const logger = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};
