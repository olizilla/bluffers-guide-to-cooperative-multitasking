/*
Our code runs in the main thread, step, by step.
*/
function intro () {
  console.log('hello world!')
  console.log('I am the main thread')
  console.log('ok, I\'m done now')
}

console.log('step 1')
intro()
console.lgo('end')
