//import { sayHello, sayHi } from './module1.js'
import * as lib from './module1.js'

let var1 = undefined;
let var2 = "asdf";
console.log("Q1-1:" + Boolean(var1 && var2));
console.log("Q1-2:" + (var1 && var2));
//console.log(var1.toBoolean() && var2.toBoolean()); // TypeError: Cannot read properties of undefined (reading 'toBoolean').
console.log("Q1-3:" + (Boolean(var1) && Boolean(var2)));

console.log("Q6-1:" + 10/0);
console.log("Q6-2:" + 10/'two');
console.log("Q6-2:" + 10 / Number('5'));
console.log("Q6-4:" + parseInt('two'));

setTimeout(doSomething, 1000, 'p1');
function doSomething(p1) {
    console.log("Q8: " + p1);
}

const copy = JSON.stringify([ new String('false'), new Boolean( false ), undefined ]);
console.log("Q10: " + copy);

let inArray =[ [ 1, 2 ] , [ 3, 4, 5 ] ]; 
console.log("Q11-1: " + [].concat.apply([], inArray));
console.log("Q11-2: " + [].concat(inArray));
console.log("Q11-3: " + [].concat.apply(inArray, []));
//console.log("Q11-4: " + [].concat([....inArray]));  // Att: four dots.

// -- Q14 
const exec = (item, delay) => 
    new Promise(resolve => setTimeout( () => resolve(item), delay)); 

async function runParallel() { 
    //const {result1, result2, result3} = await Promise.all( 
    const data = await Promise.all( 
        [exec ('x', '100') , exec('y', 500), exec('z','100')] 
    ); 
    //return `parallel is done: ${result1}-${result2}-${result3}`; 
    return data;
}

runParallel().then(function(data){console.log("Q14: " + data);});
runParallel().then(data => console.log("Q14: " + data),);

// -- Q15 
let car1 = new Promise((_ , reject) => setTimeout(reject, 2000, "car 1 crashed in"));
let car2 =new Promise(resolve => setTimeout(resolve, 1500, "car 2 completed"));
let car3 =new Promise(resolve => setTimeout(resolve, 3000, "car 3 completed"));

Promise.race([car1, car2, car3])
    .then (value => {
        let result = "Q15: " +  '' + `${value} the race.`;
        console.log(result);
    })
    .catch(arr => {
        console.log("Race is cancelled.", err);
    });

// -- Q21
lib.sayHello("Q21: " + 'Sai');
lib.sayHi("Q21: " + 'Cui');

// -- Q22
console.log('Q22: start');
Promise.resolve('Q22: Success').then(data => console.log(data));
console.log('Q22: end');

// -- Q25
let productSkU = '8675309';
console.log("Q25: " + productSkU.padStart(16, '0').padStart(19, 'sku'));

// -- Q27
function ketchen() {
    return new Promise((resolve, reject) => {
        resolve("Success.");
    });
}
ketchen().catch().then().finally(console.log('Q27 : arg is optional'));

// -- Q29
console.log('Q29: ' + true + 13 + NaN);

// -- Q30
console.log('Q30: ' + JSON.parse('"foo"'));
//console.log('Q30: ' + JSON.parse("'foo'"));//SyntaxError: Unexpected token ' in JSON at position 0
//console.log('Q30: ' + JSON.parse('foo'));//SyntaxError: Unexpected token o in JSON at position 1
//console.log('Q30: ' + JSON.parse("foo"));//SyntaxError: Unexpected token o in JSON at position 1

// -- Q31

let first = 'Who';
let second = 'What';
try {
    try {
        throw new Error('Sad trombone');
    } catch (err) {
        first = 'Why';
        throw err;
    } finally {
        second = 'When';
    }
} catch (err) {
    second = 'Where';
}
console.log(`Q31: first is ${first} and second is ${second}` );

// -- Q41
console.assert(11 % 2 === 0, "Q41:");

// -- Q47
let array = [1, 2, 3, 4, 4, 5, 4, 4];
for (let i = 0; i < array.length; i++) {
    if (array[i] === 4) {
        array.splice(i, 1);
        i--;
    }
}
console.log("Q47: " + array);

// -- Q49
function changeValue(param) {
    param = 5;
}
let a = 10;
let b = a;

changeValue(b);
const result = a + ' - ' + b;
console.log("Q49: " + result);

// -- Q50
function Animal(size, type) {
    this.type = type || 'Animal';
    this.canTalk = false;
}

Animal.prototype.speak = function() {
    if (this.calTalk) {
        console.log("it spoke!");
    }
};

let Pet = function(size, type, name, owner) {
    Animal.call(this, size, type);
    this.size = size;
    this.name = name;
    this.owner = owner;
}

Pet.prototype = Object.create(Animal.prototype);
let pet1 = new Pet();
console.group("Q50: ");
console.dir(pet1);
console.groupEnd();

// sleep 
await lib.sleep(2000);
//await new Promise(r => setTimeout(r, 2000));

// -- Q51
console.group("Q51: ");
setTimeout(() => {
    console.log(1);
}, 0);
console.log(2);
new Promise((resolve, reject) => {
    setTimeout(() => {
    reject(console.log(3));
    }, 1000);
}).catch(() => {
    console.log(4);
});
console.log(5);
await lib.sleep(1000);
console.groupEnd();

// -- Q52
function Person(firstName, lastName, eyeColor) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.eyeColor = eyeColor;
}
Person.job = 'Developer';
console.log("Q52: " + typeof(Person));
console.log("Q52: " + Person.job);
const myFather = new Person('John', 'Doe');
console.log("Q52: " + myFather.job);

// -- Q58
const date = new Date(2020, 5, 10);
const dateDisplayOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};
const formattedDate = date.toLocaleDateString('en', dateDisplayOptions);
console.log("Q58: " + formattedDate);

// -- Q60
function getAvailabilityMessage(item) {
    if (getAvailability(item)) {
        var msg = "Username available";
    }
    return msg;
}
function getAvailability(item) {
    return false;
}
console.log("Q60: " + getAvailabilityMessage('test'));

// -- Q61
const objBook = {
    title : 'JavaScript', 
};
Object.preventExtensions(objBook);
const newObjBook = objBook;
//newObjBook.author = 'Robert'; // TypeError: Cannot add property author, object is not extensible
console.log("Q61: ");
console.group();
console.log(objBook);
console.log(newObjBook);
console.groupEnd();

// -- Q62
const str = 'Salesforce'; 
console.log(str.substr(0, 5));
console.log(str.substring(0, 5));

// -- Q64
const searchText = 'Yay! Salesforce is amazing!';

let result1 = searchText.search(/sales/i);
let result2 = searchText.search(/sales/);

console.log("Q64: ");
console.group();
console.log(result1);
console.log(result2);
console.groupEnd();
console.log('aa');

// -- Q65
console.log("Q65: ");
console.group();
console.log(isNaN(100 / 'a'));
console.log(Object.is(NaN, 100 / 'a'));
console.groupEnd();

// -- Q67
class Item { 
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
}
class SaleItem extends Item {
    constructor(name, price, discount) {
        super(name, price);
        this.discount = discount;    
    }
}
let regItem = new Item('Scarf', 55);
let saleItem = new SaleItem('Shirt', 80, .1);
Item.prototype.description = function() { return 'This is a ' + this.name; }
console.log("Q67: ");
console.group();
console.log(regItem.description());
console.log(saleItem.description());

SaleItem.prototype.description = function() { return 'This is a discounted ' + this.name; }
console.log(regItem.description());
console.log(saleItem.description());
console.groupEnd();
