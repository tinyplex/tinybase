import {GlobalRegistrator} from '@happy-dom/global-registrator';

GlobalRegistrator.register();

(global as any).IS_REACT_ACT_ENVIRONMENT = true;
