import { createWriteStream, existsSync, mkdirSync, rmSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const MODEL_NAME = "vosk-model-small-en-us-0.15";
const MODEL_ZIP_URL = `https://alphacephei.com/vosk/models/${MODEL_NAME}.zip`;
const OUT_DIR = new URL("../public/models/", import.meta.url);
const OUT_FILE = path.join(new URL(OUT_DIR).pathname.replace(/^\/([A-Za-z]):/, "$1:"), `${MODEL_NAME}.tgz`);

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const workDir = path.join(tmpdir(), `vosk-fetch-${Date.now()}`);
  mkdirSync(workDir, { recursive: true });
  const zipPath = path.join(workDir, `${MODEL_NAME}.zip`);

  console.log(`Downloading ${MODEL_ZIP_URL}`);
  const response = await fetch(MODEL_ZIP_URL);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download model: ${response.status} ${response.statusText}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(zipPath));

  console.log("Extracting archive...");
  try {
    // Linux (incl. GitHub Actions) and git-bash: GNU tar can't read zip archives, so use unzip.
    execFileSync("unzip", ["-q", zipPath], { cwd: workDir, stdio: "inherit" });
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    // Native Windows and macOS: no unzip on PATH, but tar is bsdtar, which reads zip natively.
    execFileSync("tar", ["-xf", zipPath], { cwd: workDir, stdio: "inherit" });
  }

  console.log("Repackaging as tar.gz...");
  execFileSync("tar", ["-czf", OUT_FILE, MODEL_NAME], { cwd: workDir, stdio: "inherit" });

  rmSync(workDir, { recursive: true, force: true });
  console.log(`Saved to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
