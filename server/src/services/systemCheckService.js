import { execFile } from 'child_process';

function checkTool(command, args = ['--version']) {
  return new Promise((resolve) => {
    execFile(command, args, (error) => {
      resolve(!error);
    });
  });
}

export async function getToolStatus() {
  const [pandoc, libreoffice, ffmpeg] = await Promise.all([
    checkTool('pandoc'),
    checkTool('soffice', ['--version']),
    checkTool('ffmpeg', ['-version']),
  ]);

  return {
    pandoc,
    libreoffice,
    ffmpeg,
    ready: pandoc || libreoffice || ffmpeg,
  };
}
