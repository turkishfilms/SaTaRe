class Horse {
    #speed;
    #balance;
    constructor({ speed = 10, balance = 0 } = {}) {
      this.#speed = speed;
      this.#balance = balance;
    }
    get speed() {
      return this.#speed;
    }
  
    get balance() {
      return this.#balance;
    }
  
    set speed(speed) {
      this.#speed = speed;
    }
    set balance(balance) {
      this.#balance = balance;
    }
  
  }
  
  export default Horse