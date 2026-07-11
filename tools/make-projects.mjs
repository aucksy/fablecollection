// Stamps out the per-face Gradle project scaffolds for the Twelve&Sixty-design
// series (KINETIK / AETHER / SETTYPE / VESPERA) — one APK per face, per the
// Fable Collection packaging rule. watchface.xml + preview.png + baked art are
// authored/generated separately; this creates everything else.
//
// Usage:  node tools/make-projects.mjs        (from repo root)

import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KEYSTORE_SRC = resolve(ROOT, 'Arclight-Pulsar/arclight-debug.keystore');

export const FACES = [
  // ---- 02 KINETIK — living machines ----
  { dir: 'Kinetik-Orrery',      series: 'Kinetik', face: 'Orrery',      pkg: 'com.kinetik.orrery',
    label: 'Kinetik · Orrery',      themeLabel: 'Theme',
    themes: ['Solar Gold', 'Blue Giant', 'Red Dwarf'],
    slots: ['Lower left', 'Lower right'], dark: true },
  { dir: 'Kinetik-Escapement',  series: 'Kinetik', face: 'Escapement',  pkg: 'com.kinetik.escapement',
    label: 'Kinetik · Escapement',  themeLabel: 'Theme',
    themes: ['Brass', 'Steel Blue', 'Copper'],
    slots: ['Left sub-dial', 'Right sub-dial'], dark: true },
  { dir: 'Kinetik-Odometer',    series: 'Kinetik', face: 'Odometer',    pkg: 'com.kinetik.odometer',
    label: 'Kinetik · Odometer',    themeLabel: 'Theme',
    themes: ['Cream', 'Volt', 'Signal Orange'],
    slots: ['Left counter', 'Right counter'], dark: true },
  { dir: 'Kinetik-Turbine',     series: 'Kinetik', face: 'Turbine',     pkg: 'com.kinetik.turbine',
    label: 'Kinetik · Turbine',     themeLabel: 'Theme',
    themes: ['Ion Cyan', 'Volt', 'Signal Orange'],
    slots: ['Top readout', 'Bottom readout'], dark: true },
  { dir: 'Kinetik-Metronome',   series: 'Kinetik', face: 'Metronome',   pkg: 'com.kinetik.metronome',
    label: 'Kinetik · Metronome',   themeLabel: 'Theme',
    themes: ['Terracotta', 'Brass', 'Steel Blue'],
    slots: ['Lower left', 'Lower right'], dark: true },

  // ---- 03 AETHER — atmospheric canvases ----
  { dir: 'Aether-Horizon',      series: 'Aether',  face: 'Horizon',     pkg: 'com.aether.horizon',
    label: 'Aether · Horizon',      themeLabel: 'Time tint',
    themes: ['Pure White', 'Warm Ivory', 'Sky Blue'],
    slots: ['Top readout', 'Horizon left', 'Horizon right'], dark: true },
  { dir: 'Aether-Ember',        series: 'Aether',  face: 'Ember',       pkg: 'com.aether.ember',
    label: 'Aether · Ember',        themeLabel: 'Glow',
    themes: ['Ember Orange', 'Coal Red', 'Amber'],
    slots: ['Lower left', 'Lower right'], dark: true },

  // ---- 04 SETTYPE — typographic editions ----
  { dir: 'Settype-Counterform', series: 'Settype', face: 'Counterform', pkg: 'com.settype.counterform',
    label: 'Settype · Counterform', themeLabel: 'Hour ink',
    themes: ['Signal Red', 'Volt', 'Ion Cyan'],
    slots: ['Upper readout', 'Lower readout'], dark: true },
  { dir: 'Settype-Masthead',    series: 'Settype', face: 'Masthead',    pkg: 'com.settype.masthead',
    label: 'Settype · Masthead',    themeLabel: 'Ink',
    themes: ['Black Ink', 'Oxblood', 'Prussian'],
    slots: ['Classified left', 'Classified right'], dark: false },
  { dir: 'Settype-Marquee',     series: 'Settype', face: 'Marquee',     pkg: 'com.settype.marquee',
    label: 'Settype · Marquee',     themeLabel: 'Bulbs',
    themes: ['Tungsten', 'Neon Red', 'Ice'],
    slots: ['Billing line 1', 'Billing line 2'], dark: true },
  { dir: 'Settype-Halftone',    series: 'Settype', face: 'Halftone',    pkg: 'com.settype.halftone',
    label: 'Settype · Halftone',    themeLabel: 'Ink',
    themes: ['Cream', 'Signal Red', 'Volt'],
    slots: ['Footer readout'], dark: true },

  // ---- 05 VESPERA — evening dress ----
  { dir: 'Vespera-Aurum',       series: 'Vespera', face: 'Aurum',       pkg: 'com.vespera.aurum',
    label: 'Vespera · Aurum',       themeLabel: 'Metal',
    themes: ['Gold', 'Steel', 'Rose'],
    slots: ['Nine o’clock', 'Three o’clock'], dark: true },
  { dir: 'Vespera-Noir',        series: 'Vespera', face: 'Noir',        pkg: 'com.vespera.noir',
    label: 'Vespera · Noir',        themeLabel: 'Accent',
    themes: ['Silver', 'Gold', 'Mint'],
    slots: ['Nine o’clock'], dark: true },
  { dir: 'Vespera-Salon',       series: 'Vespera', face: 'Salon',       pkg: 'com.vespera.salon',
    label: 'Vespera · Salon',       themeLabel: 'Theme',
    themes: ['Gold', 'Mint', 'Coral'],
    slots: ['Nine o’clock', 'Three o’clock'], dark: true },
  { dir: 'Vespera-Meteorite',   series: 'Vespera', face: 'Meteorite',   pkg: 'com.vespera.meteorite',
    label: 'Vespera · Meteorite',   themeLabel: 'Accent',
    themes: ['Silver', 'Gold', 'Mint'],
    slots: ['Twelve o’clock', 'Six o’clock'], dark: true },
  { dir: 'Vespera-Opaline',     series: 'Vespera', face: 'Opaline',     pkg: 'com.vespera.opaline',
    label: 'Vespera · Opaline',     themeLabel: 'Hands',
    themes: ['Blued Steel', 'Oxblood', 'Racing Green'],
    slots: ['Ten o’clock', 'Two o’clock'], dark: false },
];

const settingsGradle = (f) => `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode = RepositoriesMode.FAIL_ON_PROJECT_REPOS
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = '${f.dir.toLowerCase()}'
include ':app'
`;

const rootGradle = `plugins {
    id 'com.android.application' version '8.5.2' apply false
}
`;

const gradleProps = `org.gradle.jvmargs=-Xmx2g -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`;

const appGradle = (f) => `plugins {
    id 'com.android.application'
}

android {
    namespace '${f.pkg}'
    compileSdk 34

    defaultConfig {
        applicationId '${f.pkg}'
        // Watch Face Format v2 requires Wear OS 5 (API 34) or later.
        minSdk 34
        targetSdk 34
        versionCode 10
        versionName '0.1.0'
    }

    // Stable debug key committed to the repo so every CI test build shares ONE
    // signature and can update in place (no uninstall between builds). This is a
    // throwaway debug key (well-known password), NOT a release/Play key.
    signingConfigs {
        debug {
            storeFile file("$rootDir/fable-debug.keystore")
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            signingConfig signingConfigs.debug
        }
    }
}

// Resource-only Watch Face Format app: no code, no dependencies.
`;

const manifest = (f) => `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-feature android:name="android.hardware.type.watch" android:required="true" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:hasCode="false">

        <!-- Watch Face Format version 2 (Wear OS 5+): weather sources, HEART_RATE
             default provider, text decorations (Outline/OutGlow), dashed strokes,
             TextCircular, bitmap fonts — all used by this design line. -->
        <property
            android:name="com.google.wear.watchface.format.version"
            android:value="2" />

        <!-- Installable without a companion phone app -->
        <meta-data
            android:name="com.google.android.wearable.standalone"
            android:value="true" />
    </application>
</manifest>
`;

const watchFaceInfo = `<?xml version="1.0" encoding="utf-8"?>
<WatchFaceInfo>
    <Preview value="@drawable/preview" />
    <MultipleInstancesAllowed value="false" />
    <!-- Editable=true surfaces the on-watch / companion customization editor
         (themes, toggles, complication slots). Without it the face renders but
         can't be edited. NOT checked by the wff-validator — do not remove. -->
    <Editable value="true" />
</WatchFaceInfo>
`;

const stringsXml = (f) => {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/'/g, "\\'");
  let s = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">${esc(f.label)}</string>\n\n    <string name="cfg_theme">${esc(f.themeLabel)}</string>\n`;
  f.themes.forEach((t, i) => { s += `    <string name="theme_${i}">${esc(t)}</string>\n`; });
  if (f.dark) s += `    <string name="cfg_dark">Pure black background</string>\n`;
  s += `\n`;
  f.slots.forEach((sl, i) => { s += `    <string name="slot_${i + 1}">${esc(sl)}</string>\n`; });
  s += `</resources>\n`;
  return s;
};

for (const f of FACES) {
  const base = resolve(ROOT, f.dir);
  const res = resolve(base, 'app/src/main/res');
  for (const d of ['app/src/main/res/raw', 'app/src/main/res/xml', 'app/src/main/res/values',
    'app/src/main/res/drawable', 'app/src/main/res/font']) {
    mkdirSync(resolve(base, d), { recursive: true });
  }
  writeFileSync(resolve(base, 'settings.gradle'), settingsGradle(f));
  writeFileSync(resolve(base, 'build.gradle'), rootGradle);
  writeFileSync(resolve(base, 'gradle.properties'), gradleProps);
  writeFileSync(resolve(base, 'app/build.gradle'), appGradle(f));
  writeFileSync(resolve(base, 'app/src/main/AndroidManifest.xml'), manifest(f));
  writeFileSync(resolve(res, 'xml/watch_face_info.xml'), watchFaceInfo);
  writeFileSync(resolve(res, 'values/strings.xml'), stringsXml(f));
  const ks = resolve(base, 'fable-debug.keystore');
  if (!existsSync(ks)) copyFileSync(KEYSTORE_SRC, ks);
  console.log(`scaffolded ${f.dir}`);
}
console.log(`\n${FACES.length} projects ready.`);
