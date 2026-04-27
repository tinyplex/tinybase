// NB: an exclamation mark after a line visually indicates an expected TS error
import type {ComponentProps} from 'svelte';
import {Inspector} from 'tinybase/ui-svelte-inspector/with-schemas';

const props: ComponentProps<typeof Inspector> = {};
props.position = 'middle'; // !
props.open = 'true'; // !
props.hue = 'purple'; // !
