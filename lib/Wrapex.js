const express = require('express');
const WrapexRouter = require('./WrapexRouter');

/**
 * middlewaresExample = [
 *   helmet,
 *   bodyParse(urleEncoded()),
 *   bodyParser.json()
 * ],
 * routePrefixExample = '/api',
 * routesExample = {
 *   '/session': (router) => router.post('/', (req, res, next) => {}).delete('/', (req, res, next) => {}),
 *   '/users': (router) => router.put('/', (req, res, next) => {}).get('/', (req, res, next) => {})
 * },
 * optionsMapExample = [new OptionMap('authorize', (req,res,next) => {}, true)],
 * onErrorExample = ({req, res, next, error}) => {},
 */

function Wrapex({middlewares = [], routes, routePrefix = '', optionsMap = [], onError}) {
  const self = this;
  self.app = express();
  self.routes = routes;
  self.routePrefix = routePrefix;
  self.middlewares = middlewares;
  self.optionsMap = optionsMap;
  self.onError = onError;
  this.useMiddlewares();
  this.useEndpoints();
};

Wrapex.prototype.useEndpoints = function() {
  const {routes, app, onError, routePrefix, optionsMap} = this;
  Object
    .keys(routes)
    .forEach(function(route) {
      const expressRouter = express.Router();
      const wrapper = new WrapexRouter({expressRouter, optionsMap, onError});
      routes[route](wrapper);
      app.use(`${routePrefix}${route}`, wrapper.router);
    });
};

Wrapex.prototype.useMiddlewares = function() {
  const {app} = this;
  this.middlewares
    .forEach(function(middleware) {
      app.use(middleware);
    })
};

module.exports = function({middlewares = [], routes, routePrefix, optionsMap = [], onError}) {
  const expressWrapper = new Wrapex({middlewares, routePrefix, routes, optionsMap, onError});
  return expressWrapper.app;
};