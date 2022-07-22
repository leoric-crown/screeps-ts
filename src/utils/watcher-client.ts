export default function() {
  if (typeof Memory.watch !== "object") {
    Memory.watch = {};
  }
  if (typeof Memory.watch.expressions !== "object") {
    Memory.watch.expressions = {};
  }
  if (typeof Memory.watch.values !== "object") {
    Memory.watch.values = {};
  }
  _.each(Memory.watch.expressions, (expr, name) => {
    if (typeof expr !== "string") return;
    let result;
    try {
      const myEval = eval
      result = myEval(expr)
    } catch (ex: any) {
      result = "Error: " + ex.message;
    }
    if (name == "console") {
      if (typeof result !== "undefined") console.log(result);
    } else {
      Memory.watch.values[name as string] =
        typeof result !== "undefined" ? result.toString() : result;
    }
  });
};
