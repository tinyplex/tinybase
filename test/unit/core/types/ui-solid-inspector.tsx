/* @jsxImportSource solid-js */
// NB: an exclamation mark after a line visually indicates an expected TS error
import type {ComponentProps} from 'solid-js';
import {Inspector} from 'tinybase/ui-solid-inspector/with-schemas';

const props: ComponentProps<typeof Inspector> = {};
props.position = 'middle'; // !
props.open = 'true'; // !
props.hue = 'purple'; // !
