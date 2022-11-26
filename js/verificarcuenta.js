const { json } = require('body-parser');

function sqlcuenta(usuario,contraseña){
    aut=0;
    const mysql = require('mysql')
    const autenticacion= require('./../server.js')

    const connection = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'chat'
       
    });
    connection.connect((err)=>{
        if(err) throw err
        //La conexion con la base de datos fue exitosa
    });
    var aut=0;
    var text='index.html'
    consult="SELECT * FROM usuarios where usuario ='"+usuario+"'"
    connection.query(consult, function (err, rows){
        if(err) throw err
        const usu = rows.filter(
            (crr)=>crr.contraseña.toLowerCase()===contraseña.toLowerCase()
        );
        if(Object.keys(usu).length === 0){
            //La contraseña fue incorrecta
            aut=0
            text='index.html'
            autenticacion.resultadoautenticacion(aut,text)
            
        }else{
            //La contraseña fue correcta
            aut=10
            text='./html/chat.html'
            autenticacion.resultadoautenticacion(aut,text)
        }
    });
    connection.end()
}
exports.sqlcuenta= sqlcuenta;