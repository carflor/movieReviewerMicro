const express = require('express');
const app = express();
const cors = require('cors');
const { uuid } = require('uuidv4');
app.use(express.json()); 
app.use(cors());
// app.use(express.state('public'));

app.locals.comments = [
  { id: 1, author: "ken", movie_id: 338762, comment: "jumping jesus"},
  { id: 2, author: "ken", movie_id: 338762, comment: "jumping jesu"},
  { id: 3, author: "ken", movie_id: 338762, comment: "jumping jes"},
  { id: 4, author: "ken", movie_id: 338762, comment: "jumping j"},
  { id: 5, author: "ken", movie_id: 5, comment: "jumping"},
]

app.locals.favoriteMovies = [
  {user_id: 59, movie_id: 475430},
  {user_id: 59, movie_id: 338762},
  {user_id: 59, movie_id: 508439},
  {user_id: 59, movie_id: 603},
]

app.set('port', process.env.PORT || 3001);

app.get('/', function(request, response) {
  response.send('Welcome to the Movie-Favorites-and-Commenting-API!');
})

app.get('/api/v1/comments', (request, response) => {
  response.status(200).json(app.locals.comments)
})

app.get('/api/v1/favoriteMovies', (request, response) => {
  response.status(200).json(app.locals.favoriteMovies)
})


app.get('/api/v1/movies/:movie_id/comments', (request, response) => {
  const movieId = parseInt(request.params.movie_id);
  const foundComments = app.locals.comments.filter(comment => comment.movie_id === movieId)
  if(!foundComments) {
    response.status(404).send(`Sorry, no comment found with an id of ${parseInt(request.params.movie_id)}`)
  }
  response.status(200).json(foundComments)
})

app.post('/api/v1/comments', (request, response) => {
  const id = uuid()
  const { author, movieId, comment } = request.body; 
  for (let requiredParameter of ['author', 'movieId', 'comment']) {
    if (!request.body[requiredParameter]) {
      response.status(422).json({
        error: `Expected format: { author: <string>, movieId: <number>, comment: <string>}. Missing a required parameter of ${requiredParameter}!`
      })
    }
  }
  app.locals.comments.push({ id, author, movie_id: movieId, comment });
  response.status(201).json({ id, author, movieId, comment });
})

app.get('/api/v1/favoriteMovies/:id', (request, response) => {
  const userId = parseInt(request.params.id);
  const foundUserFavorites = app.locals.favoriteMovies.filter(favoriteMovie => favoriteMovie.user_id === userId)
  if(!foundUserFavorites) {
    response.status(404).send(`Sorry, no user favorite found with an id of ${request.params.id}`)
  }
  response.status(200).json(foundUserFavorites)
})


app.post('/api/v1/favoriteMovies', (request, response) => {
  const { userId , movieId } = request.body; 
  for (let requiredParameter of ['userId', 'movieId']) {
    if (!request.body[requiredParameter]) {
      response.status(422).json({
        error: `Expected format: { userId: <number>, movieId: <number>}. Missing a required parameter of ${requiredParameter}!`
      })
    }
  }
  const findFavorite = app.locals.favoriteMovies.find(film => film.movie_id === movieId && film.user_id === userId)
  if(findFavorite === undefined) {
    app.locals.favoriteMovies.push({ user_id: userId, movie_id: movieId });
  }
 const favoritesCopy = [...app.locals.favoriteMovies]
  const newFavorites = favoritesCopy.reduce((favorites, film) => {
    if (film !== findFavorite) {
      favorites.push(film)
    }
    return favorites
  }, [])
  
  app.locals.favoriteMovies = newFavorites
  response.status(201).json({ userId, movieId });
})


app.listen(app.get('port'), () => {
  console.log(`App is now listening on port ${app.get('port')}!`)
});

