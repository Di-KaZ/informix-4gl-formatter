// Yeah.. we will see if I do coverage on this project later 🤣

import app from './app'

describe('general functionality', () => {
  it('returns a module with "app"', () => {
    expect(app()).toBeCalled()
  })
})
