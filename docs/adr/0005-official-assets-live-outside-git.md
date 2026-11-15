# Official assets live outside git

This repository is public, so Nintendo's portraits, music, sound effects and announcer lines are not committed to it. They are kept in a private storage bucket, described by a manifest in the repo and fetched by a script for development and deploys. Committing them was rejected because it would expose the repository itself to a takedown, separately from the site; making the repo private was rejected to keep the code open. Reference screenshots in `docs/references/` are the exception: they are low-risk and are not shipped.

Assets are gathered one template at a time, in build order, from SmashWiki (portraits) and fan-rip archives (audio), limited to what the screens need.
