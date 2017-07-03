# Graphene

[![Build Status](https://travis-ci.org/pheneco/Graphene.svg?branch=master)](https://travis-ci.org/pheneco/Graphene)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fpheneco%2FGraphene.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fpheneco%2FGraphene?ref=badge_shield)
[![dependencies Status](https://david-dm.org/pheneco/graphene/status.svg)](https://david-dm.org/pheneco/graphene)
[![devDependencies Status](https://david-dm.org/pheneco/graphene/dev-status.svg)](https://david-dm.org/pheneco/graphene?type=dev)

The idea of Graphene is to build a comfortable and efficient workspace for creators to collaborate and produce content in a variety of differing fields. The name 'Graphene' is used to compare the user interaction to the molecular bonds in actual graphene, an infinite lattice wherein information should easily flow from point to another just as electrons would between these molecules. To accomplish this goal, Graphene will employ a modular system, with a core through which all information will eventually pass and modules for projects to be edited or eventually showcased.

## Installation

In the past I have only ever ran Graphene on Windows machines for one reason or another, so all the installation and some of the library choices are based on using Windows.

1. Before you begin, there are a few dependencies:
   - [MongoDB 3+](https://www.mongodb.com/)
   - [Node.JS 7+](https://nodejs.org/en/)
   - [Git 2+](https://git-scm.com/download/win)
   - [7-Zip](http://www.7-zip.org/)
   - [Windows build tools](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules)

2. Once you have all of the above programs installed (make sure to have all of these in your PATH), pick a directory to install Graphene into and navigate to it in Windows Explorer (I normally use c:\web).

3. SHIFT click and click "Open command window here".

4. In the command prompt that pops up run `git clone https://github.com/Trewbot/Graphene`.

5. Once this is finished you will have a "Graphene" directory, navigate into this.

6. There will be a "defaultConfig.json" file, you need to make a copy of this named "config.json".

7. In config.json replace all directories with those appropriate for your setup, add an API keys you see fit, and adjust any other settings you would like.

8. Start your MongoDB server. See https://www.mongodb.com/ for more details about this.

9. Once MongoDB is running and `addr.mongo` is properly set in config.json, you can run the "unpackLogs.bat" file. This will save the Graphene changelog into the database, this is important for pushing updates to both client and server.

10. In a Command Prompt in your Graphene directory, run `npm install` to install all dependencies for Graphene.

11. When this is finished you can run `npm run` or `node app.js` to start Graphene.
