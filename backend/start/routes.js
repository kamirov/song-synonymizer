'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route')

Route.resource('words', 'WordsController').apiOnly();
Route.post('/words/parse-and-add-new', 'WordsController.parseAndAddNew')

Route.resource('synonymizations', 'SynonymizationsController').apiOnly();

Route.get('/synonymize', 'SynonymsController.synonymize')
