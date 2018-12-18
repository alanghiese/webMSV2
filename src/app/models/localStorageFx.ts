import { LOCAL_STORAGE, COMMON_WORDS, BOOLEAN_VAL } from '../constants'
//en esta clase voy a abstraer todo los cambios del local storage
export class localStorageModifications{


	//abstraigo comportamiento
	private static get(value){
		if (localStorage.getItem(value) == null)
			return COMMON_WORDS.EMPTY_CHAR;
		else 
			return localStorage.getItem(value);
	}

	public static clear(){
		localStorage.clear();
	}

	public static cleanURL(){
		if (localStorage.getItem(LOCAL_STORAGE.URL) != null)
			localStorage.removeItem(LOCAL_STORAGE.URL)
	}

	public static changeURL(value: string){
		localStorage.setItem(LOCAL_STORAGE.URL, value);
	}

	public static changeLogged(value: string){
		localStorage.setItem(LOCAL_STORAGE.LOGGED, value);
	}

	public static changeLoading(value: string){
		localStorage.setItem(LOCAL_STORAGE.LOADING, value);
	}

	public static changeRelog(value: string){
		localStorage.setItem(LOCAL_STORAGE.RELOG, value);
	}

	public static changeChecked(value: string){
		localStorage.setItem(LOCAL_STORAGE.CHECKED, value);
	}

	public static changeUser(value: string){
		localStorage.setItem(LOCAL_STORAGE.USER, value);
	}

	public static changePassword(value: string){
		localStorage.setItem(LOCAL_STORAGE.PASSWORD, value);
	}

	public static getChecked(){
		let checked = this.get(LOCAL_STORAGE.CHECKED);
		if (checked == null)
			return false;
		return checked;
	}

	public static getRelog(){
		let relog = this.get(LOCAL_STORAGE.RELOG);
		if (relog == null)
			return false;
		return relog;
	}

	public static getLogged(): boolean{
		let log = this.get(LOCAL_STORAGE.LOGGED);
		if (log == null)
			return false;
		return log == BOOLEAN_VAL.TRUE;
	}

	public static getUser(){
		return this.get(LOCAL_STORAGE.USER);
	}

	public static getPassword(){
		return this.get(LOCAL_STORAGE.PASSWORD);
	}

	public static getURL(){
		let url = this.get(LOCAL_STORAGE.URL);
		return url;
	}

	public static getLoading(): boolean{
		let loading = this.get(LOCAL_STORAGE.LOADING);
		if (loading == null)
			return false;
		return loading == BOOLEAN_VAL.TRUE;

	}


	


}