const bdatos= require('./js/mysql.js')
const autenticacion= require('./js/verificarcuenta')

var express = require('express')
const bodyParser = require('body-parser')
const { socket } = require('socket.io')
const { emit } = require('process')
const path = require("path");
var app = express().use(bodyParser.json());
var http = require('http').Server(app)
var io = require('socket.io')(http)

//empezamos enviando los estilos de css
app.get("/css/normalize.css",(req,res)=>{
    res.status(200).sendFile(path.resolve(__dirname,'./css/normalize.css'));
});
app.get("/css/estilos.css",(req,res)=>{
    res.status(200).sendFile(path.resolve(__dirname,'./css/estilos.css'));
});
app.get("/css/estiloschat.css",(req,res)=>{
    res.status(200).sendFile(path.resolve(__dirname,'./css/estiloschat.css'));
});
//Enviamos la pagina principal
app.get("/",(req,res)=>{
    res.status(200).sendFile(path.resolve(__dirname,'index.html'));
});

//body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

//Creamos los objetos necesarios
var allmensajes=[
    {
    }
]
var usuarios = [
    {
    }
]
var myprofile = [
    {
    }
]
//Endpoints para escuchar todos los eventos necesarios
//endpoint/uri/myprofile
app.get('/myprofile', (req,res)=>{
    res.send(myprofile)
});
//endpoint/uri/usuarios
app.get('/usuarios', (req,res)=>{
    res.send(usuarios)
});
//endpoint/uri/allmensajes
app.get('/allmessajes', (req,res)=>{
    res.send(allmensajes)
});

//Escuchar/emitir eventos con socket.io
io.on('connection',(socket)=>{
    //Autenticacion de cuenta
    socket.on('verificarcuenta',function(data){
        aut=autenticacion.sqlcuenta(data.usuario, data.contraseña); 
    })
    //Proceso cuando ya se verifico la autenticidad de una cuenta
    socket.on('cuentaverificada',function(data){
        var sok=socket.id
        var name=data.usuario
        usuarios.push({id:sok, nombre:name})
        console.log(usuarios)
        //enviar los datos de mi perfil
        io.to(sok).emit('getmyprofile',name)
        //avisar a los clientes que se conecta un nuevo usuario
        io.emit('clienteconectado',usuarios)
        console.log('hasta aqui')
    })

    //Chat
    //Conexion de un usuario
    socket.on('nuevouser',function(nick){
        //usuarios.push({id:socket.id, nombre:nick})
        //avisar a los clientes que se conecta un nuevo usuario
        io.emit("clienteconectado",usuarios)
    })
    //Desconexion de un usuario
    var user=""
    socket.on('disconnect',()=>{
        eliminarUsuario(user);
        io.emit('usuariodesconectado','desconectado:'+user)
    })

    socket.on('mensaprivado',function(data){
        bdatos.sql(data.destinatarioID,data.tabla,data.nombreemite,data.mensaje) 
    })
    socket.on('cargartodosmensajes',function(data){
        bdatos.sqlobtenermensajes(data.socketID,data.tabla)
        //emitir evento 'recibirmensaje' para un usuario
        //io.to(data.destinatarioID).emit('recibirmensajeprivado',data)   
    })
})
function cargarmensajes(socketid,mensajes) {
    allmensajes=mensajes
    io.to(socketid).emit('uploadallmensages',allmensajes)  
}
function eliminarUsuario(val){
    for(var i=0; i<usuarios.length;i++){
        if(usuarios[i].nombre==val){
            usuarios.splice(i,1)
            break;
        }
    }
}
var server = http.listen(3000,()=>{
    console.log("Servidor corriendo en el puerto:",
    server.address().port);
})
function resultadoautenticacion(aut,text) {
    io.emit('autenticacion',aut,text)
    if(aut>0){
        app.get("/html/chat.html",(req,res)=>{
            res.status(200).sendFile(path.resolve(__dirname,'./html/chat.html'));
        });
    }
}
exports.resultadoautenticacion= resultadoautenticacion;
exports.cargarmensajes= cargarmensajes;