# Vendored agent skills

The skill directories here are copied from [mattpocock/skills](https://github.com/mattpocock/skills)
(MIT, see `LICENSE-mattpocock-skills`). The vendored version, upstream commit and
skill names are recorded in `.mattpocock-skills.json`.

They live in the repo so every Claude Code session, including cloud and mobile
sessions, loads them from the checkout without installing a plugin.

## Updating

```bash
scripts/update-matt-pocock-skills.sh
```

The script replaces these skills with the ones in upstream's latest Claude Code
plugin and rewrites `.mattpocock-skills.json`. Skills in this folder that did
not come from upstream are left alone. After a major update, read upstream's
`CHANGELOG.md` and re-run `/setup-matt-pocock-skills` if it says `docs/agents/`
needs refreshing.

Do not also install the `mattpocock-skills` plugin for this project: that gives
every skill twice.
