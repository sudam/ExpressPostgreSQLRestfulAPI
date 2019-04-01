const { Pool, Client } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Vidly',
    password: 'abc123',
    port: 5432
  })

const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());

// get all genres
app.get('/api/genres', (req, res) => {
    pool.query('SELECT * FROM genre', (error, result) => {
        res.send(result.rows);
      });
});

// get genres by id
app.get('/api/genres/:id', (req,res) => {
    // check if requested genre exists
    pool.query(`SELECT * FROM genre WHERE id=${req.params.id}`, (error, result) => {
        if(!result.rows[0] || result.length == 0) res.status(404).send('The Genre not found!');
        res.send(result.rows[0]); 
      });
});

// post a new genre
app.post('/api/genres', (req, res) => {
    // validate the requested genre
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // if valid, add new genre object 
    var genreCount;
    pool.query('SELECT * FROM genre', (error, result) => {
        genreCount = result.rowCount + 1;

        var text = 'INSERT INTO genre (id, name) VALUES ($1, $2) RETURNING id';
        var values = [genreCount, req.body.name];

        pool.query(text, values, (error, result) => {
            if (error) console.log('Error when adding new genre!');
            res.send(result);
        });
    });
});

// update an existing genre
app.put('/api/genres/:id', (req,res) => {
    // check if the requested genre id exists
    pool.query(`SELECT * FROM genre WHERE id=${req.params.id}`, (error, result) => {
        if (!result.rows[0] || result.length == 0) res.status(404).send('The Genre not found!');
    });

    // validate the requested genre
    const { error } = validateGenre(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // if valid, update the with the new values
    var text = 'UPDATE genre SET name = ($1) WHERE id = ($2)';
    var values = [req.body.name, req.params.id];

    pool.query(text, values, (error, result) => {
        if (error) console.log('Error when updating the genre!');
        res.send(result);
    });
});

// delete an existing genre
app.delete('/api/genres/:id', (req,res)=>{
    // check if requested genre id exists
    pool.query(`SELECT * FROM genre WHERE id=${req.params.id}`, (error, result) => {
        if (!result.rows[0] || result.length == 0) res.status(404).send('The Genre not found!');
        
        var text = 'DELETE FROM genre WHERE id=($1)';
        var values = [req.params.id];

        pool.query(text, values, (error, result) => {
            if (error) console.log('Error when deleting the genre!');
            res.send(result);
        });        
    });
});


// listen to a given port (PORT - environment in which the process run)
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}...`));

// validate input
function validateGenre(genre){
    const schema = {
        name: Joi.string().required()
    };
    return Joi.validate(genre, schema);
}