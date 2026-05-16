# KINGFROGS Soundboard

This is a browser soundboard app that dynamically loads audio files from the `sound/` folder.

## Vercel deployment

1. Push this repository to GitHub.
2. In Vercel, import the repository.
3. Vercel will install dependencies and deploy the static app plus the serverless API.

## GitHub integration

- Every push to GitHub will trigger a new Vercel deployment.
- Keep audio files in the `sound/` folder, then push changes to update the live site.

## Local development

- Run locally with `npx vercel dev`.
- The app is deployed as a static site with the `/sound-files` API route handled by `api/sound-files.js`.
