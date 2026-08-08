/* eslint-disable @typescript-eslint/no-unused-expressions */
import {createArkTypeSchematizer} from 'tinybase/schematizers/schematizer-arktype/with-schemas';
import {createEffectSchematizer} from 'tinybase/schematizers/schematizer-effect/with-schemas';
import {createTypeBoxSchematizer} from 'tinybase/schematizers/schematizer-typebox/with-schemas';
import {createValibotSchematizer} from 'tinybase/schematizers/schematizer-valibot/with-schemas';
import {createYupSchematizer} from 'tinybase/schematizers/schematizer-yup/with-schemas';
import {createZodSchematizer} from 'tinybase/schematizers/schematizer-zod/with-schemas';
import {createCustomSchematizer} from 'tinybase/schematizers/with-schemas';

createCustomSchematizer satisfies typeof import('tinybase/schematizers').createCustomSchematizer;
createArkTypeSchematizer satisfies typeof import('tinybase/schematizers/schematizer-arktype').createArkTypeSchematizer;
createEffectSchematizer satisfies typeof import('tinybase/schematizers/schematizer-effect').createEffectSchematizer;
createTypeBoxSchematizer satisfies typeof import('tinybase/schematizers/schematizer-typebox').createTypeBoxSchematizer;
createValibotSchematizer satisfies typeof import('tinybase/schematizers/schematizer-valibot').createValibotSchematizer;
createYupSchematizer satisfies typeof import('tinybase/schematizers/schematizer-yup').createYupSchematizer;
createZodSchematizer satisfies typeof import('tinybase/schematizers/schematizer-zod').createZodSchematizer;
