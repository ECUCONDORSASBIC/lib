@echo off
echo === Altamedica Firebase Deployment ===
echo Cleaning previous build files...
call pnpm rimraf .next
call pnpm rimraf out
echo Building application...
call pnpm next build
echo Deploying to Firebase...
call firebase deploy --only hosting
echo Deployment complete!
