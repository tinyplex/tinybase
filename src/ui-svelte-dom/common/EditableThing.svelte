<script lang="ts">
  import type {Cell, Value} from '../../@types/index.d.ts';
  import type {CellOrValueType} from '../../common/cell.ts';
  import {
    getCellOrValueType,
    getTypeCase,
  } from '../../common/cell.ts';
  import {jsonParse, jsonString} from '../../common/json.ts';
  import {isObject} from '../../common/obj.ts';
  import {isArray, tryReturn} from '../../common/other.ts';
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
  let currentThing = $state<Cell | Value>();
  let stringThing = $state<string>();
  let numberThing = $state<number>();
  let booleanThing = $state<boolean>();
  let objectThing = $state<string>('{}');
  let arrayThing = $state<string>('[]');
  let objectClassName = $state(EMPTY_STRING);
  let arrayClassName = $state(EMPTY_STRING);

  $effect(() => {
    if (currentThing !== thing) {
      thingType = getCellOrValueType(thing);
      currentThing = thing;
      if (isObject(thing)) {
        objectThing = jsonString(thing);
      } else if (isArray(thing)) {
        arrayThing = jsonString(thing);
      } else {
        stringThing = String(thing);
        numberThing = Number(thing) || 0;
        booleanThing = Boolean(thing);
      }
    }
  });

  const handleThingChange = <T extends Cell | Value>(
    nextThing: T,
    setTypedThing: (thing: T) => void,
  ) => {
    setTypedThing(nextThing);
    currentThing = nextThing;
    onThingChange(nextThing);
  };

  const handleJsonThingChange = (
    value: string,
    setTypedThing: (value: string) => void,
    isThing: (thing: any) => boolean,
    setTypedClassName: (className: string) => void,
  ) => {
    setTypedThing(value);
    try {
      const object = jsonParse(value);
      if (isThing(object)) {
        currentThing = object;
        onThingChange(object);
        setTypedClassName(EMPTY_STRING);
      }
    } catch {
      setTypedClassName(INVALID);
    }
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
      currentThing = nextThing;
      onThingChange(nextThing);
    }
  };

  const hasWidget = $derived(getTypeCase(thingType, 1, 1, 1, 1, 1) == 1);
</script>

<div class={className}>
  {#if showType && hasWidget}
    <button title={thingType} class={thingType} onclick={handleTypeChange}>
      {thingType}
    </button>
  {/if}
  {#if thingType == STRING}
    <input
      value={stringThing}
      oninput={(event) =>
        handleThingChange(
          String((event.currentTarget as HTMLInputElement).value),
          (value) => (stringThing = value),
        )}
    />
  {:else if thingType == NUMBER}
    <input
      type="number"
      value={numberThing}
      oninput={(event) =>
        handleThingChange(
          Number((event.currentTarget as HTMLInputElement).value || 0),
          (value) => (numberThing = value),
        )}
    />
  {:else if thingType == BOOLEAN}
    <input
      type="checkbox"
      checked={booleanThing}
      onchange={(event) =>
        handleThingChange(
          Boolean((event.currentTarget as HTMLInputElement).checked),
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
