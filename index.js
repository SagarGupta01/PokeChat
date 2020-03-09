const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
let users = [{nickname: "Bulbasaur", idn: "0", classtag: "0", namecolor: "#000000"}, {nickname: "Charmander", idn: "1", classtag: "0", namecolor: "#000000"}, {nickname: "Squirtle", idn: "2", classtag: "0", namecolor: "#000000"}, {nickname: "Chikorita", idn: "3", classtag: "0", namecolor: "#000000"}, {nickname: "Cyndaquil", idn: "4", classtag: "0", namecolor: "#000000"}, {nickname: "Totodile", idn: "5", classtag: "0", namecolor: "#000000"}, {nickname: "Pikachu", idn: "6", classtag: "0", namecolor: "#000000"}, {nickname: "Tepig", idn: "7", classtag: "0", namecolor: "#000000"}, {nickname: "Snivy", idn: "8", classtag: "0", namecolor: "#000000"}, {nickname: "Mew", idn: "9", classtag: "0", namecolor: "#000000"}];
let counter = 0;
let connectedusers = [];
let messagelist = [];
let cookiesval = "";


//Middle ware for servering static files when main request is made
app.use(express.static(path.join(__dirname, 'public')));

//Route handler
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    
});


io.on('connection', function(socket){


    
    io.to(socket.id).emit('checking cookies', users[counter]);
    console.log("users counter emitted"+users[counter].nickname);
    
    
    
    
    socket.on('new cookie', function(msg){

        

        console.log(msg);
        counter++;
        console.log(counter);

        io.to(socket.id).emit('set cookie', users[counter-1]);


        try {

            users[counter-1].idn = socket.id;
            
        } catch (TypeError) {
    
            io.emit('finalerror', "Terminated, the application needs to be restarted since the user list is exhausted");
            process.exit(0);
            
        }
        
        users[counter-1].classtag = counter;
    
        let userfinder = (element) => element.idn === socket.id;
        let userfinderconnected = (element) => element.idn === socket.id;
    
        let founduser = users.findIndex(userfinder);
        connectedusers.push(users[founduser]);
    
        let foundconnected = connectedusers.findIndex(userfinderconnected);
    
    
        io.emit('user update', connectedusers);
    
        io.to(connectedusers[foundconnected].idn).emit('current user', connectedusers[foundconnected]);
    
        io.to(connectedusers[foundconnected].idn).emit('show allmessages', messagelist);


    });
    

    
    socket.on('found cookie', function(msg){

        console.log("in found cookie method");

        cookiesval = msg;
        console.log("the values of cookie val is"+cookiesval);
        let cookiesexist = (whichcookie) => whichcookie.nickname === cookiesval;
        
        if(connectedusers.findIndex(cookiesexist) != -1){
            console.log("pre exising username taken");
        }
        else{


            let returninguser = (refind) => refind.nickname === cookiesval;
            let userfinderreconnected = (element) => element.idn === socket.id;
            let foundreturninguser = users.findIndex(returninguser);
            users[foundreturninguser].idn = socket.id;
            connectedusers.push(users[foundreturninguser]);

            let foundreconnected = connectedusers.findIndex(userfinderreconnected);

            io.emit('user update', connectedusers);
        
            io.to(connectedusers[foundreconnected].idn).emit('current user', connectedusers[foundreconnected]);
        
            io.to(connectedusers[foundreconnected].idn).emit('show allmessages', messagelist);

            
        }

        

    });
    
    //Listen for the chat message event
    socket.on('chat message', function(msg){

        let finder = (element) => element.idn === socket.id;
        let indexing = users.findIndex(finder);
        
        let parsing = msg;
        let splitter = msg.split(' ');

        if(parsing.search("/") === 0){

            if(splitter[0] === "/nick"){

                splitter.splice(0, 1);

                let changedname = "";

                splitter.forEach(names => {

                    changedname = changedname+names;

                });
                let existingnickusers = (naming) => naming.nickname === changedname;
                let exsitingnicklist = (naminglist) => naminglist.nickname === changedname;
                if(connectedusers.findIndex(existingnickusers) === -1 && users.findIndex(exsitingnicklist) === -1){

                    users[indexing].nickname = changedname;
                    io.emit('user change', users[indexing]);
                    io.to(users[indexing].idn).emit("current user topname change", users[indexing]);

                }
                else{
                    io.to(users[indexing].idn).emit("displayerror","This name is either already in use by a user or on the server list of reserved names");
                }
                
                
            }
            else if(splitter[0] === "/nickcolor"){

                let colorchecker = new RegExp('^[0-9A-Fa-f]{6}$');

                if(colorchecker.test(splitter[1])){
                    users[indexing].namecolor = '#'+splitter[1];
                    io.emit('color change', users[indexing]);
                    io.to(users[indexing].idn).emit("current user topname change", users[indexing]);
                }
                else{
                    
                    io.to(users[indexing].idn).emit("displayerror","The entered color is not a valid six character color");
                }
                
            }
            else{

                io.to(users[indexing].idn).emit("displayerror","The '/' command was not recognized as valid");
            }
            
        }
        else{

            let fullmessage = new Date().toLocaleTimeString()+" "+"User "+'<span style="color:'+users[indexing].namecolor+'">'+users[indexing].nickname+'</span>'+" "+msg;

            socket.broadcast.emit('chat message', fullmessage);
            io.to(users[indexing].idn).emit('bolding', fullmessage);
            messagelist.push(fullmessage);
            io.to(users[indexing].idn).emit("current user topname change", users[indexing]);


        }

    });

    socket.on('disconnect', function(){
        let whichuser = (element) => element.idn === socket.id;
        let whichusernoconnect = (element) => element.idn === socket.id;
        let theuser = users.findIndex(whichuser);
        let theuserconnect = connectedusers.findIndex(whichusernoconnect);
        io.emit('user delete', users[theuser].classtag);
        connectedusers.splice(theuserconnect,1);
    });

});

//Set up a server listener
http.listen(3000, function(){
    console.log('Server listening on port 3000');

});