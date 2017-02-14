# Monzo Web Client
Monzo Web client built with node, express, postgres. Current allows viewing transaction history as a list and exporting. Also has view for indiviual transactions. Plans to add budgeting features per category similar to Monzo iOS app. Currently WIP. 

## Building & Running

Before you start you will need to have obained a client key & secret from the [Monzo developer dashboard](https://developers.getmondo.co.uk) and a local postgres database. (And obviously node.js installed on your machine...)

1. Download or clone repository
2. Create .env file in root directory based on sample.env (populate with your own configuration values)
3. Run `npm run -s initdb` This will run the sequelize orm dataabse migration and seeding against the connection string set in your .env file 
4. Run `npm run` to run, by default it will listen on port 8081. Alternatively, if you have opened the project in Visual Studio Code you can select the 'Launch Program' debug option to start a new instance. 
