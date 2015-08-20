describe 'Coffeescript Compilation', ->

  beforeEach(module('angularTemplate'));
  

  it('compiles coffeescript tests and loads compiled coffeescript', inject((_coffeescript_)->
    expect(_coffeescript_).toBe('awesome')
  ))