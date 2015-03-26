
# The Bluffers guide to Cooperative multitasking
## How Meteor works for more than 1 person (sync, async, fibers, callbacks, event-loops...)

some (js-centric) definitions

# multitasking
- Doing several things at once.
> Multitasking is a method to allow multiple processes to share processors (CPUs) and other system resources.
> Each CPU executes a single task at a time.

- time-sharing
> Multitasking allows each processor to switch between processes that are being executed without having to wait for each task to finish.

# Process
- A program, being executed
> A computer program is a passive collection of instructions; a process is the actual execution of those instructions.

`node`,
`mongo`,
`meteor`
(Meteor starts at least 2 processes, 1 server, 1 db.)


```sh
node &
ps | grep node | wc -l
# 7
```

Inside a js file running in `node` we can inspect the process that contains us.

```js
process.title
// 'node'

// see also
process.arch
process.versions
```

- managed by the operating system.
- isolated

but if we can look at the process information, then what are we?

- may contain threads...

# Thread
> Processes are typically independent, while threads exist as subsets of a process
> multiple threads within a process share process state as well as memory and other resources
http://en.wikipedia.org/wiki/Thread_(computing)

> Smallest sequence of programmed instructions that can be managed independently...

```js
console.log('hello world!')
console.log('I am the main thread')
console.log('ok, I\'m done now')
```

The folklore goes:
_"JS has a single thread of execution"_






Or more accurately:
> a single thread of execution visible to scripts(*)
http://stackoverflow.com/a/2734311

executes our functions, synchronusly


# subroutine
a function or method

# Fiber
managed by the process


# syncronous

# asynchronous



**"Don't block the even loop"**

What's an event loop and why should I care?

People who block the event loop get unresponsive, janky UIs...
People who don't have silky animations, snappy apps and happy users.

Which do you want to be?

Ok. Some background.

**Javascript is simple^**

^(truthyness, type-coercian and numbers non-withstanding)

like me, it can only concentrate on one thing at a time.

_A single thread of execution_

when you call a function, the lines of code in that function are executed.

if you're asked to do one, small thing, and it's a good day, and you're not hungry, you'll probably get it done pretty quick.
if you're asked to one billion things (1,000,000,000) you'll probably take a while. If you're super disciplined about it, and don't take any breaks, it'll still take so long that your friends and family will start to get worried. You'll be become, unresponsive...

Well, in this small way, code is the same.

```js
function doThings (many) {
  var then = Date.now()
  for (i=0; i<=many; i++) { /* do nothing */}
  var duration = Date.now() - then
  return 'Did ' + many + ' nothings in ' + duration + 'ms'
}

> doThings(10000)
'Did 10000 things in 0ms'

> doThings(100000)
'Did 100000 things in 1ms'

> doThings(1000000)
'Did 1000000 things in 2ms'

> doThings(10000000)
'Did 10000000 things in 26ms'

> doThings(100000000)
'Did 100000000 things in 272ms'

> doThings(1000000000)
'Did 1000000000 things in 2674ms'

> doThings(10000000000)
'Did 10000000000 things in 36404ms'
```

so, as the procrastinators know all too well, even doing nothing can take ages, if you do enough of it.

What happens if we need to do 2 things at once?

_A single thread of execution_ (throwback)

Well, what if we wanted say, a server to handle 2 different users... AT THE SAME TIME! *gasps*

Servers have to handle the demands of multiple users...

Let's wrap our `doThings` function up as a super simple server.

```js
var http = require('http')

// I am a server
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  // I do some things that may take a while...
  var results = doThings(1e9)
  response.end(results + '\n')
}).listen(1337)

// Things take a while to do...
function doThings (many) {
  var then = Date.now()
  for (i=0; i<=many; i++) { /* do nothing */ }
  var duration = Date.now() - then
  return 'Did ' + many + ' things in ' + duration + 'ms'
}
```

This is node, or _a_ node, or iojs, or server-side javascript, if you're not into the whole brevity thing.

To test it out let's fire it up and use the ancient magic that is `curl` to make an h t t p request...

```sh
node doThingsServer.js

curl http://0.0.0.0:1337/
Did 1000000000 things in 2548ms
```

The server says it did it's things in about 2.5 seconds, but let's fire up an independent adjudicator

```sh
time curl http://0.0.0.0:1337/
Did 1000000000 things in 2557ms

real	0m2.565s
user	0m0.004s
sys	0m0.004s
```

The `time` command is like a stopwatch for your cli; it prints out how long it took the command to run.

(aside: Our adjudicator suggests that it took `0m2.565s`, slightly longer than the `2557ms` that the sever tells us it spent doing things...What's the discrepancy?)

So we've got a server that's painfully slow with 1 concurrent user (note, 1 is not concurrent.)

What were we trying to do...

> "What happens if we need to do 2 things at once?"
_A single thread of execution_ (throwback)

huh. What if 2 users access the server at the same time!

To experiment with this we could manually fire up some browsers like animals or do a webdrivers or distribute some malware...

or, we could turn again to the wisdom of the ancients contained in the command line.

`ab` (apachebench) is a simple load testing tool for inciting a robot army to make multiple requests to a server...

ROBOT ARMY, PERFORM 1 REQUEST TO OUR ENFEEBLED SERVER:

```
ab -n 1 http://127.0.0.1:1337/ | grep "Time " | say
Time taken for tests:   2.541 seconds
Time per request:       2541.169 [ms] (mean)
Time per request:       2541.169 [ms] (mean, across all concurrent requests)
```

Which is what we'd expect... now let's try 2 requests, one after another (still 1 concurrent user. still not concurrent)

```
ab -n 2 -c 1 http://127.0.0.1:1337/ | grep "Time "
Time taken for tests:   5.050 seconds
Time per request:       5050.034 [ms] (mean)
Time per request:       2525.017 [ms] (mean, across all concurrent requests)
```

2 requests, waiting for the first one to return before starting the next one, takes, unsurprisingly, double the time.

now let's try... 2 requests AT THE SAME TIME!

(2 concurrent users!)

(drum roll please)

(aside)
For any given server, we've started, as a society to expect that it'll magically serve 2 users at the same time.
As booking tickets for Glastonbury festival shows, we become agitated when our expectations are violated.
It's worth noting that no server ever agreed to this situation, and we rarely hold ourselves to the standard.

(2 concurrent users!)

(drum roll please)

```
ab -n 2 -c 2 http://127.0.0.1:1337/ | grep "Time taken" | tee /dev/tty | say
Time taken for tests:   5.380 seconds
```

1 request takes about 2.5 seconds
2 requests takes ~ 5 seconds.

...our expectations are violated... our server is handling 1 request a time.

Why?

## It's a CPU bound task!

> CPU-bound is when the time for it to complete a task is determined principally by the speed of the central processor
http://en.wikipedia.org/wiki/CPU-bound

we're blocking the event loop.

If you're app is doing a lot of heavy maths

Earth simulator
http://en.wikipedia.org/wiki/Earth_Simulator#/media/File:Earth_simulator_ES2.jpg

you're gonna need to divide your workload up...
See `fork` or `cluster`

Let's compare it with another slow server...

```js
var http = require('http')

// I am a server
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  // I do nothing, after a while...
  setTimeout(function(){
    var result = 'Did nothing, after ' + pause
    response.end(result + '\n')  
  }, 2500)

}).listen(1336)
```

```
ab -n 1 -c 1 http://127.0.0.1:1336/ | grep "Time "
Time taken for tests:   2.510 seconds
Time per request:       2509.642 [ms] (mean)
Time per request:       2509.642 [ms] (mean, across all concurrent requests)

ab -n 2 -c 2 http://127.0.0.1:1336/ | grep "Time "
Time taken for tests:   2.505 seconds
Time per request:       2505.304 [ms] (mean)
Time per request:       1252.652 [ms] (mean, across all concurrent requests)

ab -n 10 -c 10 http://127.0.0.1:1336/ | grep "Time "
Time taken for tests:   2.504 seconds
Time per request:       2503.884 [ms] (mean)
Time per request:       250.388 [ms] (mean, across all concurrent requests)

ab -n 100 -c 100 http://127.0.0.1:1336/ | grep "Time "
Time taken for tests:   2.522 seconds
Time per request:       2522.296 [ms] (mean)
Time per request:       25.223 [ms] (mean, across all concurrent requests)
```

Each request takes around 2.5 seconds...

NO MATTER HOW MANY WE DO!^

Ladies and gentlemen we are MULTITASKING!

But what's changed?

_A single thread of execution_

We have only a single thread in _our_ code.

"everything else happens in parallel" (mixu)

JavaScript / node / Meteor provide async apis

Our code is doing 1 nothing rather than 1 billion

and

setTimeout happens asyncronously / non-blocking

our callback is cryogenically frozen in nodes internal deep freeze (c bindings land)

after 2500ms of hyper sleep, it's woken, by an unseen hand.

and placed in the callback queue.

as soon as our code take a break / runs out of things to do

the event loop spins round another tick

the callback is found, and it's invoked.

demo loupe
http://latentflip.com/loupe/?code=JC5vbignYnV0dG9uJywgJ2NsaWNrJywgZnVuY3Rpb24gb25DbGljaygpIHsKICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZXIoKSB7CiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBjbGlja2VkIHRoZSBidXR0b24hJyk7ICAgIAogICAgfSwgMjUwMCk7Cn0pOwoKY29uc29sZS5sb2coIkhpISIpOwo%3D!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D


## Ok but I just wanna check a database and render some html.

Oh right, you should have said, ok, well if that's all your app is gonna do then you're in luck.

# IO bound tasks work much better.

... see async codes...


---

# refs:
http://neilk.net/blog/2013/04/30/why-you-should-use-nodejs-for-CPU-bound-tasks/
https://bjouhier.wordpress.com/2012/03/11/fibers-and-threads-in-node-js-what-for/
https://github.com/alanning/meteor-load-test
http://blog.mixu.net/2011/02/01/understanding-the-node-js-event-loop/


## Notes
