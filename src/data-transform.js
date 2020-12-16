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
		const [sourceValueExists, sourceValue] = extractProperty(
			sourceObject,
			instruction.from
		);

		let resultValue;

		if (sourceValueExists) {
			// source value exists
			resultValue = sourceValue;
			if (instruction.include) {
				resultValue = transformData(resultValue, instruction.include, options);
				if (instruction.to === null) {
					Object.assign(resultObject, resultValue);
				}
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
		setDeepProperty(resultObject, instruction.to, resultValue);
	}
	return resultObject;
}

module.exports = { transformData };
