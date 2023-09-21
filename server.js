const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let rooms = [
    {
        room_name: 1,
        x_id: null,
        o_id: null,
    },
]

function find(gamer_id) {

    let for_return = null;
    rooms.forEach((item) => {
        if (item.x_id == gamer_id) {
            for_return =  item.o_id;
        } else if (item.o_id == gamer_id) {
            for_return =  item.x_id;
        }
    });

    return for_return
}



io.on('connection', (socket) => {

    console.log(socket.id);

    if (rooms.length > 0) {
        if (rooms[rooms.length - 1].x_id == null) {
            rooms[rooms.length - 1].x_id = socket.id;
            io.to(socket.id).emit("enable", {
                caracter: "x",
                room_name: "room" + rooms[rooms.length - 1].room_name,
                lock: true
            });
        } else if (rooms[rooms.length - 1].o_id == null) {
            rooms[rooms.length - 1].o_id = socket.id;
            io.to(socket.id).emit("enable", {
                caracter: "o",
                room_name: "room" + rooms[rooms.length - 1].room_name,
                lock: true
            });

            io.to(rooms[rooms.length - 1].x_id).emit("enable", {
                caracter: "x",
                room_name: "room" + rooms[rooms.length - 1].room_name,
                lock: false
            });
        } else {
            let new_room = {
                room_name: (rooms[rooms.length - 1].room_name + 1),
                x_id: socket.id,
                o_id: null
            }
            rooms.push(new_room);
            io.to(socket.id).emit("enable", {
                caracter: "x",
                room_name: "room" + rooms[rooms.length - 1].room_name,
                lock: false
            });
        }
    } else {
        rooms.push({
            room_name: 1,
            x_id: socket.id,
            o_id: null
        });
        io.to(socket.id).emit("enable", {
            caracter: "x",
            room_name: "room" + rooms[rooms.length - 1].room_name,
            lock: false
        });
    }




    socket.on('change_roll', (change_roll) => {


        if (change_roll.x_roll) {
            io.to(find(socket.id)).emit("change_roll", {
                caracter: "x",
                x_cols: change_roll.x_cols,
                o_cols: change_roll.o_cols,
                x_roll: change_roll.x_roll,
                o_roll: change_roll.o_roll,
                x_win: change_roll.x_win,
                o_win: change_roll.o_win,

            });
        } else if (change_roll.o_roll) {
            io.to(find(socket.id)).emit("change_roll", {
                caracter: "o",
                x_cols: change_roll.x_cols,
                o_cols: change_roll.o_cols,
                x_roll: change_roll.x_roll,
                o_roll: change_roll.o_roll,
                x_win: change_roll.x_win,
                o_win: change_roll.o_win,
            });
        }

    });

    socket.on("disconnect", () => {

        console.log(find(socket.id));

        io.to(find(socket.id)).emit("leve_enemy", {
            status: true,
            message: "Your opponent is out of the game",
        });

        rooms.forEach((item) => {
            if (item.x_id == socket.id) {
                item.x_id = null
            } else if (item.o_id == socket.id) {
                item.o_id = null
            }
        });

        

        console.log(rooms)



    });

});


server.listen(5000, () => {
    console.log('listening on *:5000');
});