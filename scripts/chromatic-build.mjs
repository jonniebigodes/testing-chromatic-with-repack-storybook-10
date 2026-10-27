/**
 * Builds a release Storybook app for Chromatic (Re.Pack, non-Expo).
 *
 *   node scripts/chromatic-build.mjs android   -> <out>/storybook.apk  (Windows, macOS, Linux)
 *   node scripts/chromatic-build.mjs ios       -> <out>/storybook.app  (macOS only)
 *
 * <out> is CHROMATIC_ARTIFACT_DIRECTORY when run by the Chromatic CLI
 * (reactNative.*BuildCommand in chromatic.config.json), otherwise ./storybook-static.
 * Storybook websocket/UI settings come from .rnstorybook/index.ts.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';

const platform = process.argv[2];
if (platform !== 'android' && platform !== 'ios') {
  console.error('Usage: node scripts/chromatic-build.mjs <android|ios>');
  process.exit(1);
}

const outDir = path.resolve(
  root,
  process.env.CHROMATIC_ARTIFACT_DIRECTORY || 'storybook-static',
);
fs.mkdirSync(outDir, { recursive: true });

const env = {
  ...process.env,
  STORYBOOK_ENABLED: 'true',
  // Don't start the Storybook channel server while bundling
  STORYBOOK_SERVER: 'false',
};

function run(command, args, cwd) {
  console.log(`\n[chromatic-build] ${command} ${args.join(' ')}`);
  // .bat/.cmd files need a shell on Windows
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: isWindows,
  });
  if (result.status !== 0) {
    throw new Error(`${command} exited with code ${result.status}`);
  }
}

function buildAndroid() {
  // Chromatic's Android emulator is x86_64; add more with ANDROID_ARCHITECTURES=x86_64,arm64-v8a
  const architectures = process.env.ANDROID_ARCHITECTURES || 'x86_64';
  run(
    isWindows ? 'gradlew.bat' : './gradlew',
    [
      // The JS bundle task doesn't track env vars, so force it to re-run with STORYBOOK_ENABLED=true
      ':app:createBundleReleaseJsAndAssets',
      '--rerun',
      'assembleRelease',
      `-PreactNativeArchitectures=${architectures}`,
    ],
    path.join(root, 'android'),
  );

  const apk = path.join(
    root,
    'android/app/build/outputs/apk/release/app-release.apk',
  );
  if (!fs.existsSync(apk)) {
    throw new Error(`Expected APK not found at ${apk}`);
  }
  const target = path.join(outDir, 'storybook.apk');
  fs.copyFileSync(apk, target);
  return target;
}

function buildIos() {
  if (process.platform !== 'darwin') {
    throw new Error(
      'iOS builds require macOS and Xcode. Build storybook.app on a Mac (or macOS CI runner) and copy it into the Storybook build directory.',
    );
  }
  const scheme = 'repack_v5';
  const derivedData = fs.mkdtempSync(path.join(os.tmpdir(), 'chromatic-rn-ios-'));
  try {
    run('pod', ['install'], path.join(root, 'ios'));
    run(
      'xcodebuild',
      [
        '-workspace', `${scheme}.xcworkspace`,
        '-scheme', scheme,
        '-configuration', 'Release',
        '-sdk', 'iphonesimulator',
        '-derivedDataPath', derivedData,
        'CODE_SIGNING_ALLOWED=NO',
        'CODE_SIGNING_REQUIRED=NO',
        'build',
      ],
      path.join(root, 'ios'),
    );
    const app = path.join(
      derivedData,
      'Build/Products/Release-iphonesimulator',
      `${scheme}.app`,
    );
    if (!fs.existsSync(app)) {
      throw new Error(`Expected .app bundle not found at ${app}`);
    }
    const target = path.join(outDir, 'storybook.app');
    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(app, target, { recursive: true });
    return target;
  } finally {
    fs.rmSync(derivedData, { recursive: true, force: true });
  }
}

try {
  const artifact = platform === 'android' ? buildAndroid() : buildIos();
  console.log(`\n[chromatic-build] Built ${artifact}`);
} catch (error) {
  console.error(`\n[chromatic-build] ${error.message}`);
  process.exit(1);
}
