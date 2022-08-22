// invocamos a express
const express = require('express');
const app = express();

//URLENCODE pra capturar datos 
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// directorio publico 
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//  establecer motor de plantilla 
app.set('view engine', 'ejs');

// invocar bcrypts
const bcrypts = require('bcryptjs');

// variable de session 
const session = require('express-session'); 
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}))

// invocamos al modulo de la conexion 
const connection = require('./database/db');

// estableciendo las rutas 

app.get('/login', (req, res)=>{
    res.render('login');
})

app.get('/register', (req, res)=>{
    res.render('register');
})

app.get('/add_lib', (req, res)=>{
    res.render('add_lib');
})

app.get('/libros', (req, res)=>{

	connection.query('SELECT * FROM libros', (error, results)=>{
		if(error){
			throw error;
		}else{
			res.render('libros', {results:results})
		}
	})
})

// Método para la REGISTRACIÓN
app.post('/register', async (req, res)=>{
	const user = req.body.user;
	const name = req.body.name;
	const password = req.body.password;
	let passwordHash = await bcrypts.hash(password, 8);

	connection.query('INSERT INTO users SET ?', {user:user, name:name, password:passwordHash}, async(error, results)=>{
		if(error){
			console.log(error);
		}else{
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});
		}
	})
})


// metodo para registrar libros
app.post('/add_lib', async (req, res)=>{
	const titulo = req.body.titulo;
	const autor = req.body.autor;
	const genero = req.body.genero;
	const paginas = req.body.paginas;
	const estatus = req.body.estatus;

	connection.query('INSERT INTO libros SET ?', {titulo:titulo, autor:autor, genero:genero, paginas:paginas, estatus:estatus}, async(error, results)=>{
		if(error){
			console.log(error);
		}else{
			res.redirect('libros');
		}
	})
})


//11 - Metodo para la autenticacion
app.post('/auth', async (req, res) =>{
	const user = req.body.user;
	const password = req.body.password;
	let passwordHash = await bcrypts.hash(password, 8);
	if(user && password){
		connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=>{
			if(results.length == 0 || !(await bcrypts.compare(password, results[0].password))){
				res.render('login', {
					alert: true,
					alertTitle: "Error",
					alertMessage: "USUARIO y/o PASSWORD incorrectas",
					alertIcon:'error',
					showConfirmButton: true,
					timer: false,
					ruta: 'login'    
				});
			}else{
				req.session.loggedin = true;
				req.session.name = results[0].name
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        	
			}
		})
	}else{
		res.render('login', {
			alert: true,
			alertTitle: "Advertencia",
			alertMessage: "¡Por favor ingrese un usuario y/o password!",
			alertIcon:'wearing',
			showConfirmButton: true,
			timer:'false',
			ruta: 'login'
		}); 
	}
})


//index
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});	
					
	}
	res.end();
});


// logoust 

app.get('/logout', (req, res)=>{
	req.session.destroy(()=>{
		res.redirect('/')
	})
})

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});