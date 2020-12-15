const {
	setDeepProperty,
	extractDeepProperty,
} = require('@ngr900/deep-property');

function transformData(sourceObject, instructions, options = {}) {
	if (Array.isArray(sourceObject)) {
		return sourceObject.map((element) =>
			transformData(element, instructions, options)
		);
	}
	if (!Array.isArray(instructions)) {
		instructions = [instructions];
	}
	const resultObject = {};
	for (const instruction of instructions) {
		const [sourceValueExists, sourceValue] = extractDeepProperty(
			sourceObject,
			instruction.from
		);
		if (!sourceValueExists) {
			setDeepProperty(resultObject, instruction.to, undefined);
			continue;
		}
		let resultValue;
		if (instruction.include) {
			resultValue = transformData(sourceValue, instruction.include, options);
		} else {
			resultValue = sourceValue;
		}
		if (instruction.transform) {
			resultValue = instruction.transform(
				resultValue,
				resultObject,
				sourceObject
			);
		}
		setDeepProperty(resultObject, instruction.to, resultValue);
	}
	return resultObject;
}

module.exports = { transformData };
