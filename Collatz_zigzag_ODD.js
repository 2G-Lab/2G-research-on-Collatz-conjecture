const ROOT_PARENT_ID = -1;
const MAX_DISTANCE =   50000; //  50 000
const MAX_STORAGE  =  100000; // 100 000

const SIMPLE = 'SIMPLE', NODE = 'NODE';         // Element type
const ANY = 'ANY', ODD = 'ODD', EVEN = 'EVEN';  // Element or Branch parity
const OPEN = 'OPEN', CLOSED = 'CLOSED';         // Element or Branch status

const treeElements = [];

// Counters
let maxDistance = 0;
let maxNodeDistance = 0;
let nodeCounter = 1n;
let fullClosedNodes = 0n;
let halfClosedNodes = 0n;
let nextIndex = 0;
let mainLoopCounter = 0n;
let loopFound = false;
let sumOfLastNodeDistances = 0n;
let numberOfLastBranches = 1n;

const startTime = Date.now();

// ---------------------------------------------------------------------- Temporary block - Saving data to files

import { appendFileSync } from 'fs';

function dumpSequenceToFile (fileName) {
  for (let i = 0; i < treeElements.length; i++) {
    const elementData = {
      type       : treeElements[i].type,
      branch     : treeElements[i].branch,
      parity     : treeElements[i].parity,
      ID         : treeElements[i].current_ID,
      ID_parent  : treeElements[i].parent_ID,
      ID_child_E : treeElements[i].child_E_ID,
      ID_child_O : treeElements[i].child_O_ID
    };
    const N_0 = {factor : treeElements[i].N_0.factor, term : treeElements[i].N_0.term};
    const N_i = {factor : treeElements[i].N_i.factor, term : treeElements[i].N_i.term};
    const fullDistance = treeElements[i].distance
    const nodeDistance = treeElements[i].node.distance;

    appendFileSync(fileName, `${JSON.stringify(elementData)}\n`, 'utf8');
    appendFileSync(fileName, `Sequence length : ${fullDistance}\n`, 'utf8');
    appendFileSync(fileName, `Number of NODES : ${nodeDistance}\n`, 'utf8');
    appendFileSync(fileName, `N_0 = B * ${N_0.factor}n + ${N_0.term}n;\n`, 'utf8');
    appendFileSync(fileName, `N_i = B * ${N_i.factor}n + ${N_i.term}n;\n`, 'utf8');
    appendFileSync(fileName, `\n`, 'utf8');
  }
}

function dumpSingleElementToFile (fileName) {
  const i = treeElements.length - 1;
  const N_0 = {factor : treeElements[i].N_0.factor, term : treeElements[i].N_0.term};
  const N_i = {factor : treeElements[i].N_i.factor, term : treeElements[i].N_i.term};
  const fullDistance = treeElements[i].distance
  const nodeDistance = treeElements[i].node.distance;

  appendFileSync(fileName, `Sequence length : ${fullDistance}\n`, 'utf8');
  appendFileSync(fileName, `Number of NODES : ${nodeDistance}\n`, 'utf8');
  appendFileSync(fileName, `N_0 = B * ${N_0.factor}n + ${N_0.term}n;\n`, 'utf8');
  appendFileSync(fileName, `N_i = B * ${N_i.factor}n + ${N_i.term}n;\n`, 'utf8');
  appendFileSync(fileName, `\n`, 'utf8');
}
// ---------------------------------------------------------------------- Temporary block - Saving data to files

function showStatistics () {
  console.log('--------------------------------------------');
  console.log('     Array length (now) : ', treeElements.length);
  console.log('                        --------------------');
  console.log('    Max SIMPLE distance : ', maxDistance);
  console.log('    Max   NODE distance : ', maxNodeDistance);
  console.log('                        --------------------');
  console.log('#            Open NODES : ', nodeCounter - fullClosedNodes - halfClosedNodes);
  console.log('#     Half closed NODES : ', halfClosedNodes);
  console.log('#    Fully closed NODES : ', fullClosedNodes);
  console.log('                        --------------------');
  console.log('              All NODES : ', nodeCounter);
  console.log('          Last Branches : ', numberOfLastBranches);
  console.log('                        --------------------');
  console.log(' Avg last NODE Distance : ', sumOfLastNodeDistances / numberOfLastBranches);
  console.log('                        --------------------');
  console.log('               Time (s) : ', Math.ceil((Date.now() - startTime) / 1000));
}

function createChild (branchParity, parent_ID) {
  // Initially the new element is populated with default values.
  // The same values as for the ROOT element.
  const sequenceElement = {
    type     : NODE,
    parity   : ANY,
    branch   : branchParity,
    distance : 0,
    last     : false,
    status   : OPEN,
    child_E  : OPEN,
    child_O  : OPEN,

    parent_ID  : parent_ID,
    current_ID : treeElements.length,
    child_E_ID : null,
    child_O_ID : null,
    N_0 : {factor : 1n, term : 0n},
    N_i : {factor : 1n, term : 0n},

    node : {ID : -1, distance : 0}
  }
  treeElements.push(sequenceElement);
  if (parent_ID === ROOT_PARENT_ID) return; // The ROOT Element is created

  const parentElement = treeElements[parent_ID];

  // Establish relations with Parents
  if (sequenceElement.branch === EVEN) {
    sequenceElement.child_O = CLOSED;
    parentElement.child_E_ID = sequenceElement.current_ID;
  }
  if (sequenceElement.branch ===  ODD) {
    sequenceElement.child_E = CLOSED;
    parentElement.child_O_ID = sequenceElement.current_ID;
  }

   // Change BASE
  if (parentElement.type === NODE) {
    // console.log('-------------------------------', 'NODE : ', sequenceElement.parent_ID, 'ID : ', sequenceElement.current_ID);
    // console.log('Change BASE');

    sequenceElement.distance   = parentElement.distance;

    sequenceElement.N_0.factor = parentElement.N_0.factor * 2n;
    sequenceElement.N_i.factor = parentElement.N_i.factor * 2n;
    if (sequenceElement.branch === EVEN) {
      sequenceElement.N_0.term = parentElement.N_0.term;
      sequenceElement.N_i.term = parentElement.N_i.term;
    }
    if (sequenceElement.branch === ODD) {
      sequenceElement.N_0.term = parentElement.N_0.factor + parentElement.N_0.term;
      sequenceElement.N_i.term = parentElement.N_i.factor + parentElement.N_i.term;
    }
    // TEMP (what NODE is a nearest ancestor of this sequenceElement)
    sequenceElement.node.ID       = sequenceElement.parent_ID;
    sequenceElement.node.distance = parentElement.node.distance + 1;
  }

  // Do operations
  if (parentElement.type === SIMPLE) {
    sequenceElement.distance   = parentElement.distance + 1;

    sequenceElement.N_0.factor = parentElement.N_0.factor;
    sequenceElement.N_0.term   = parentElement.N_0.term;

    if (parentElement.parity === EVEN) {
      sequenceElement.N_i.factor = parentElement.N_i.factor / 2n;
      sequenceElement.N_i.term   = parentElement.N_i.term / 2n;
    }
    if (parentElement.parity === ODD) {
      sequenceElement.N_i.factor = parentElement.N_i.factor * 3n;
      sequenceElement.N_i.term   = parentElement.N_i.term * 3n + 1n;
      // ---------------------------------------------------- v1.1
      sequenceElement.N_i.factor = sequenceElement.N_i.factor / 2n;
      sequenceElement.N_i.term   = sequenceElement.N_i.term / 2n;
      // ---------------------------------------------------- v1.1
    }
    
    // Comparison of number sets
    if (sequenceElement.N_i.term === sequenceElement.N_0.term) { // LOOP !!!
      console.log('-------------------------------');
      console.log('LOOP found');
      console.log('Condition : BASE = 0');
      if (sequenceElement.N_i.factor === sequenceElement.N_0.factor) {
        console.log('Condition : BASE = 0, 1, 2, ...');
      }
      if (sequenceElement.N_i.factor % sequenceElement.N_0.factor === 0n) {
        console.log('Infinite grow detected');
      }
      console.log('N_0 : ', sequenceElement.N_0.factor, sequenceElement.N_0.term);
      console.log('N_i : ', sequenceElement.N_i.factor, sequenceElement.N_i.term);
      console.log('distance : ', sequenceElement.distance);
      loopFound = sequenceElement.N_i.term === 0n || sequenceElement.N_i.term === 1n ? false : true;
      sequenceElement.last = true;

      // ---------------------------------------------------------------------- Temporary block (comment)
      const fileName = `stat/loop_REAL_${sequenceElement.distance}.txt`;
      dumpSingleElementToFile (fileName);
      // ---------------------------------------------------------------------- Temporary block (comment)
    }

    const loopTestL = sequenceElement.N_i.factor < sequenceElement.N_0.factor && sequenceElement.N_i.term > sequenceElement.N_0.term;
    const loopTestR = sequenceElement.N_i.factor > sequenceElement.N_0.factor && sequenceElement.N_i.term < sequenceElement.N_0.term;
    if (loopTestL || loopTestR) { // Potential LOOP
      console.log('Potential loop detected');
      const numerator = sequenceElement.N_i.term - sequenceElement.N_0.term;
      const denominator = sequenceElement.N_0.factor - sequenceElement.N_i.factor;
      const beta = numerator / denominator;
      loopFound = numerator % denominator === 0n ? true : false;
      sequenceElement.last = true;

      // ---------------------------------------------------------------------- Temporary block (comment)
      const fileName = `stat/loop_PROB_${sequenceElement.distance}.txt`;
      dumpSingleElementToFile (fileName);
      // ---------------------------------------------------------------------- Temporary block (comment)
     }

    if (sequenceElement.N_i.factor < sequenceElement.N_0.factor && sequenceElement.N_i.term < sequenceElement.N_0.term) { // The LAST element detected
      sequenceElement.last = true;
    }
    // TEMP (what NODE is a nearest ancestor of this sequenceElement)
    sequenceElement.node.ID       = parentElement.node.ID;
    sequenceElement.node.distance = parentElement.node.distance;
  }

  // Check parity
  if (sequenceElement.N_i.factor % 2n === 0n) { // The parity can be determined
    sequenceElement.type    = SIMPLE;
    sequenceElement.parity  = sequenceElement.N_i.term % 2n === 0n ? EVEN : ODD;
  }
  if (sequenceElement.N_i.factor % 2n === 1n) { // The parity can NOT be determined
    sequenceElement.type    = NODE;
    sequenceElement.parity  = ANY;
    sequenceElement.child_E = OPEN;
    sequenceElement.child_O = OPEN;
  }

  if (sequenceElement.last) {
    sequenceElement.type    = SIMPLE; // Every last sequenceElement is SIMPLE independently on determinability of the parity
    sequenceElement.status  = CLOSED;
    sequenceElement.child_E = CLOSED;
    sequenceElement.child_O = CLOSED;
    
    // Collect data to estimate a tree size
    sumOfLastNodeDistances += BigInt(sequenceElement.node.distance);
    numberOfLastBranches   += 1n;

    // ---------------------------------------------------------------------- Temporary block (comment)
    // Save the sequence example
    /*    
    if (sequenceElement.distance === 99243) {
      const fileName = `stat/seq_first_EVEN_${sequenceElement.distance}.txt`;
      dumpSequenceToFile (fileName);
    }

    if (maxDistance < sequenceElement.distance) {
      const fileName = `stat/seq_first_EVEN_${sequenceElement.distance}.txt`;
      dumpSequenceToFile (fileName);
    }
    */
    // ---------------------------------------------------------------------- Temporary block (comment)
  }

  if (sequenceElement.type === NODE) nodeCounter += 1n;
  if (maxDistance < sequenceElement.distance) maxDistance = sequenceElement.distance;
  if (maxNodeDistance < sequenceElement.node.distance) maxNodeDistance = sequenceElement.node.distance;
}

function closeParent (branchParity, parent_ID) {
  const parentElement = treeElements[parent_ID];
  if (parentElement.type === NODE) halfClosedNodes += 1n;

  if (branchParity === EVEN) parentElement.child_E = CLOSED;
  if (branchParity ===  ODD) parentElement.child_O = CLOSED;

  if (parentElement.child_E === CLOSED && parentElement.child_O === CLOSED) {
    parentElement.status = CLOSED;
    if (parentElement.type === NODE) {
      fullClosedNodes += 1n;
      halfClosedNodes -= 2n;
    }
  }
}

createChild(ANY, ROOT_PARENT_ID);

// ------------------------------------------------------------------------ Main loop
let zigzag = true;

while (!loopFound) {

  if (mainLoopCounter % 10000n === 10n) showStatistics(); // 100 000 000
  mainLoopCounter++;

  const currentElement = treeElements[nextIndex];

  if (MAX_STORAGE === treeElements.length) {
    console.log('-------------------------------');
    console.log('Max array length is reached');
    break;
  }

  if (MAX_DISTANCE === currentElement.distance) {
    console.log('-------------------------------');
    console.log('Max distance is reached');
    break;
  }

  if (currentElement.status === CLOSED) {
    nextIndex = currentElement.parent_ID;
    if (nextIndex === ROOT_PARENT_ID) {
      console.log('-------------------------------');
      console.log('Root number class was CLOSED !');
      break;
    }
    closeParent(currentElement.branch, nextIndex);
    // ---------------------------------------------------- v2.0
    const removedElement = treeElements.pop();
    // console.log('-------------------------------');
    // console.log('removing', removedElement);
    // console.log('last ID : ', treeElements.length - 1);
    // console.log('closing : ', nextIndex);
    // ---------------------------------------------------- v2.0
    // showInfo = false; // Diag data
    continue;
  }

  nextIndex = treeElements.length;

  zigzag = currentElement.node.distance % 2 === 1 ? true : false;
  if (zigzag) {
    if (currentElement.child_E === OPEN) {
      createChild(EVEN, currentElement.current_ID);
      continue;
    }
    if (currentElement.child_O === OPEN) {
      createChild( ODD, currentElement.current_ID);
      continue;
    }
  }
  if (!zigzag) {
    if (currentElement.child_O === OPEN) {
      createChild( ODD, currentElement.current_ID);
      continue;
    }
    if (currentElement.child_E === OPEN) {
      createChild(EVEN, currentElement.current_ID);
      continue;
    }
  }
}

showStatistics();

const reachedElement = treeElements[treeElements.length - 1];
const fileName = `stat/reached_element_${reachedElement.distance}.txt`;
dumpSingleElementToFile (fileName);
