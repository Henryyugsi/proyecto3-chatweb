const { json } = require('body-parser');

function sql(idsocket,tabla,emisor,mensajeemisor){
    const mysql = require('mysql')
    const connection = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'chat'
       
    });
    connection.connect((err)=>{
        if(err) throw err
        //La conexion fue exitosa
    });
    var controlador=0;
    connection.query("SELECT table_name AS nombre FROM information_schema.tables WHERE table_schema = 'chat'", function (err, rows){
        if(err) throw err
        const usu = rows.filter(
            (crr)=>crr.nombre.toLowerCase()===tabla.toLowerCase()
        );
        console.log(usu)
        if(Object.keys(usu).length === 0){
            //No existe una base de datos para este chat
            controlador=1;
            creartabla(tabla)
        }else{
            añadirmensajes(tabla.toLowerCase(),emisor,mensajeemisor);
        }
    });
    connection.end()

    function añadirmensajes(tabla,emisor,mensajeemisor){
        const connection = mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'',
            database:'chat'
        });
        connection.connect((err)=>{
            if(err) throw err
            //Se establecio una conexion exitosa
        });
        var consult = "insert into "+tabla.toLowerCase()+"(emisor, mensajeemisor) VALUES ('"+emisor+"','"+mensajeemisor+"')"
        connection.query(consult, function (err, rows){
            if(err) throw err
            //Los mensajes fueron insertados correctamente en la bse de datos 
        });
        connection.end()
    }
    
    function creartabla(val){
        const connection = mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'',
            database:'chat'
        });
        connection.connect((err)=>{
            if(err) throw err
            //se tuvo una conexion exitosa
        });
        var consult = "create table "+val+"(id int auto_increment primary key, emisor varchar (25), mensajeemisor varchar(100))"
        connection.query(consult, function (err, rows){
            if(err) throw err
            //Se creo la tabla correctamente y se añade sus correspondientes mensajes
            añadirmensajes(tabla.toLowerCase(),emisor,mensajeemisor);
        });
        connection.end()
    }

}
exports.sql= sql;

function sqlobtenermensajes(socketid,tabla){
    const mysql = require('mysql')
    const server = require('./../server')
    const connection = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'chat'
    });
    connection.connect((err)=>{
        if(err) throw err
        //La conexion fue exitosa
    });
    var consult = "SELECT * FROM "+tabla.toLowerCase()

    connection.query(consult, function (err, rows){
        if(err) throw err
        const aux=JSON.stringify(rows)
        const aux1 = JSON.parse(aux)
        getmesajes(aux1)
    });
    function getmesajes(mens) {
        server.cargarmensajes(socketid,mens)
    }
    connection.end()

}
exports.sqlobtenermensajes= sqlobtenermensajes;

