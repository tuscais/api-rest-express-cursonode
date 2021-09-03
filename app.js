const express = require('express');
const morgan = require('morgan');
const debug = require('debug')('app:inicio');
const config = require('config');
const Joi = require('@hapi/joi');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//Configuración de entorno
console.log('Aplicación: '+ config.get('nombre'));
console.log('BD Server: '+ config.get('configDB.host'));

//Uso de middlware de terceros (morgan)
if (app.get('env') === 'development'){
    app.use(morgan('tiny'));
    debug('Morgan habilitado en el puerto ',port);
}


debug('Conectando a la BD...');
/*
app.get();      //Petición
app.post();     //Envío de datos
app.put();      //Actualización
app.delete();   //Eliminación
*/

let usuarios = [
    {id:1, nombre:'Elio'},
    {id:2, nombre:'Irvin'},
    {id:3, nombre:'Yael'},
    {id:4, nombre:'Edith'},
    {id:5, nombre:'Del'},
    {id:6, nombre:'Carmen'},
];

app.get('/', (req, res) => {
    res.send('Hola mundo desde Express...');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = ExisteUsuario(req.params.id);
    if (!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
});

app.post('/api/usuarios222', (req, res) => {
    let body = req.body;
    console.log(body.nombre);

    res.json({
        body
    })
});

app.post('/api/usuarios', (req, res) => {
    const {error, value} = ValidarUsuario(req.body.nombre);
    if (!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
});

app.put('/api/usuarios/:id', (req,res) => {
    //Encontrar si existe el obj usuario
    let usuario = ExisteUsuario(req.params.id);
    if (!usuario) res.status(404).send('El usuario no fue encontrado');
    /*
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    })
    //Validar el usuario
    const {error, value} = schema.validate({nombre: req.body.nombre})
    */
    const {error, value} = ValidarUsuario(req.body.nombre);
    if (error){        
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    } 

    usuario.nombre = value.nombre;
    res.send(usuario);
});

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = ExisteUsuario(req.params.id);
    if (!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    }     
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index,1);
    res.send(usuario); 
});


app.listen(port, () => {
    console.log(`Eschando desde el puerto: ${port}`);
});

function ExisteUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}

function ValidarUsuario(nomb){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    })
    return(schema.validate({nombre: nomb}));
}