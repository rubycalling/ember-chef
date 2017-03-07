import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('recipe-entry', 'Integration | Component | Recipe Entry', {
  integration: true
});

test('The component renderes all elements correctly', function(assert) {
  let recipe = {
    photo: 'http://url-to-photo.com/recipe.jpg',
    title: 'My first recipe',
    author: 'Brigitte Lebovic',
    date: moment().format('dd mm, YYY'),
    rating: '4'
  };
  this.set('recipe', recipe);
  this.render(hbs`{{recipe-entry recipe=recipe}}`);

  assert.equal(this.$('.photo').attr('src'), recipe.photo,
    'The recipe photo URL is renderd');
  assert.equal(this.$('.title').text().trim(), recipe.title,
    'The recipe title is renderd');
  assert.equal(this.$('.chef').text().trim(), recipe.author,
    'The recipe author is renderd');
  assert.equal(this.$('.date').text().trim(), recipe.date,
    'The recipe date renderd');
  assert.equal(this.$('.rating').text().trim(), recipe.rating,
    'The recipe rating is renderd');
});
