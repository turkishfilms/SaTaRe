

export default class Horse {
  #speed;
  #balance;
  #weight;
  #name;
  #color;
  constructor({
    speed = 10,
    balance = 0,
    weight = 100,
    name = "bloody",
    color = [255, 255, 255],
  } = {}) {
    this.#speed = speed;
    this.#balance = balance;
    this.#weight = weight;
    this.#name = name;
    this.#color = color;
  }
  get speed() {
    return this.#speed;
  }

  get name() {
    return this.#name;
  }

  get color() {
    return this.#color;
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
