const EEnumType = require("../constants/EEnumType");

class Enum {
  #type
  #list = []

  /**
   * 
   * @param {EEnumType} type 
   */
  constructor(type) {
    this.#type = (type === EEnumType.SYMBOLIC) ? EEnumType.SYMBOLIC : EEnumType.NUMERIC;
  }

  mongoField({ required = false, default: def } = {}) {
    let result = {
      type: (this.#type === EEnumType.SYMBOLIC) ? String : [String],
      enum: this.list,
      get: key => {
        return this.get(key);
      },
      set: value => {
        return this.find(value);
      },
    };

    if (!!required) {
      result.required = required;
    }

    if (!!def) {
      result.default = (this.#type === EEnumType.SYMBOLIC) ? def : [def];
    }

    return result;
  }

  get list() {
    switch (this.#type) {
      case EEnumType.SYMBOLIC:
        return Object.keys(this.#list);

      case EEnumType.NUMERIC:
        return this.#list;

      default:
    }
  }

  /**
   * 
   * @param {String} key 
   */
  add(key) {
    switch (this.#type) {
      case EEnumType.SYMBOLIC:
        this.#list[key] = Symbol(key);
        break;

      case EEnumType.NUMERIC:
        this.#list.push(key);
        break;

      default:
    }
  }

  freeze() {
    Object.freeze(this.#list);
  }

  /**
   * 
   * @param {String|String[]} key 
   * @returns {Symbol|Number}
   */
  get(key) {
    switch (this.#type) {
      case EEnumType.SYMBOLIC:
        return this.#list[key];
        break;

      case EEnumType.NUMERIC:
        if (!Array.isArray(key)) {
          key = [key];
        }

        let items = key.map(k => this.#list.indexOf(k));

        return items.reduce((t, i) => (i >= 0) ? t += Math.pow(2, i) : t, 0);

      default:
    }
  }

  /**
   * 
   * @param {Symbol|Number} value
   * @returns {String|String[]}
   */
  find(value) {
    switch (this.#type) {
      case EEnumType.SYMBOLIC:
        let found = Object.entries(this.#list).find(item => item[1] === value);
        return !!found ? found[0] : undefined;

      case EEnumType.NUMERIC:
        let items = value.toString(2);
        let result = [];

        for (const i in items) {
          let position = items.length - i;
          if (items[i] == "1") {
            result.push(this.#list[position - 1]);
          }
        }
        return result;

      default:
    }
  }

  /**
   * @param {String|String[]|Number} key
   * @param {String|String[]|Number} has
   * @returns {Boolean}
   */
  check(key, has) {
    switch (this.#type) {
      case EEnumType.SYMBOLIC:
        if (!(has instanceof Symbol)) {
          has = this.get(has);
        }
        if (key instanceof Symbol) {
          key = this.find(key);
        }

        return this.#list[key] === has;

      case EEnumType.NUMERIC:
        let hasValue = isNaN(has) ? this.get(has) : has;
        let keyValue = isNaN(key) ? this.get(key) : key;
        return (hasValue & keyValue) === hasValue;
      // let keys = this.find(value);
      // return keys.includes(key);

      default:
    }
  }
}

module.exports = Enum;
