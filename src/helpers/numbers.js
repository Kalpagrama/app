export function bigNumber(val) {
    let units = '';
    const steps = [
        { value: 10 ** 9, unit: 'B' },
        { value: 10 ** 6, unit: 'M' },
        { value: 10 ** 3, unit: 'K' },
    ];

    val += val;

    if (Number.isNaN(val)) return '';

    steps.forEach(el => {
        if (units === '' && val > el.value) {
            units = el.unit;
            val = val / el.value;
        }
    });

    const intVal = parseInt(val, 10);

    return `${(intVal < val ? (val).toFixed(1) : intVal)}${units}`;
}
