import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Runs the local Claude Code CLI (`claude -p …`) as a subprocess, using the
 * user's own Claude Code subscription/auth — NO API key involved.
 *
 * Default context uses a 1M-context model that requires paid usage credits and
 * 429s on standard plans, so we pin `--model sonnet` (standard context).
 */

export type ClaudeResult<T> =
  | { ok: true; data: T }
  | { ok: false; notInstalled?: boolean; error: string };

const CANDIDATE_PATHS = [
  process.env.CLAUDE_CLI_PATH,
  path.join(os.homedir(), ".local", "bin", "claude"),
  path.join(os.homedir(), ".claude", "local", "claude"),
  "/opt/homebrew/bin/claude",
  "/usr/local/bin/claude",
  "/usr/bin/claude",
].filter(Boolean) as string[];

export function resolveClaudeBin(): string | null {
  for (const c of CANDIDATE_PATHS) {
    if (existsSync(c)) return c;
  }
  return null; // not found in known locations
}

/** Fast check: is the CLI present at all? */
export function claudeInstalled(): boolean {
  return resolveClaudeBin() !== null;
}

/** Pull the first JSON object/array out of a possibly fenced/prefixed string. */
function extractJSON<T>(text: string): T | null {
  let s = text.trim();
  // strip ```json … ``` or ``` … ``` fences
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // find the outermost JSON bracket span
  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start === -1) return null;
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  const end = s.lastIndexOf(close);
  if (end <= start) return null;
  const candidate = s.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

export async function runClaudeJSON<T>(
  prompt: string,
  opts: { model?: string; timeoutMs?: number } = {},
): Promise<ClaudeResult<T>> {
  const bin = resolveClaudeBin();
  if (!bin) {
    return { ok: false, notInstalled: true, error: "Claude Code CLI not found on this machine." };
  }
  const model = opts.model ?? "sonnet";
  const timeout = opts.timeoutMs ?? 150_000;

  return new Promise<ClaudeResult<T>>((resolve) => {
    execFile(
      bin,
      ["-p", prompt, "--model", model, "--output-format", "json"],
      { timeout, maxBuffer: 32 * 1024 * 1024, cwd: os.homedir(), env: process.env },
      (err, stdout, stderr) => {
        if (err && (err as NodeJS.ErrnoException).code === "ENOENT") {
          resolve({ ok: false, notInstalled: true, error: "Claude Code CLI not found." });
          return;
        }
        let envelope: Record<string, unknown> | null = null;
        try {
          envelope = JSON.parse(stdout);
        } catch {
          // fall through
        }
        if (!envelope) {
          const msg = (stderr || stdout || (err ? err.message : "")).slice(0, 400).trim();
          resolve({ ok: false, error: msg || "Claude Code produced no output." });
          return;
        }
        if (envelope.is_error) {
          const raw = String(envelope.result ?? "Claude Code returned an error.");
          const notLoggedIn = /log ?in|authenticat|credit|usage/i.test(raw);
          resolve({ ok: false, error: raw, notInstalled: notLoggedIn ? false : undefined });
          return;
        }
        const text = String(envelope.result ?? "");
        const data = extractJSON<T>(text);
        if (data === null) {
          resolve({ ok: false, error: "Claude Code did not return valid JSON." });
          return;
        }
        resolve({ ok: true, data });
      },
    );
  });
}
