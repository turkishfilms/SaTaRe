export default class Horse {
  #stats;
  #name;
  #color;
  constructor({
    stats = { balance: -1, weight: -1 },
    name = "Unnamed Horse",
    color = [255, 255, 255],
  } = {}) {
    this.#stats = stats;
    this.#name = name;
    this.#color = color;
  }

  get name() {
    return this.#name;
  }

  get color() {
    return this.#color;
  }

  get weight() {
    return this.#stats.weight;
  }

  get maxSpeed() {
    return this.#stats.weight;
  }

  get acceleration() {
    return 1 / this.#stats.weight;
  }

  get balance() {
    return this.#stats.balance;
  }

  set balance(balance) {
    this.#stats.balance = balance;
  }

  set stats(stats) {
    for (let stat in stats) {
      this.#stats[stat] = stats[stat];
    }
  }
}
