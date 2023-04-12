# 1 Rockmelon QA (IDE)

New revolution for software automation testing

# 2 Get Started

You will need to have [Node.js](https://nodejs.org) installed.

# 3 Development

## 3.1 Setup

Clone the repo:

- cd to `<project-folder>/common`, run `npm install` and `npm run build` for the first time. Run `npm run build` after you make changes to `common` code. You might need to close and reopen VSCode to help it update the intellisense cache.
- cd to `<project-folder>/svelte`, run `npm install` for the first time
- cd to `<project folder>`, run `npm install` for the first time

Source code structure:

- This project used the starter template from [here](https://github.com/el3um4s/memento-sveltekit-electron-typescript).
- Folders
  - `electron` - contains all electron and bootup specific code
  - `svelte` - contains the svelte app
  - `common` - contains the common code
  - `dist` - compiled electron and sevelte app
  - `dist/www` - compiled svelte app output files

Changing code in `common` folder

- When you change code in this folder, you need to build it again so that new types are compiled
- Run `npm run common:build`
- Restart your debugging session

## 3.2 Run Modes

There are several settings to switch between production (default) and development mode when the electron app starts.

- `isInProduction`: true if is in production (default is true)
- `serveSvelteDev`: true when you want run svelte development server and reload when files change
- `watchSvelteBuild`: true when you want run svelte builds and reload when files change

The default mode is production.

## 3.3 Run in Electron and Svelte Development Mode

Use this setup when you need to change both electron and svelte files.

1. Create a `.env` file at root folder with following setting to override the default:

   ```
   IS_IN_PRODUCTION=false
   SERVE_SVELTE_DEV=true
   WATCH_SVELTE_BUILD=false
   ```

2. Open terminal window and run `npm run svelte:dev`.

   - Compiles your Svelte app and serve from the development server.
   - Watches for file changes and re-compiles.

3. Open another terminal window and run `npm run nodemon`.

   - Starts the electron app
   - Watches for file changes and re-starts.

4. Debugging
   - Type in `Ctrl-Shift-I` to open the Chrome developer tools
   - Use `debugger` to set break points
   - Use `console.log()` in the Svelte code to display messages in the Chrome developer tool console
   - Use `console.log()` in the Electron code to display messages in the terminal window

## 3.4 Run in Svelte Development Mode

Use this setup when you are only changing svelte files. Debugging and reloading for changes in electron is disabled.

1. Create a `.env` file at root folder with following setting to override the default:

   ```
   IS_IN_PRODUCTION=false
   SERVE_SVELTE_DEV=true
   WATCH_SVELTE_BUILD=false
   ```

2. Open terminal window and run `npm run svelte:dev`.

   - Starts the sveltekit dev server
   - Watches for file changes and re-compiles.

3. Open another terminal window and run `npm run start`.

   - Starts the electron app
   - Watches for file changes and re-starts.

4. Debugging
   - Type in `Ctrl-Shift-I` to open the Chrome developer tools
   - Use `debugger` to set break points
   - Use `console.log()` in the Svelte code to display messages in the Chrome developer tool console
   - Use `console.log()` in the Electron code to display messages in the terminal window

## 3.5 Run using Svelte Production Builds

Use this setup when you are only changing svelte files but you want to test using production svelte code (i.e. with optimization and minification).

1. Create a `.env` file at root folder with following setting to override the default:

   ```
   IS_IN_PRODUCTION=false
   SERVE_SVELTE_DEV=false
   WATCH_SVELTE_BUILD=true
   ```

2. Open terminal window and run `npm run svelte:build`.

   - Compiles your Svelte app into `dist/www` folder
   - Watches for file changes and re-compiles.

3. Open another terminal window and run `npm run start`.

   - Starts the electron app
   - Watches for file changes and re-starts.

4. Debugging

   - Type in `Ctrl-Shift-I` to open the Chrome developer tools
   - Use `debugger` to set break points
   - Use `console.log()` in the Svelte code to display messages in the Chrome developer tool console
   - Use `console.log()` in the Electron code to display messages in the terminal window

5. If you change your svelte source code, you will need to run `npm run svelte:build` again.
   - Electron will automatically reload after the build.

## 3.6 Run in Production Mode

In this mode, changes in svelte or electron files will NOT cause the app to reload.

1. Setup the build paramters by delelte the `.env` file or change the contents to

   ```
   IS_IN_PRODUCTION=true
   SERVE_SVELTE_DEV=false
   WATCH_SVELTE_BUILD=false
   ```

2. Open terminal window and run:
   ```
   npm run svelte:build
   npm run start
   ```

## 3.7 Publishing

See release process [here](./RELEASE.md)

## 4 Running Unit Tests

- cd to `<project-folder>/codegen`, run `npm test`

## 5 Troubleshooting

### 5.1 Manually install 'playwright msedge' in Linux

To run tests from **C#** generated code, we have to install [playwright browser](https://playwright.dev/docs/browsers) by executing `pwsh bin/Debug/netX/playwright.ps1 install` (run at `output-code` folder, `X` is dotnet version like `6.0`). The IDE already covers this step during code generation stage.

However, it only installs Chromium, Firefox and Webkit (Safari). Therefore, to execute test cases with **MS Edge & Google Chrome in Linux** (which does not include MS Edge browser by default), we need to install MS Edge manually by `pwsh bin/DebugX/playwright.ps1 install msedge`
