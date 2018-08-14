import {
  surroundingAgent,
} from '../engine.mjs';
import {
  CreateBuiltinFunction,
  OrdinaryCreateFromConstructor,
  DefinePropertyOrThrow,
  ToString,
} from '../abstract-ops/all.mjs';
import {
  Type,
  ObjectValue,
  New as NewValue,
} from '../value.mjs';
import { Q, X } from '../completion.mjs';

export function CreateNativeError(realmRec) {
  [
    'EvalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError',
  ].forEach((name) => {
    const cons = CreateBuiltinFunction((realm, [message], { NewTarget }) => {
      let newTarget;
      if (Type(NewTarget) === 'Undefined') {
        newTarget = surroundingAgent.activeFunctionObject;
      } else {
        newTarget = NewTarget;
      }
      const O = Q(OrdinaryCreateFromConstructor(newTarget, `%${name}Prototype%`), ['ErrorData']);
      if (Type(message) !== 'Undefined') {
        const msg = Q(ToString(message));
        const msgDesc = {
          Value: msg,
          Writable: true,
          Enumerable: false,
          Configurable: true,
        };
        X(DefinePropertyOrThrow(O, NewValue('message'), msgDesc));
      }
      return O;
    }, [], realmRec);
    cons.properties.set(NewValue('length'), NewValue(1));

    const proto = new ObjectValue(realmRec);
    proto.Prototype = realmRec.Intrinsics['%ErrorPrototype%'];

    cons.DefineOwnProperty(NewValue('prototype'), {
      Value: proto,
      Writable: false,
      Enumerable: false,
      Configurable: false,
    });

    proto.DefineOwnProperty(NewValue('constructor'), {
      Value: cons,
      Writable: true,
      Enumerable: false,
      Configurable: true,
    });

    realmRec.Intrinsics[`%${name}Prototype%`] = proto;
    realmRec.Intrinsics[`%${name}%`] = cons;
  });
}
