#!/usr/bin/env bash
set -euo pipefail

# Cuts a release: build, bump version + tag, then (after confirmation)
# push the tag and publish to npm.
#
# Usage: npm run release -- <patch|minor|major|1.2.3>

BUMP="${1:?Usage: npm run release -- <patch|minor|major|version>}"

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
	echo "Working tree not clean. Commit or stash changes first." >&2
	exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
	read -r -p "You're on branch '$BRANCH', not main. Continue? [y/N] " ans
	[[ "$ans" =~ ^[Yy]$ ]] || exit 1
fi

echo "==> Building"
npm run build

echo "==> Bumping version ($BUMP)"
npm version "$BUMP" -m "chore: release v%s"
NEW_VERSION="$(node -p "require('./package.json').version")"

echo
echo "Version bumped to v$NEW_VERSION and tagged locally."
read -r -p "Push commit + tag to origin/$BRANCH now? [y/N] " ans
if [[ "$ans" =~ ^[Yy]$ ]]; then
	git push origin "$BRANCH"
	git push origin "v$NEW_VERSION"
	echo "Pushed. GitHub Actions will create the GitHub release from CHANGELOG.md (or auto-generated notes)."
else
	echo "Skipped push. Re-run manually when ready: git push origin $BRANCH && git push origin v$NEW_VERSION"
	exit 0
fi

echo
read -r -p "Publish v$NEW_VERSION to npm now? [y/N] " ans
if [[ "$ans" =~ ^[Yy]$ ]]; then
	npm publish
	echo "Published v$NEW_VERSION to npm."
else
	echo "Skipped publish. Re-run manually when ready: npm publish"
fi
