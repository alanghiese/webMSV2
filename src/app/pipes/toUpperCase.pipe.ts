import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'UPPERCASE'
})

export class UPPERCASE implements PipeTransform{

	transform(value: string){
		let upperWord = value.toUpperCase();
		return upperWord; 
	}
}