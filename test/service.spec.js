const assert = require("assert");
import service from "../src/service";

describe("uuid test", () => {
  it("should exist", () => {
    assert.equal(16, service.uuid().length);
    assert.equal(24, service.uuid(24).length);
    assert.equal(60, service.uuid(60).length);
  });
});

describe("[test] deep copy", () => {
  it("shoulde be deep copied", (done) => {
    const src = {
      a: [2, 5, 7],
      b: {
        total: 10,
        solved: false,
        ready: "ready",
        callback: (dummy) => `[${dummy}]`,
      },
    };
    const dst = service.clone.deepCopy(src);
    assert.deepStrictEqual(src, dst);
    if (src.b.callback === dst.b.callback) {
      done();
    } else {
      done("fail to copy reference to function.");
    }
    // console.log(JSON.stringify(dst));
  });
});

describe("leaf merge", () => {
  it("should copy leaf value", () => {
    const target = {
      style: {
        padding: { top: 8, bottom: 8 },
        // property 'margin' does not exist
      },
    };
    service.clone.mergeLeaf(
      {
        style: {
          padding: { left: 16, right: 16 },
          margin: { top: 4, bottom: 4 },
        },
      },
      target
    );
    assert.deepStrictEqual(target.style.padding, {
      top: 8,
      bottom: 8,
      left: 16,
      right: 16,
    });
    assert.deepStrictEqual(target.style.margin, { top: 4, bottom: 4 });
    // const {padding} = target.style;
    // if (padding.left === 16 && padding.right === 16) {
    //   done();
    // } else {
    //   done('not matched');
    // }
  });
});
