export function sayHello(user) {
    console.log(`Hello. ${user}!`);
}

export function sayHi(user) {
    console.log(`Hi. ${user}!`);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}