const app = require ('./app');
const connectDatabase = require('./config/database')

const dotenv = require('dotenv');

// Handle UNcaught exeptions
process.on ('uncaughtException', err => {
    console.log(`Error: ${err.stack}`);
    console.log('Shutting down due to uncaught exeption');
    process.exit(1)
})

// setting up config file
dotenv.config({path : 'backend/config/config.env'})



//Connecting to data base
connectDatabase();


const server = app.listen(process.env.PORT, ()=>{
    console.log(`server started PORT : ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

//Handle Unhadled promise rejections
process.on('unhandledRejection',err => {
    console.log(`Error  ${err.stack}`);
    console.log(('Shutting down the server due ton Unhandled **promise rejection'));
    server.close(()=> {
        process.exit(1)
    })
})