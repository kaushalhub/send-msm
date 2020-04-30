const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo')
const socketio = require('socket.io');

// init nexmo 

const nexmo = new Nexmo({
        apiKey: '71dbb7cb',
        apiSecret: 'Xyjpf4xXaqD3mc4I'
}, {debug: true});

// init app 

const app = express();

//template engine setup 

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);


//public folder

app.use(express.static(__dirname + '/public'));

// body parser middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));

// index routes

app.get('/', (req, res) => {
        res.render('index');
});

//catch for submit 

app.post('/', (req, res) => {
  //  res.send(req.body);
  //  console.log(req.body);

        const number = req.body.number;
        const text = req.body.text;

        nexmo.message.sendSms(
                '919319501433' , number , text, {type: 'unicode'},
                (err, responseData) => {
                        if(err) {
                                console.log(err);
                        }else{
                                console.dir(responseData);
                                // get data from response
                                const data = {
                                        id: responseData.messages[0]['message-id'],
                                        number: responseData.messages[0]['to']
                                }

                                // emit to the client
                                io.emit('smsStatus' , data);
                        }
                }
        );

});

// define port

const port = 3000;

// start server 

const server = app.listen(port, () => console.log(`server started on port ${port}`));

// connect to socket.io

const io = socketio(server);
io.on('connection' , (socket) => {
        console.log('connected');
        io.on('disconnected', () => {
                console.log('Disconnected');
        })
})