"use strict"

angular.module('apt.contact').controller('ContactController', ContactController)

ContactController.$inject = []
function ContactController() {  
  var vm = this;
  vm.email = 'thing@thing.com'
}