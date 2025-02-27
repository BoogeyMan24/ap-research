// Helper functions adapted from https://www.30secondsofcode.org/js/s/convert-csv-to-array-object-or-json/

export const isEmptyValue = value =>
	value === null || value === undefined || Number.isNaN(value);
  
export const serializeValue = (value, delimiter = ',') => {
	if (isEmptyValue(value)) return '';
	if (Array.isArray(value)) {
		value = `"['${value.join(`'${delimiter}'`)}']"`;

	} else {
		value = `${value}`;

		if (value.includes(delimiter) || value.includes('\r') || value.includes('\n') || value.includes('"')) {
			return `"${value.replace(/"/g, "'").replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ')}"`;
		}
	}

	return value;
};
  
export const serializeRow = (row, delimiter = ',') => row.map(value => serializeValue(value, delimiter)).join(delimiter);