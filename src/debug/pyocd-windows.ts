/**
 * Copyright 2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Windows PowerShell is part of Windows. Keep the native console boundary here,
// rather than requiring a Python installation or a platform-specific Node addon.
// stdin is a private control pipe; stderr also carries launch failures.
export const pyocdWindowsHost = String.raw`
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$standardError = [Console]::OpenStandardError()
$operation = 'C# helper compilation (Add-Type)'
try {
Add-Type -TypeDefinition @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
public static class PyocdConsoleHost {
    private delegate bool Handler(uint signal);
    private static readonly Handler handler = signal => signal == 0;
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool FreeConsole();
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool AllocConsole();
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool SetConsoleCtrlHandler(Handler fn, bool add);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool GenerateConsoleCtrlEvent(uint signal, uint group);
    [DllImport("kernel32.dll")] static extern IntPtr GetConsoleWindow();
    [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr window, int command);
    // CommandLineToArgvW-compatible quoting, including trailing backslashes.
    private static string Quote(string value) {
        var result = new System.Text.StringBuilder("\"");
        int slashes = 0;
        foreach (char c in value) {
            if (c == '\\') { slashes++; continue; }
            result.Append('\\', c == '"' ? slashes * 2 + 1 : slashes);
            result.Append(c);
            slashes = 0;
        }
        result.Append('\\', slashes * 2);
        return result.Append('"').ToString();
    }
    private static void ForceStop(Process child) {
        var info = new ProcessStartInfo(System.IO.Path.Combine(Environment.SystemDirectory, "taskkill.exe"),
            "/PID " + child.Id + " /T /F");
        info.UseShellExecute = false;
        info.CreateNoWindow = true;
        info.RedirectStandardOutput = true;
        info.RedirectStandardError = true;
        using (var killer = Process.Start(info)) killer.WaitForExit();
    }
    public static int Run(string executable, string[] arguments) {
        var input = Console.In;
        var output = Console.OpenStandardOutput();
        var error = Console.OpenStandardError();
        FreeConsole();
        if (!AllocConsole()) throw new System.ComponentModel.Win32Exception();
        ShowWindow(GetConsoleWindow(), 0);
        if (!SetConsoleCtrlHandler(null, false)) throw new System.ComponentModel.Win32Exception();
        // A handler (rather than the inheritable ignore flag) protects only this host.
        if (!SetConsoleCtrlHandler(handler, true)) throw new System.ComponentModel.Win32Exception();
        var info = new ProcessStartInfo(executable, String.Join(" ", Array.ConvertAll(arguments, Quote)));
        info.UseShellExecute = false;
        info.CreateNoWindow = false;
        info.RedirectStandardOutput = true;
        info.RedirectStandardError = true;
        info.RedirectStandardInput = true;
        var process = Process.Start(info);
        using (var child = process) {
            try {
                var stdout = child.StandardOutput.BaseStream.CopyToAsync(output);
                var stderr = child.StandardError.BaseStream.CopyToAsync(error);
                var control = Task.Run(() => {
                    string command;
                    while ((command = input.ReadLine()) != null) {
                        if (command == "stop") return true;
                    }
                    return false; // EOF is not a shutdown request.
                });
                bool interrupted = false;
                while (!child.WaitForExit(50)) {
                    if (!interrupted && control.IsCompleted && control.Result) {
                        interrupted = true;
                        if (!GenerateConsoleCtrlEvent(0, 0)) throw new System.ComponentModel.Win32Exception();
                        if (!child.WaitForExit(5000)) {
                            byte[] message = System.Text.Encoding.UTF8.GetBytes("\r\npyOCD shutdown timed out; forcing termination.\r\n");
                            error.Write(message, 0, message.Length);
                            error.Flush();
                            ForceStop(child);
                        }
                    }
                }
                Task.WaitAll(stdout, stderr);
                return interrupted ? 130 : child.ExitCode;
            } finally {
                if (!child.HasExited) ForceStop(child);
            }
        }
    }
}
'@
$operation = 'pyOCD arguments decoding (ConvertFrom-Json)'
$arguments = [string[]](ConvertFrom-Json $env:CMSIS_PYOCD_ARGUMENTS)
$operation = 'pyOCD executable resolution (Get-Command pyocd.exe)'
$executable = (Get-Command pyocd.exe -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
if ([string]::IsNullOrWhiteSpace($executable) -or !(Test-Path -LiteralPath $executable -PathType Leaf)) {
    throw "Resolved pyOCD executable does not exist or is not a file: '$executable'"
}
$operation = 'PyocdConsoleHost.Run'
exit [PyocdConsoleHost]::Run($executable, $arguments)
} catch {
    $failure = $_.Exception.GetBaseException()
    try {
        $message = 'pyOCD: ' + $operation + ': ' + $failure.Message + [Environment]::NewLine
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($message)
        $standardError.Write($bytes, 0, $bytes.Length)
        $standardError.Flush()
    } catch { }
    exit 1
}
`;
