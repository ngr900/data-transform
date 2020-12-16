const {
	setDeepProperty,
	extractDeepProperty,
} = require('@ngr900/deep-property');

function extractProperty(sourceObject, path) {
	if (path === null) {
		return [true, sourceObject];
	} else {
		return extractDeepProperty(sourceObject, path);
	}
}

function extractCombinedProperties(sourceObject, instruction) {
	const extracts = instruction.from.map((path) =>
		extractProperty(sourceObject, path)
	);
	const allExist = extracts.reduce((state, [exists]) => state && exists, true);
	if (!allExist) {
		return [false, undefined];
	}
	const allValues = extracts.reduce(
		(values, [, value]) => [...values, value],
		[]
	);
	const value = instruction.combine
		? instruction.combine(...allValues)
		: allValues;
	return [true, value];
}

function isObject(value) {
	return typeof value === 'object' && value !== null;
}

function transformData(sourceObject, instructions, options = {}) {
	// if the source is an array, map it using provided instructions
	if (Array.isArray(sourceObject)) {
		return sourceObject.map((sourceElement) =>
			transformData(sourceElement, instructions, options)
		);
	}

	// allow for single instructions given as an object
	if (!Array.isArray(instructions)) {
		instructions = [instructions];
	}

	// build the result object
	const resultObject = {};
	for (const instruction of instructions) {
		// extract value from source
		const combinedSource =
			instruction.from !== null && instruction.from.from !== undefined;
		const [sourceValueExists, sourceValue] = combinedSource
			? extractCombinedProperties(sourceObject, instruction.from)
			: extractProperty(sourceObject, instruction.from);

		let resultValue;

		if (sourceValueExists) {
			// source value exists, apply nested instructions and transform
			resultValue = sourceValue;
			if (instruction.instructions) {
				// TODO check if array or object
				resultValue = transformData(
					resultValue,
					instruction.instructions,
					options
				);
			}
			if (instruction.transform) {
				resultValue = instruction.transform(
					resultValue,
					resultObject,
					sourceObject
				);
			}
		} else if (instruction.default !== undefined) {
			// source value does not exist, try default
			resultValue = instruction.default;
		} else {
			// no source value and no default
			resultValue = undefined;
		}

		// set property or assign
		if (instruction.to === null) {
			if (!isObject(resultValue)) {
				// error
			}
			Object.assign(resultObject, resultValue);
		} else {
			setDeepProperty(resultObject, instruction.to, resultValue);
		}
	}
	return resultObject;
}

module.exports = transformData;
