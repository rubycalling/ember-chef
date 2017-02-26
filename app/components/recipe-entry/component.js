import Ember from 'ember';

const { computed, String: { htmlSafe } } = Ember;

export default Ember.Component.extend({
  classNames: ['recipe-entry'],

  imageStyle: computed(function() {
    let bgImage = this.get('recipe.imageUrl');

    return htmlSafe(`background-image: url(${bgImage})`);
  })
});
