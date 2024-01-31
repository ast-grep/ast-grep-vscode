class AstGrepTest {
  test() {
    console.log('Hello, world!')
  }
}

class AnotherCase {
  get test2() {
    return 123
  }
}

const NoProblemHere = {
  test() {
    if (Math.random() > 3) {
      throw new Error('This is not an error')
    }
  }
}
