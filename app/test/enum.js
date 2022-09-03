const { expect } = require("@jest/globals");

const EEnumType = require("../constants/EEnumType");
const Enum = require("../core/enum");

module.exports.symbolicEnums = done => {
  try {
    class ETest extends Enum {
      constructor() {
        super(EEnumType.SYMBOLIC);

        this.add("SUPER_ADMIN");
        this.add("ADMIN");
        this.add("BUSINESS");
        this.add("CLIENT");

        this.freeze();
      }
    }

    let eTest = new ETest();

    let admin = eTest.get("ADMIN");

    expect(eTest.list).toEqual(["SUPER_ADMIN", "ADMIN", "BUSINESS", "CLIENT"]);
    expect(typeof admin).toBe("symbol");
    expect(eTest.find(admin)).not.toBe("SUPER_ADMIN");
    expect(eTest.find(admin)).toBe("ADMIN");

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.numericEnums = done => {
  try {
    class ETest extends Enum {
      constructor() {
        super(EEnumType.NUMERIC);

        this.add("SUPER_ADMIN");
        this.add("ADMIN");
        this.add("BUSINESS");
        this.add("CLIENT");

        this.freeze();
      }
    }

    let eTest = new ETest();
    let eTest2 = new ETest();

    expect(eTest.get("ADMIN")).toBe(eTest2.get("ADMIN"));
    expect(eTest.list).toEqual(["SUPER_ADMIN", "ADMIN", "BUSINESS", "CLIENT"]);
    expect(typeof eTest.get("ADMIN")).toBe("number");
    expect(eTest.get("ADMIN")).toBe(2);
    expect(eTest.get(["ADMIN", "CLIENT"])).toBe(10);
    expect(eTest.find(1)).toEqual(["SUPER_ADMIN"]);
    expect(eTest.find(1)).not.toEqual(["ADMIN"]);
    expect(eTest.find(2)).toEqual(["ADMIN"]);
    expect(eTest.find(3)).not.toEqual(["BUSINESS"]);
    expect(eTest.find(3)).not.toEqual(["ADMIN", "SUPERADMIN"]);
    expect(eTest.find(eTest.get("ADMIN") | eTest.get("CLIENT"))).not.toEqual(["ADMIN", "CLIENT"]);
    expect(eTest.check(3, "SUPER_ADMIN")).toBeTruthy();
    expect(eTest.check(["SUPER_ADMIN", "ADMIN"], "ADMIN")).toBeTruthy();
    expect(eTest.check(3, "BUSINESS")).toBeFalsy();

    done();
  } catch (err) {
    done(err);
  }
};
