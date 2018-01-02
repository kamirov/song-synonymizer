'use strict'

/*
|--------------------------------------------------------------------------
| Http backend
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP backend. You are free to
| customize the process of booting the http backend.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP backend.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer()
  .catch(console.error)
