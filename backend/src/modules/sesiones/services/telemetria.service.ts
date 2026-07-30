import { exec } from 'node:child_process'

import { ActiveWindowSample } from '../../../shared/types'

function runPowerShell(command: string): Promise<string> {
  const encodedScript = Buffer.from(command, 'utf16le').toString('base64')

  return new Promise((resolve, reject) => {
    exec(
      `powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedScript}`,
      { timeout: 2000, windowsHide: true },
      (error, stdout) => {
        if (error) {
          reject(error)
          return
        }

        resolve(stdout.trim())
      }
    )
  })
}

export class TelemetriaService {
  async readActiveWindow(): Promise<ActiveWindowSample | null> {
    const script = [
      "$sig='[DllImport(\"\"user32.dll\"\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\"\"user32.dll\"\")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count); [DllImport(\"\"user32.dll\"\")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);'",
      'Add-Type -MemberDefinition $sig -Name Win32 -Namespace Native',
      '$h=[Native.Win32]::GetForegroundWindow()',
      '$sb=New-Object System.Text.StringBuilder 1024',
      '[void][Native.Win32]::GetWindowText($h,$sb,$sb.Capacity)',
      '$pid=0',
      '[void][Native.Win32]::GetWindowThreadProcessId($h,[ref]$pid)',
      '$p=Get-Process -Id $pid -ErrorAction SilentlyContinue',
      "$obj=[PSCustomObject]@{title=$sb.ToString();processName=if($p){$p.ProcessName}else{''}}",
      '$obj | ConvertTo-Json -Compress'
    ].join(';')

    try {
      const result = await runPowerShell(script)
      if (!result) {
        return null
      }

      const parsed = JSON.parse(result) as { title?: string; processName?: string }
      return {
        title: parsed.title || '',
        processName: parsed.processName || '',
        capturedAt: new Date().toISOString()
      }
    } catch {
      return null
    }
  }
}
