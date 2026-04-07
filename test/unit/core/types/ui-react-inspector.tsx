// NB: an exclamation mark after a line visually indicates an expected TS error
import type {ComponentProps} from 'react';
import {Inspector} from 'tinybase/ui-react-inspector/with-schemas';

const props: ComponentProps<typeof Inspector> = {};
props.position = 'middle'; // !
props.open = 'true'; // !
props.hue = 'purple'; // !
