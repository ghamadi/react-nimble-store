type ObjectType = Record<string | number | symbol, unknown>;

export function shallowEqual(a: unknown, b: unknown) {
  if (typeof a !== 'object' && typeof b !== 'object') {
    return a === b;
  }

  if (!a || !b) {
    return a === b;
  }

  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);

  if (isArrayA !== isArrayB) {
    return false;
  }

  if (isArrayA && isArrayB) {
    return shallowEqualArray(a, b);
  }

  return shallowEqualObject(a as ObjectType, b as ObjectType);
}

export function shallowEqualArray(arr1: unknown[], arr2: unknown[]) {
  if (arr1 === arr2) {
    return true;
  }

  return arr1.length === arr2.length && arr1.every((item, index) => item === arr2[index]);
}

export function shallowEqualObject(obj1: ObjectType, obj2: ObjectType) {
  const keys1 = Reflect.ownKeys(obj1);
  const keys2 = Reflect.ownKeys(obj2);

  if (obj1 === obj2) {
    return true;
  }

  return keys1.length === keys2.length && keys1.every((key) => obj1[key] === obj2[key]);
}
