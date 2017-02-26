import DS from 'ember-data';

export default DS.Model.extend({
  title:        DS.attr('string'),
  descitpion:   DS.attr('string'),
  prepTime:     DS.attr('string'),
  cookTime:     DS.attr('string'),
  serving:      DS.attr('string'),
  imageUrl:     DS.attr('string'),
  updatedAt:    DS.attr('date'),
  instructions: DS.attr(),
  ingredients:  DS.attr()
});
