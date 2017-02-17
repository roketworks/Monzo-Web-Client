# Monzo Web Client [![Build Status](https://travis-ci.org/roketworks/Monzo-Web-Client.svg?branch=master)](https://travis-ci.org/roketworks/Monzo-Web-Client)
Monzo Web client built with node, express, postgres. Current allows viewing transaction history as a list and exporting. Also has view for indiviual transactions. Plans to add budgeting features per category similar to Monzo iOS app. Currently WIP. 

## Building & Running

Before you start you will need to have obained a client key & secret from the [Monzo developer dashboard](https://developers.getmondo.co.uk) and a local postgres database. (And obviously node.js installed on your machine...)

1. Download or clone repository
2. Create .env file in root directory based on sample.env (populate with your own configuration values)
3. Run `npm run -s initdb` in the root folder of the project. This will run the sequelize orm database migration and seeding against the connection string set in your .env file 
4. To debug locally use Visual Studio Code, there is a launch profile `Debug Transpiled` which will build the project into the dist folder and debug using source maps. Breakpoints can be set normally in the /src folder and they should be hit. By default it will listen on port 8081. 
