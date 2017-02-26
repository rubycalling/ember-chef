import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('authenticated', { path: '' }, function() {
    this.route('recipes', { path: 'recipes/:recipeId' });
  });
});

export default Router;
