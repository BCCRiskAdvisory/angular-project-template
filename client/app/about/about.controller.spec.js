'use strict';

describe('AboutController', function () {

  // load the controller's module
  beforeEach(module('apt.about'));

  var AboutCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AboutCtrl = $controller('AboutController as about', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.about.info.length).toBe(4);
  });
});