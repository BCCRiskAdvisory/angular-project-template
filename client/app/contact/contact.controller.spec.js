'use strict';

describe('ContactController', function () {

  // load the controller's module
  beforeEach(module('apt.contact'));

  var AboutCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    $controller('ContactController as contact', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.contact.email).toBe('thing@thing.com');
  });
});