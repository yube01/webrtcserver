const app = require("express")();
const server = require("http").createServer(app)
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const io = require("socket.io")(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

app.use(cors())


const PORT = process.env.PORT 


app.get("/",(req,res)=>{
    res.send("Server started")
})


const emailToSocketId = new Map()
const socketIdToName = new Map()


io.on("connection",(socket)=>{
    socket.emit("me",socket.id)


    socket.on("disconnect",()=>{
        socket.broadcast.emit("callended")
    })


    socket.on("room:join",data=>{
        const {name,room} = data
        //setting socket id for specific email
        emailToSocketId.set(name,socket.id)
        socketIdToName.set(socket.id,name)

        //sending joined user id detail to existing user in a room
        io.to(room).emit("user:joined",{name, id:socket.id})
        socket.join(room)

        io.to(socket.id).emit("room:join",data)
    })

    socket.on("user:call",({to,offer})=>{
        io.to(to).emit("incoming:call", {from:socket.id,offer})
    })


    socket.on("call:accepted", ({to, ans})=>{
        io.to(to).emit("call:accepted",{from:socket.id,ans})
    })



   
})



server.listen(PORT , ()=>{
    console.log("Server started")
})