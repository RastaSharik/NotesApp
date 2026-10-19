import { C as Calendar$1 } from '../chunks/bcb7abc1.js';
import { i as interactionPlugin } from '../chunks/62ea4145.js';
import { d as dayGridPlugin } from '../chunks/7367f8ae.js';
import { t as timeGridPlugin } from '../chunks/84e8fba4.js';
import { l as listPlugin } from '../chunks/c49d3409.js';
import { m as multiMonthPlugin } from '../chunks/e742c310.js';

const plugins = [
    interactionPlugin,
    dayGridPlugin,
    timeGridPlugin,
    listPlugin,
    multiMonthPlugin,
];
class Calendar extends Calendar$1 {
    constructor(el, optionOverrides = {}) {
        super(el, {
            ...optionOverrides,
            plugins: [
                ...plugins,
                ...(optionOverrides.plugins || []),
            ]
        });
    }
}

export { Calendar, Calendar as default, plugins };
