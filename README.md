# Node.JS, Express, PostgreSQL RESTful API

Building a RESTful API using Express JS and PostgreSQL

Eg: CRUD functions to manipulate Genres table in a Movies database

## Resources

- Node.JS [https://nodejs.org](https://nodejs.org/)
- Express [http://expressjs.com/](http://expressjs.com/)
- PostgreSQL - [https://www.postgresql.org/](https://www.postgresql.org/)
- pg (npm) node-postgres [https://www.npmjs.com/package/pg](https://www.npmjs.com/package/pg)
- nodemon (npm) - to watch for changes in files and automatically restart the node process (for development)
- Joi (npm) - to perform input validation

## Steps

- Install Node.JS
- Install Express and load Express in the application
- Install Joi and load it in the application
- Install node-postgres, load it and setup the connection
- To pass JSON object with the body of the request, we need to use express.json() in the top
	- `app.use(express.json());`

#### Load Express and Joi   

    const Joi = require('joi');
    const express = require('express');
    const app = express();

#### Listen to a given port 
    const port = process.env.PORT  ||  3000;    
    app.listen(port, () =>  console.log(`Listening to port ${port}...`));

#### Function to validate input
   
    function validateGenre(genre){
	    const schema  = {
		    name: Joi.string().required()
	    };
	    return Joi.validate(genre, schema);
    }
#### PostgreSQL Connection

    const { Pool, Client } =  require('pg');    
    const  pool  =  new  Pool({    
	    user:  'postgres',    
	    host:  'localhost',    
	    database:  'Movies',    
	    password:  'abc123',    
	    port:  5432   
    })

## Methods
#### GET (Get all items)
    app.get('/api/genres', (req,res) => {
        pool.query('SELECT * FROM genre', (error, result) => {    
		    res.send(result.rows);    
	    });    
    });
    
#### GET (Get item by id)
    app.get('/api/genres/:id', (req,res) => {  
	    pool.query(`SELECT * FROM genre WHERE id=${req.params.id}`, (error, result) => {
		    if(!result.rows[0] ||  result.length  ==  0) res.status(404).send('The Genre not found!');    
		    res.send(result.rows[0]);    
	    });
    });
    
#### POST (Add new item)
    app.post('/api/genres',(req,res) => {
        const { error } =  validateGenre(req.body);    
	    if (error) return  res.status(400).send(error.details[0].message);
	    
	    var  genreCount;    
	    pool.query('SELECT * FROM genre', (error, result) => {    
		    genreCount  =  result.rowCount  +  1;    
		    var  text  =  'INSERT INTO genre (id, name) VALUES ($1, $2) RETURNING id';
	        var  values  = [genreCount, req.body.name];
	        
	        pool.query(text, values, (error, result) => {
		        if (error) console.log('Error when adding new genre!');
		        res.send(result);
			});
        });
    });

#### PUT (Edit an existing item)

    app.put('/api/genres/:id', (req,res) => { 
        pool.query(`SELECT * FROM genre WHERE id=${req.params.id}`, (error, result) => {
		    if (!result.rows[0] ||  result.length  ==  0) res.status(404).send('The Genre not found!');    
	    });
	    
	    const { error } =  validateGenre(req.body);
        if(error) return  res.status(400).send(error.details[0].message);
		
	    var text  =  'UPDATE genre SET name = ($1) WHERE id = ($2)';
	    var values  = [req.body.name, req.params.id];
	    
	    pool.query(text, values, (error, result) => {    
		    if (error) console.log('Error when updating the genre!');    
		    res.send(result);
		});
    });

#### DELETE (Edit an existing item)

    app.delete('/api/genres/:id', (req,res)=>{
	    pool.query(`SELECT * FROM genre WHERE id=${req.params.id}`, (error, result) => {
	    	if (!result.rows[0] ||  result.length  ==  0) res.status(404).send('The Genre not found!');    
		    var text  =  'DELETE FROM genre WHERE id=($1)';
	        var values  = [req.params.id];
	        pool.query(text, values, (error, result) => {    
			    if (error) console.log('Error when deleting the genre!');
				res.send(result);
		    });        
	    });
    });
