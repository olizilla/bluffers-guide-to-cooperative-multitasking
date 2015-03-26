# Rough notes

(please ignore me)

Meteor uses fibers... co-routines / cooperative multitasking.

multitasking - doing several things at once.
cooperative - we're gonna have to work together.


All implementations have a near identical performance...

each user gets his own function call.
readFileSync doesn't block the event loop, just stalls that function call.
other requests are still handled.

What about meteor?

```sh
meteor create meteor-things
meteor &
open http://localhost:3000
```

["{\"msg\":\"method\",\"method\":\"doThings\",\"params\":[1000000000],\"id\":\"3\"}"]

> On the client, if you do not pass a callback and you are not inside a stub, call will return undefined, and you will have no way to get the return value of the method. That is because the client doesn't have fibers, so there is not actually any way it can block on the remote execution of a method.
http://docs.meteor.com/#/full/meteor_call


functions run to the end and `return`
co-routines run to the next yield


- https://meteorhacks.com/fibers-eventloop-and-meteor.html
wtf.

> "Now you have a better knowledge of the Event Loop, Fibers, and how Meteor uses Fibers"
Nope.

"Cooperative multitasking"

multitasking === time sharing

Mac OS 9 used "Cooperative multitasking"

where applications "voluntarily ceded time to one another"

## preemtive multitasking

The Amiga - "more advanced"


## mutithreading

Threads were born from the idea that the most efficient way for cooperating processes to exchange data would be to share their entire memory space. Thus, threads are effectively processes that run in the same memory context and share other resources with their parent processes, such as open files. Threads are described as lightweight processes because switching between threads does not involve changing the memory context.[4][5][6]

While threads are scheduled preemptively, some operating systems provide a variant to threads, named fibers, that are scheduled cooperatively. On operating systems that do not provide fibers, an application may implement its own fibers using repeated calls to worker functions. Fibers are even more lightweight than threads, and somewhat easier to program with, although they tend to lose some or all of the benefits of threads on machines with multiple processors.


Time sharing the event loop...
