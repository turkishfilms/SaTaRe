export default class Horse {
  #speed;
  #balance;
  #weight;
  #name;
  #color;
  constructor({ speed = 10, balance = 0, weight = 100 } = {}) {
    this.#speed = speed;
    this.#balance = balance;
    this.#weight = weight;
    this.#name
  }
  get speed() {
    return this.#speed;
  }

  get weight() {
    return this.#weight;
  }

  get maxSpeed() {
    return this.#weight;
  }

  get acceleration() {
    return 1 / this.#weight;
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
