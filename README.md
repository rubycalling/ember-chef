# The Art of Mastering Ember - 5 key strength


## Introduction

- What is the problem
- How to reach this level of mastery
- Who am I
- Thanks Show My Homework

In this presentation, we will explore the 5 key areas that provide a strong basis for the progression of every Intermediate Ember Developer:

1. Structure your project
2. The importance of integration tests
3. Mock your ideal payload
4. Focus on the user Experience
5. Expect the un-expected

Show the tomster map! with a plane going from area to area

---

##  1. Structure your project

### Use routes to avoid having broken url

> We are creating a healthy recipes platform named the TheEmberChef.
Where you can click on a recipe to view the ingredient in a popup.

We want to display the modal on top of our page
[include a screenshot]


### Wrong way

```
app
├──authenticated
│   ├── route.js
│   ├── template.hbs
│   │
│   └── recipes
│     ├── controller.js
│     ├── route.js
│     └── template.hbs
│
├── components
│    └── ingredients-modal
│      ├── component.js
│      └── template.hbs

```

Rendering the ingredients modal in the middle of our HTML markup

```js
app/authenticated/recipes/template.hbs

<ul class="recipes-list">
  {{#each model as |recipe|}}
    <li {{action 'viewIngredients' recipe}}>{{recipe}}</li>
  {{/each}}
</ul>

{{#if showIngredients}}
  <div class="ingredients-popup">
    {{ingredients-modal ingredients=ingredients showIngredients=showIngredients}}
  </div>
{{/if}}
```

```js
app/authenticated/recipes/controller.js

ingredients: computed('model', 'selectedRecipe', function(){
  return this.get('selectedRecipe.ingredients');
}),

actions: {
  viewIngredients(recipe) {
    this.set('selectedRecipe', recipe);
    this.toggleProperty('showIngredients');
  }
}
```

```js
app/components/ingredients-modal/component.js

actions: {
  close() {
    this.toggleProperty('showIngredients');
  }
}
```

### Good way

Create a nested route `ingredients` under recipes.

```
app
├──authenticated
│   ├── route.js
│   ├── template.hbs
│   │
│   └── recipes
│     ├── controller.js
│     ├── route.js
│     ├── template.hbs
│     │
│     └── ingredients
│       ├── controller.js
│       ├── route.js
│       └── template.hbs
│
├── components
│    └── ingredients-modal
│      ├── component.js
│      └── template.hbs

```

```js
app/authenticated/recipes/template.hbs

<ul class="recipes-list">
  {{#each model as |recipe|}}
    <li><a href="{{href-to 'authenticated.recipes.ingredients'}}">{{recipe}}</a></li>
  {{/each}}
</ul>

{{outlet}}
```

```js
app/authenticated/recipes/ingredients/template.hbs

<div class="ingredients-popup">
  {{ingredients-modal ingredients=ingredients}}
</div>

```
Advantages:
- We now have a specific URL to target the ingredients popup [emberchef.com/recipes/15/ingredients](emberchef.com/recipes/15/ingredients)
- We have a dedicated route to load our recipe
- It is more scalable as the template can easily grow

However our modal is on top of our application so we should render it at the beginning or at the very end of our application


### Master way
[include inspect element screenshot]

```
app
├──authenticated
│   ├── route.js
│   ├── template.hbs
│   │
│   └── recipes
│     ├── controller.js
│     ├── route.js
│     ├── template.hbs
│     │
│     └── ingredients
│       ├── controller.js
│       ├── route.js
│       └── template.hbs
│
├── components
│    └── ingredients-modal
│      ├── component.js
│      └── template.hbs
│
├── templates
│    └── application.hbs

```


```js
app/authenticated/recipes/ingredients/route.js

renderTemplate() {
  this.render({
    into: 'application',
    outlet: 'modal'
  });
}
```

```js
app/application.hbs

{{outlet}}
{{liquid-outlet 'modal'}}
```

Advantages:
- HTML is rendered semantically correct: the absolute div is rendered at this end of the files
- we choose where to render our popup with the `renderTemplate` hook
- we use Liquidfire for nice animation

---

##  2. The importance of integration tests

> we have 2 templates which share the same recipe-entry components.
The usage is a bit different as on the Homepage we display only the title, author, date and rating
and on the desert page we want to display more information like description, prep time, cooking time and serving
> reminder: acceptance test are checking a flow A-B-C VS isolation

```js
// app/authenticated/recipes/index/template.hbs

<div class="recipes-list">
  {{#each model as |recipe|}}
    {{recipe-entry recipe=recipe}}
  {{/each}}
</div>
```

```js
// app/authenticated/recipes/deserts/template.hbs

<div class="recipes-list">
  {{#each model as |recipe|}}
    {{recipe-entry recipe=recipe}}
  {{/each}}
</div>
```

```js
// app/authenticated/components/recipe-entry/template.hbs

<img src="{{recipe.photo}}" class="photo">
<h1>{{recipe.title}}</h1>
<p class="chef">{{recipe.author}}</p>
<p class="date">{{recipe.date}}</p>
<div class="rating">{{recipe.rating}}</div>
```


### Wrong way
```js
// tests/acceptance/recipes/index-test.js

test('visiting /recipes', assert => {
  let entries = server.createList('recipe-entry', 5);
  let firstEntry = find('.recipes-list .recipe-entry:eq(0)');
  visit('/recipes');

  andThen(() => {
    assert.equal(currentURL(), '/recipes');
    assert.equal(find('.recipes-list .recipe-entry').length,
      5, '5 recipes rendered');
    assert.equal(firstEntry.find('.recipe-title').text().trim(),
      entries[0].title, 'Correct title rendered');
    assert.equal(firstEntry.find('.description').text().trim(),
      entries[0].description, 'Correct title rendered');
    assert.equal(firstEntry.find('.rating .full-star').length,
      5, 'correct rating stars rendered');
    ...
  });
});
```

```js
// tests/acceptance/recipes/dessert-test.js

test('visiting /recipes', assert => {
  let entries = server.createList('recipe-entry', 5);
  let firstEntry = find('.recipes-list .recipe-entry:eq(0)');
  visit('/recipes');

  andThen(() => {
    assert.equal(currentURL(), '/recipes');
    assert.equal(find('.recipes-list .recipe-entry').length,
      5, '5 recipes rendered');
    assert.equal(firstEntry.find('.recipe-title').text().trim(),
      entries[0].title, 'Correct title rendered');
    assert.equal(firstEntry.find('.description').text().trim(),
      entries[0].description, 'Correct title rendered');
    assert.equal(firstEntry.find('.rating .full-star').length,
      5, 'correct rating stars rendered');
    ...
  });
});
```

Disadvantages:
- Acceptance test are much more expensive because they need to run the app, create a user
- We will have 2 acceptance test that test the same behaviour


### Good way
```js
// tests/acceptance/recipes/index-test.js

test('visiting /recipes', assert => {
  let entries = server.createList('recipe-entry', 5);
  let firstEntry = find('.recipes-list .recipe-entry:eq(0)');
  visit('/recipes');

  andThen(() => {
    assert.equal(currentURL(), '/recipes');
    assert.equal(find('.recipes-list .recipe-entry').length,
      5, '5 recipes rendered');
    ...
  });
});
```

```js
// tests/acceptance/recipes/dessert-test.js

test('visiting /recipes', assert => {
  let entries = server.createList('recipe-entry', 5);
  let firstEntry = find('.recipes-list .recipe-entry:eq(0)');
  visit('/recipes');

  andThen(() => {
    assert.equal(currentURL(), '/recipes');
    assert.equal(find('.recipes-list .recipe-entry').length,
      5, '5 recipes rendered');
    ...
  });
});
```

```js
// tests/integration/components/recipe-entry/component-test.js
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
```


Advantages:
- TDD check that your component do the thing you want to do


### Master way
- Integration > internal state (NOT changing route)
- Acceptance > testing a story (changing route)
<img width="716" alt="screen shot 2017-03-07 at 22 04 14" src="https://cloud.githubusercontent.com/assets/7160913/23680254/72205e64-0382-11e7-901a-96312cf89e9c.png">

----

## 3. Mock your ideal payload

### Wrong way
We settle with something that is not perfect because the feedback loop is annoying
if your team is distributed in different time zone it can lead to "it s ok"

> Pagination needs calculation in the UI because metadata are not self-explanatory
<< < 3 (4) 5 > >>


```
{
  recipes: [
    {
      id: 21,
      title: 'Chocolate Cake With Green Tea Cream',
      ...
      author: 'Sam De Maeyer'
    },
    {
      id: 22,
      title: 'Crema Catalagna',
      ...
      author: 'Miguel Camba'
    },
    {
      id: 23,
      title: 'New York Vanilla Cheesecake',
      ...
      author: 'Jamie White'
    }
  ],
  metadata: {
    total-count: 126,
    limit: 10,
    offset: 20
  }
}
```

> In order to calculate the pagination we need to divide the total number of pages by the number of recipes per pages

```
totalPages = roundUp(total-count/limit) # 13 pages
currentPage = roundUp(total_pages - (total-count - offset) / limit) # page 3
```

this could easily be handle by the BE and keep logic where it should belongs!

### Good way
- Reducing the feedback loop with the API
- Easier for the BE to adapt to the FE

```
{
  recipes: {
    id: 21,
    title: 'Chocolate Cake With Green Tea Cream',
    ...
    author: 'Sam De Maeyer'
  },
  {
    id: 22,
    title: 'Crema Catalagna',
    ...
    author: 'Miguel Camba'
  },
  {
    id: 23,
    title: 'New York Vanilla Cheesecake',
    ...
    author: 'Jamie White'
  },
  metadata: {
    total-pages: 25,
    page-number: 3
  }
}
```

### Master way
 - Use JSON API!

```
{
  meta: { total-pages: 25 },
  data: [
    {
      type: recipes,
      id: 26,
      attributes: {
        title: 'A very chocolatey mousse',
        ...
        author: 'Brigitte Lebovic'
      }
    },
    {
      type: recipes,
      id: 27,
      attributes: {
        title: 'Sweet Chilli and Lime Chicken Wings',
        ...
        author: 'yehuda katz'
      }
    }
  ],
  links: {
    'self': 'api.emberchef.com/recipes?page[number]=3&page[size]=10',
    'first': 'api.emberchef.com/recipes?page[number]=1&page[size]=10',
    'prev': 'api.emberchef.com/recipes?page[number]=2&page[size]=10',
    'next': 'api.emberchef.com/recipes?page[number]=4&page[size]=10',
    'last': 'api.emberchef.com/recipes?page[number]=25&page[size]=10'
  }
}
```

---
## 4. Focus on the user Experience
> Example:
> Delete a recipe and click back button the delete popup is still there but the data is destroyed

### Bad way
Do not care about the browser history

### Good way
Care about redirecting the user if the model does not exist

```
// app/authenticated/recipes/delete/route.js

redirect(model, redirect) {
  if (!model) {
    this.transitionTo('authenticated');
  }
},

model({ recipe_id }) {
  this.get('store').findRecord('recipe', recipe_id);
}
```


### Master way
Use replaceWith when closing popup.

```
// app/authenticated/recipes/delete/route.js

redirect(model, redirect) {
  if (!model) {
    this.replaceWith('authenticated');
  }
},

model({ recipe_id }) {
  this.get('store').findRecord('recipe', recipe_id);
},

actions: {
  deleteArticle(article) {
    article.destroyRecord()
      .then(() => this.replaceWith('authenticated.recipes'))
      .catch(e => console.warn(e));
  }
}
```

The only difference between them is how they manage history. replaceWith() substitutes the current route entry and replaces it with that of the route we are redirecting to, while transitionTo() leaves the entry for the current route and creates a new one for the redirection.

An other example: you don't want to go back to every search (?search=choco) you have made but instead be transition to the previous page

```
// app/authenticated/index/route.js

model({ search }) {
  return this.get('store').query('recipe', { search });
},

queryParams: {
  search: {
    refreshModel: true,
    replace: true
  }
}
```

-------

## 5. Expect the un-expected

> when you make a request you need to assume that thing can fail or take a while
> when using a distributed system you have local data and remote data

### Bad way
Not caring about error

### Good way
Having a generic error page

### Master way
Having a dedicated error or loading pages

Using hooks / sub-estate: (template, action)
  - error
  - loading


> Handle long running task properly

### Bad way
Let the task run

### Good way
Drop the task with Ember-concurrency to avoid repetitive call to the back-end
if user click twice it is dropped - if user click a button but nothing is happening

### Master way
`takIsRunning` tell the user what is happening by showing eg `saving...`

------

Now you enter LEVEL 2!

### Get involved in the community:
- Easier to communicate via Github, Slack, Ember meetups
- A lot of open source project are broken (if you find that something doesn't work you can help)

### Create an addon an share it!
- The worth things that will happen is that you are the only one using it

### Read documentation
- Keeping up with changes to the framework. Be informed!
- Read rfc and comment on them - community effort
- Give a voice so the framework can improve
