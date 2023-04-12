Rockmelon QA uses Github as code and installer repositories

Reference to [electron-builder](https://www.electron.build/) for the configuration in `package.json`.

GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) is required. You can generate by going to [here](https://github.com/settings/tokens/new). The access token should have the **repo scope/permission**

# 1 Windows installer

- In Ubuntu, need to `sudo apt install wine` first.
- If you want to create `*.exe` installer locally, then execute `npm run out:win`. The installer is under `release/build` folder.
- If you want to create `*.exe` installer then publish to Github:
  - Register `GH_TOKEN` envinment variable by `export GH_TOKEN=<your-access-token-here>`. You can check it again by `printenv GH_TOKEN`
  - Execute `npm run publish:win` to create the installer, then publish Github.
  - Visit [Rockmelon's release page](https://github.com/rockmelonqa/ide/releases), select new release, edit, then publish it. (We need this step to enable auto update, and people who are not contributors can download via direct link)

# 2 MacOS installer

(TODO)

# 3 Linux installer

(TODO)
