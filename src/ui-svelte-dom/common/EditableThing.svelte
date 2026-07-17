<script lang="ts">
  import type {Cell, Value} from '../../@types/index.d.ts';
  import type {CellOrValueType} from '../../common/cell.ts';
  import {getCellOrValueType, getTypeCase} from '../../common/cell.ts';
  import {tryCatchSync, tryReturn} from '../../common/error.ts';
  import {jsonParse, jsonString} from '../../common/json.ts';
  import {isObject} from '../../common/obj.ts';
  import {boolean, isArray, number, string} from '../../common/other.ts';
  import {
    ARRAY,
    BOOLEAN,
    NUMBER,
    OBJECT,
    STRING,
  } from '../../common/strings.ts';

  type Props = {
    readonly thing: Cell | Value | undefined;
    readonly onThingChange: (thing: Cell | Value) => void;
    readonly className: string;
    readonly hasSchema: (() => boolean) | undefined;
    readonly showType?: boolean;
  };

  let {
    thing,
    onThingChange,
    className,
    hasSchema,
    showType = true,
  }: Props = $props();

  const EMPTY_STRING = '';
  const INVALID = 'invalid';

  let thingType = $state<CellOrValueType>();
  let currentThingKey = $state<string>();
  let stringThing = $state<string>();
  let numberThing = $state<number>();
  let booleanThing = $state<boolean>();
  let objectThing = $state<string>('{}');
  let arrayThing = $state<string>('[]');
  let objectClassName = $state(EMPTY_STRING);
  let arrayClassName = $state(EMPTY_STRING);

  const getThingKey = (thing: Cell | Value | undefined): string =>
    `${getCellOrValueType(thing)}:${(isObject(thing) || isArray(thing)
      ? jsonString
      : string)(thing)}`;

  $effect(() => {
    const thingKey = getThingKey(thing);
    if (currentThingKey !== thingKey) {
      thingType = getCellOrValueType(thing);
      currentThingKey = thingKey;
      if (isObject(thing)) {
        objectThing = jsonString(thing);
      } else if (isArray(thing)) {
        arrayThing = jsonString(thing);
      } else {
        stringThing = string(thing);
        numberThing = number(thing) || 0;
        booleanThing = boolean(thing);
      }
    }
  });

  const handleThingChange = <T extends Cell | Value>(
    nextThing: T,
    setTypedThing: (thing: T) => void,
  ) => {
    setTypedThing(nextThing);
    currentThingKey = getThingKey(nextThing);
    onThingChange(nextThing);
  };

  const handleJsonThingChange = (
    value: string,
    setTypedThing: (value: string) => void,
    isThing: (thing: any) => boolean,
    setTypedClassName: (className: string) => void,
  ) => {
    setTypedThing(value);
    tryCatchSync(
      () => {
        const object = jsonParse(value);
        if (isThing(object)) {
          currentThingKey = getThingKey(object);
          onThingChange(object);
          setTypedClassName(EMPTY_STRING);
        }
      },
      () => setTypedClassName(INVALID),
    );
  };

  const handleTypeChange = () => {
    if (!hasSchema?.()) {
      const nextType = getTypeCase(
        thingType,
        NUMBER,
        BOOLEAN,
        OBJECT,
        ARRAY,
        STRING,
      ) as CellOrValueType;
      const nextThing = getTypeCase(
        nextType,
        stringThing,
        numberThing,
        booleanThing,
        tryReturn(() => jsonParse(objectThing), {}),
        tryReturn(() => jsonParse(arrayThing), []),
      ) as Cell | Value;
      thingType = nextType;
      currentThingKey = getThingKey(nextThing);
      onThingChange(nextThing);
    }
  };

  const hasWidget = $derived(getTypeCase(thingType, 1, 1, 1, 1, 1) == 1);
</script>

<div class={className}>
  {#if showType && hasWidget}
    <button title={thingType} class={thingType} onclick={handleTypeChange}>
      {thingType}
    </button>{/if}{#if thingType == STRING}
    <input
      value={stringThing}
      oninput={(event) =>
        handleThingChange(
          string((event.currentTarget as HTMLInputElement).value),
          (value) => (stringThing = value),
        )}
    />
  {:else if thingType == NUMBER}
    <input
      type="number"
      value={numberThing}
      oninput={(event) =>
        handleThingChange(
          number((event.currentTarget as HTMLInputElement).value || 0),
          (value) => (numberThing = value),
        )}
    />
  {:else if thingType == BOOLEAN}
    <input
      type="checkbox"
      checked={booleanThing}
      onchange={(event) =>
        handleThingChange(
          boolean((event.currentTarget as HTMLInputElement).checked),
          (value) => (booleanThing = value),
        )}
    />
  {:else if thingType == OBJECT}
    <input
      value={objectThing}
      class={objectClassName}
      oninput={(event) =>
        handleJsonThingChange(
          (event.currentTarget as HTMLInputElement).value,
          (value) => (objectThing = value),
          isObject,
          (value) => (objectClassName = value),
        )}
    />
  {:else if thingType == ARRAY}
    <input
      value={arrayThing}
      class={arrayClassName}
      oninput={(event) =>
        handleJsonThingChange(
          (event.currentTarget as HTMLInputElement).value,
          (value) => (arrayThing = value),
          isArray,
          (value) => (arrayClassName = value),
        )}
    />
  {/if}
</div>
