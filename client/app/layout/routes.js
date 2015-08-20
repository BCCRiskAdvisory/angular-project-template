"use strict"

RouteConfig.$inject = ['$routeProvider']
angular.module('apt.layout').config(RouteConfig)

function RouteConfig($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'layout/main.html',
      controller: 'MainController',
      controllerAs: 'main'
    })
    .when('/about', {
      templateUrl: 'about/about.html',
      controller: 'AboutController',
      controllerAs: 'about'
    })
    .when('/contact', {
      templateUrl: 'contact/contact.html',
      controller: 'ContactController',
      controllerAs: 'contact'
    })
    .otherwise({
      redirectTo: '/'
    });
}