
$(document).ready(function(){

    let socket = io();
    $(".sending").submit(function(e){
        e.preventDefault();
        socket.emit('chat message', $(".messaging").val());
        $(".messaging").val('');
        return false;
    });
    socket.on('checking cookies', function(msg){

        console.log("Inside check cookies");

        if(document.cookie.split(';').filter((item) => item.trim().startsWith('user=')).length){

            let cookiesclient = document.cookie.replace(/(?:(?:^|.*;\s*)user\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            console.log("the value of the cookie being emitted is"+cookiesclient);
            if(msg.nickname === cookiesclient){
                socket.emit('found cookie', cookiesclient);

            }
            else{

                socket.emit('new cookie', "Added");

            }
            
        }
        else{
    
            socket.emit('new cookie', "Added");
        }
        

    });
    socket.on('set cookie', function(msg){

        document.cookie = "user="+msg.nickname;

    });
    socket.on('chat message', function(msg){
        $(".innercontents").append($('<div>').append(msg));
        //Scroll to bottom on new message
        $(".messagepane").scrollTop($(".messagepane")[0].scrollHeight);
        

    });
    socket.on('bolding', function(msg){
        $(".innercontents").append($('<div>').append($('<b>').append(msg)));
        //Scroll to bottom on new message
        $(".messagepane").scrollTop($(".messagepane")[0].scrollHeight);
        

    });
    socket.on('user update', function(msg){

        msg.forEach(element => {

            $("div."+element.classtag).remove();
            $(".sideuserbar").append('<div class='+element.classtag+'>'+'<span style="color:'+element.namecolor+'">'+element.nickname+'</span>'+'</div>');
            
            
        });
        
        
        
    });
    socket.on('current user', function(msg){

        $("div.userinfo").append('<div class="topbar">You are '+msg.nickname+'</div>');
        
        
    });
    socket.on('current user topname change', function(msg){

        $("div.topbar").remove();
        $("div.userinfo").append('<div class="topbar">You are '+msg.nickname+'</div>');
        
        
    });
    socket.on('finalerror', function(msg){

        $("div.userinfo").append('<div class="topbar">'+'<span style="color:#FF0000">'+msg+'</span>'+'</div>');
        
        
    });
    socket.on('displayerror', function(msg){

        
        $("div.topbar").append('<span style="color:#FF0000">'+" "+" "+msg+'</span>');
        
        
    });
    socket.on('user change', function(msg){

        $("div."+msg.classtag).replaceWith("<div class="+msg.classtag+">"+'<span style="color:'+msg.namecolor+'">'+msg.nickname+'</span>'+"</div>");
        
        
    });
    socket.on('color change', function(msg){

        $("div."+msg.classtag).replaceWith("<div class="+msg.classtag+">"+'<span style="color:'+msg.namecolor+'">'+msg.nickname+'</span>'+"</div>");
        
    });
    socket.on('user delete', function(msg){
        $("div."+msg).remove();
        
    });
    socket.on('show allmessages', function(msg){
        if(msg.length > 0){

            msg.forEach(element => {

                $(".innercontents").append($('<div>').append(element));
                
            });

            $(".messagepane").scrollTop($(".messagepane")[0].scrollHeight);

        }
        
        
    });
    

});





