import Ember from 'ember';

export default Ember.Route.extend({
  model({ recipeId }) {
    return this.get('store').findRecord('recipe', recipeId);
  }
});
