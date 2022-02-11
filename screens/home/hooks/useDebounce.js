import React, { useEffect, useState } from "react";

const useDebounce = (value, delay) => {
	const [debouncedVal, setDebouncedVal] = useState(value);

	useEffect(() => {
		const time = setTimeout(() => setDebouncedVal(value), delay);
		return () => {
			clearTimeout(time);
		};
	}, [value]);

	return debouncedVal;
};

export default useDebounce;
