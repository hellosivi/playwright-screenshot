# Screenshot your website programmatically

This script will take screenshots of your website programmatically by using Playwright in different viewpoints based on a configuration file.

## Requirements

- MacOS, Linux or Windows with or without WSL (with subsystem for Linux)
- [Node.js](https://nodejs.org/en/)
- [Playwright](https://playwright.dev/)
- [GIT](https://git-scm.com/downloads)
- (Optional) [Visual Studio Code](https://code.visualstudio.com/download) or others

## Step-by-step guide
- Install Node.js if you have not.
- [Clone the repository from GIT](https://github.com/fztu/test-playwright.git). 
- Run ```npm install``` to install the node modules.
- Copy the example folder to your project (abc) folder.
- Update the abc/config.json accordingly
- Run ```node screenshot.js abc``` to take the screenshots
- Screenshots are saved in abc/screenshots folder