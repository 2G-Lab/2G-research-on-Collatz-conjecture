# Exploring the Collatz conjecture

This repository stores code written during enthusiast research into
the [Collatz conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture).  
This code doesn't do anything useful, but it can easily overload your computer if run without caution.  

Please read the article about this study first.  
[Exploring the Collatz conjecture](http://2g-lab.de/projects/5000.Collatz-conjecture/2G-notes-on-Collatz-conjecture.html)  

IMPORTANT:  
Please review the code to get an idea of what it does and what information can be gleaned as a result of calculations.  

If you are going to save any information to files, keep in mind that the number of files and their sizes can be large.  

Uncomment (and change) the relevant parts of the code.  

Create a folder for saved files.  
```shell
mkdir stat
```

Run the code limiting CPU and memory usage.  
In this example CPU load is limited by 20%.  
1 CPU core is in use.  
Max memory size that can be allocated by `nodejs` is `4GB`  
```shell
cp Collatz_first_EVEN.js app.mjs && cpulimit -m -l 20 -- node --max-old-space-size=4094 app.mjs

cp Collatz_first_ODD.js app.mjs && cpulimit -m -l 20 -- node --max-old-space-size=4094 app.mjs

cp Collatz_zigzag_EVEN.js app.mjs && cpulimit -m -l 20 -- node --max-old-space-size=4094 app.mjs

cp Collatz_zigzag_ODD.js app.mjs && cpulimit -m -l 20 -- node --max-old-space-size=4094 app.mjs

cp Collatz_variants_first_EVEN.js app.mjs && cpulimit -m -l 20 -- node --max-old-space-size=4094 app.mjs
```

---

`seq.js` calculates Collatz sequence and its parity pattern for a particular number.  
This initial number is hardcoded (edit it).  
```shell
cp seq.js seq.mjs && node seq.mjs
```
