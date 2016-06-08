Benchmarks
==

Test the performance of JTS compared to your favorite templating engine. A few
defaults are provided and can be run by running `npm install` and `npm start`.

Observed
--

Testing raw compilation performance with strings...
```
doT x 50,442 ops/sec ±0.95% (96 runs sampled)
handlebars x 1,199 ops/sec ±11.74% (88 runs sampled)
ejs x 5,560 ops/sec ±1.65% (93 runs sampled)
jts x 100,841 ops/sec ±0.84% (97 runs sampled)
Fastest is jts (mean time: 0.010ms)
Slowest is handlebars (mean time: 0.811ms)
```

Testing performance with file I/O...
```
doT:file x 26,013 ops/sec ±0.89% (92 runs sampled)
ejs:file x 4,824 ops/sec ±0.93% (94 runs sampled)
jts:file(no-cache) x 30,907 ops/sec ±0.94% (96 runs sampled)
jts:file(cache) x 88,850 ops/sec ±0.82% (96 runs sampled)
jts:file(express-style) x 89,068 ops/sec ±0.97% (94 runs sampled)
Fastest is jts:file(express-style),jts:file(cache) (mean time: 0.011ms)
Slowest is ejs:file (mean time: 0.207ms)
```
