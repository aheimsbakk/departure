#!/usr/bin/env bash
# Bump version in src/sw.js, src/config.js, and package.json according to SemVer

set -euo pipefail

SW_FILE="src/sw.js"
CONFIG_FILE="src/config.js"
PKG_FILE="package.json"
SITEMAP_FILE="src/sitemap.xml"

for f in "$SW_FILE" "$CONFIG_FILE" "$PKG_FILE" "$SITEMAP_FILE"; do
	if [ ! -f "$f" ]; then
		echo "Error: $f not found" >&2
		exit 1
	fi
done

# Extract current version from config.js using sed (portable, no grep -P needed)
CURRENT=$(sed -n "s/.*export const VERSION = '\([0-9]*\.[0-9]*\.[0-9]*\)'.*/\1/p" "$CONFIG_FILE")
if [ -z "$CURRENT" ]; then
	echo "Error: VERSION not found in $CONFIG_FILE" >&2
	exit 1
fi

IFS='.' read -r MAJOR MINOR PATCH <<<"$CURRENT"

# Determine bump type
BUMP_TYPE="${1:-patch}"

case "$BUMP_TYPE" in
major)
	MAJOR=$((MAJOR + 1))
	MINOR=0
	PATCH=0
	;;
minor)
	MINOR=$((MINOR + 1))
	PATCH=0
	;;
patch)
	PATCH=$((PATCH + 1))
	;;
*)
	echo "Usage: $0 [major|minor|patch]" >&2
	echo "  major - Breaking changes (x.0.0)" >&2
	echo "  minor - New features (0.x.0)" >&2
	echo "  patch - Bug fixes (0.0.x) [default]" >&2
	exit 1
	;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# sed -i requires an explicit backup suffix on macOS; '' works on both Linux and macOS
SED_INPLACE=(sed -i)
if sed --version 2>/dev/null | grep -q GNU; then
	SED_INPLACE=(sed -i)
else
	SED_INPLACE=(sed -i '')
fi

# Update sw.js
"${SED_INPLACE[@]}" "s/const VERSION = '[0-9.]*';/const VERSION = '$NEW_VERSION';/" "$SW_FILE"

# Update config.js
"${SED_INPLACE[@]}" "s/export const VERSION = '[0-9.]*';/export const VERSION = '$NEW_VERSION';/" "$CONFIG_FILE"

# Update package.json
"${SED_INPLACE[@]}" "s/\"version\": \"[0-9.]*\"/\"version\": \"$NEW_VERSION\"/" "$PKG_FILE"

# Update sitemap.xml <lastmod> to today's date (docs/PROJECT_RULES.md §1)
TODAY=$(date +%Y-%m-%d)
"${SED_INPLACE[@]}" "s|<lastmod>.*</lastmod>|<lastmod>${TODAY}</lastmod>|g" "$SITEMAP_FILE"

echo "Version bumped: $CURRENT → $NEW_VERSION"
echo "Updated: $SW_FILE, $CONFIG_FILE, $PKG_FILE, $SITEMAP_FILE"
