export default function() {
  this.get('/recipes');
  this.get('/recipes/:id');
  this.get('/authors/:id');
}
