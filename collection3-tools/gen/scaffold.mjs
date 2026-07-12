// Per-face Gradle project scaffolder — follows the Fable Collection convention:
// one standalone Gradle project per face, stable shared debug keystore, AGP 8.5.2,
// resource-only WFF v1 app (hasCode=false, no Activity/Service).

import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './bake.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '\\\'');

export function scaffoldFace(entry, strings, version) {
  const { dir, appId, face, cat } = entry;
  const base = resolve(ROOT, dir);
  const app = resolve(base, 'app/src/main');
  mkdirSync(resolve(app, 'res/raw'), { recursive: true });
  mkdirSync(resolve(app, 'res/xml'), { recursive: true });
  mkdirSync(resolve(app, 'res/values'), { recursive: true });
  mkdirSync(resolve(app, 'res/drawable'), { recursive: true });
  mkdirSync(resolve(app, 'res/drawable-nodpi'), { recursive: true });
  mkdirSync(resolve(app, 'res/font'), { recursive: true });

  writeFileSync(resolve(base, 'settings.gradle'), `pluginManagement {
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
rootProject.name = '${entry.slug}'
include ':app'
`);
  writeFileSync(resolve(base, 'build.gradle'), `plugins {
    id 'com.android.application' version '8.5.2' apply false
}
`);
  writeFileSync(resolve(base, 'gradle.properties'), `org.gradle.jvmargs=-Xmx2g -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`);
  writeFileSync(resolve(base, 'app/build.gradle'), `plugins {
    id 'com.android.application'
}

android {
    namespace '${appId}'
    compileSdk 34

    defaultConfig {
        applicationId '${appId}'
        // Watch Face Format v1 requires Wear OS 4 (API 33) or later.
        minSdk 33
        targetSdk 34
        versionCode ${version.code}
        versionName '${version.name}'
    }

    // Stable debug key committed to the repo so every CI build shares ONE signature
    // and adb install -r updates in place. Throwaway debug key, NOT a Play key.
    signingConfigs {
        debug {
            storeFile file("$rootDir/collection3-debug.keystore")
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
`);
  writeFileSync(resolve(app, 'AndroidManifest.xml'), `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-feature android:name="android.hardware.type.watch" android:required="true" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:hasCode="false">

        <!-- Watch Face Format version 1 (Wear OS 4+) — widest device coverage. -->
        <property
            android:name="com.google.wear.watchface.format.version"
            android:value="1" />

        <!-- Installable without a companion phone app -->
        <meta-data
            android:name="com.google.android.wearable.standalone"
            android:value="true" />
    </application>
</manifest>
`);
  writeFileSync(resolve(app, 'res/xml/watch_face_info.xml'), `<?xml version="1.0" encoding="utf-8"?>
<WatchFaceInfo>
    <Preview value="@drawable/preview" />
    <MultipleInstancesAllowed value="false" />
    <!-- Editable=true surfaces the on-watch customization editor (themes, toggles,
         complications). Unvalidated by the wff-validator — do not remove. -->
    <Editable value="true" />
</WatchFaceInfo>
`);
  const stringsXml = Object.entries(strings)
    .map(([k, v]) => `    <string name="${k}">${String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</string>`)
    .join('\n');
  writeFileSync(resolve(app, 'res/values/strings.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
${stringsXml}
</resources>
`);
  // keystore copy
  const ks = resolve(ROOT, 'collection3-debug.keystore');
  if (existsSync(ks)) copyFileSync(ks, resolve(base, 'collection3-debug.keystore'));
  return base;
}

// Copy the font files a face actually uses into res/font (lowercase names).
import { readdirSync } from 'node:fs';
export function copyFonts(entry, usedFamilies) {
  const src = resolve(ROOT, 'collection3-tools/fonts');
  const dst = resolve(ROOT, entry.dir, 'app/src/main/res/font');
  const all = readdirSync(src);
  for (const fam of usedFamilies) {
    const file = `${fam}.ttf`;
    if (all.includes(file)) copyFileSync(resolve(src, file), resolve(dst, file));
    else throw new Error(`missing font file ${file} for ${entry.face.id}`);
  }
}
