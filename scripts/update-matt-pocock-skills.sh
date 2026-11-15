#!/usr/bin/env bash
# Replace the vendored Matt Pocock skills in .claude/skills with the latest
# release of https://github.com/mattpocock/skills.
#
# Only the skills that upstream ships in its Claude Code plugin are copied
# (the list in upstream's .claude-plugin/plugin.json). Everything else in
# .claude/skills is left alone, so project-specific skills survive an update.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$REPO/.claude/skills"
MANIFEST="$DEST/.mattpocock-skills.json"
UPSTREAM_URL="https://github.com/mattpocock/skills"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --quiet --depth 1 "$UPSTREAM_URL" "$TMP/upstream"
cd "$TMP/upstream"
COMMIT="$(git rev-parse HEAD)"

# Paths of the plugin's skills, and its version, from upstream's manifest.
VERSION="$(node -p 'require("./.claude-plugin/plugin.json").version')"
mapfile -t SKILL_PATHS < <(node -p 'require("./.claude-plugin/plugin.json").skills.join("\n")')

mkdir -p "$DEST"

# Remove the skills installed by the previous run.
if [ -f "$MANIFEST" ]; then
  while IFS= read -r name; do
    [ -n "$name" ] && rm -rf "${DEST:?}/$name"
  done < <(node -p "require('$MANIFEST').skills.join('\n')")
fi

NAMES=()
for path in "${SKILL_PATHS[@]}"; do
  name="$(basename "$path")"
  rm -rf "${DEST:?}/$name"
  cp -R "$path" "$DEST/$name"
  NAMES+=("$name")
done
cp LICENSE "$DEST/LICENSE-mattpocock-skills"

node -e '
  const [file, version, commit, ...skills] = process.argv.slice(1);
  require("fs").writeFileSync(file, JSON.stringify(
    { source: "https://github.com/mattpocock/skills", version, commit, skills: skills.sort() }, null, 2) + "\n");
' "$MANIFEST" "$VERSION" "$COMMIT" "${NAMES[@]}"

echo "Vendored mattpocock-skills v$VERSION (${COMMIT:0:7}): ${#NAMES[@]} skills into .claude/skills"
