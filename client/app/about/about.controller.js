'use strict';

/**
 * @ngdoc function
 * @name edgeguardFrontendApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the edgeguardFrontendApp
 */

angular.module('apt.about').controller('AboutController', AboutController);
AboutController.$inject = [];
function AboutController () {
  var vm = this;
  vm.info = [
    'My Company',
    '123 Fake St.',
    'Lulztown',
    'thedude@fakecompany.com'
  ];
}
