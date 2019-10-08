'use strict';

const $ = id => document.getElementById(id);
const provinceInput = $('province-input');
const districtInput = $('district-input');
const wardInput = $('ward-input');
let information;
// region ELEGANT?
const map = fn => data => data.map(fn);
const forEach = fn => data => {
	data.forEach(fn);
	return data;
}
const appendChild = input => child => input.appendChild(child);
const chain = (...fns) => data => fns.reduceRight((a, v) => v(a), data);
const get = attr => object => object[attr];
const getList = type => map(get(type));
const find = type => value => data => data.find(e => e[type] == value);
const cat = arr1 => arr2 => arr1.map((e, i) => e ? e + ' ' + arr2[i] : arr2[i]);
const getOptionElement = text => {
	const optionElement = document.createElement('option');
	optionElement.innerText = text;
	return optionElement;
}
const populateInput = input => data => {
	input.innerHTML = '';
	chain(forEach(appendChild(input)), map(getOptionElement), getList('name'))(data);
	input.dispatchEvent(new Event('change'));
	return data;
}
const handleProvinceInput = data => {
	provinceInput.onchange = e => chain(populateInput(districtInput), get('district'), find('name')(provinceInput.value))(data);
	return data;
}
const handleDistrictInput = data => {
	districtInput.onchange = e => chain(populateInput(wardInput), get('ward'), find('name')(districtInput.value), get('district'), find('name')(provinceInput.value))(data);
	return data;
}

fetch('address.json')
	.then(res => res.json())
	.then(data => information = data)
	.then(handleProvinceInput)
	.then(handleDistrictInput)
	.then(populateInput(provinceInput))
	.catch(console.error);
// end region
