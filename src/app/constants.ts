//aca van las constantes de la aplicacion 

//para excel.service
export const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
export const EXCEL_EXTENSION = '.xlsx';


//para los parametros de los servicios
export const PARAMETERS = {
	LOGIN_TYPE: "tipoLogin",
	USER_ID: "idUsuario",
	PASSWORD: "pass",
	CLIENT: "cliente",
	STATIC_URL_TO_TEST: 'http://medisoftware.com.ar/MediwareHub/getStatic.php',
	ACTION: "accion",
	KEY: "clave",
	FROM: "desde",
	TO: "hasta",
	SERVICE: "servicio",
	DOCTOR_NAME: "nombreMedico",
	DOCTOR_ID: "codigoMedico",
	DATE_FROM: "fechaDesde",
	DATE_TO: "fechaHasta",
	DAY_MOMENT: "momentoDelDia",
	TURNSV0: 'turnosV0'
}



export const EMAIL_PARAMETERS = {
	SENDER_EMAIL: "direccionRte",
	SENDER_NAME: "nombreRte",
	DESTINATION_EMAIL: "direccionDst",
	DESTINATION_NAME: "nombreDst",
	MSG:"mensaje"
}


export const ACTIONS = {
	GET_STATISTICS: "getEstadisticas",
	GET_JSON_DOCTORS: "getJSONMedicos",
	GET_JSON_TURNS: "getJSONTurnos",
	GET_JSON_SERVICES: "getJSONServicios",
	ENVIAR_MENSAJE_CONTACTO: "enviarMensajeContacto"
}

//para dbPetitions
export const API_URL_BASE = 'http://medisoftware.com.ar/MediwareHub';

export const API_ENDPOINTS = {
	login: 'login.php',
	connectToClient: 'conectarA.php',
	getDoctors: 'mediwareHub.php',
	getTurnsDoctors: 'mediwareHub.php',
	getStatistics: 'mediwareHub.php',
	getMedicalHistory: 'mediwarehub.php',
	sendEmail: 'mediwarehub.php',
	searchPatient: 'mediwarehub.php',
	addMedicalHistoryEntry: 'mediwarehub.php'
};


//area comun

export const COMMON_WORDS = {
	ALL: 'todo',
	ANY: 'Ninguno',
	EMPTY_CHAR: '',
	NEED_LOGIN: 'logearse',
	ANYBODY: "Nadie",
	NO_COVERAGE: "SIN COBERTURA",
	NULL: "NULL",
	RECORDED: "grabado"
}

//constantes para el routing
export const PAGES = {
    MY_TURNS: "my_turns",
    MEDICAL_HISTORY: "medical_history",
    HOME: "home",
    CONTACT: "contact",
    LOGIN: "login",
    GRAPHS: "graphs",
    TURNS: "turns",
    REAL_TIME: "realtime"
};

//asi vienen los campos seteados desde la db
export const STATE_TURN_LETTER = {
    ALL: 'TODOS',
    MISSING: '',
    ATTENDED: 'A',
    WAITING: 'S',
    F: 'F',
    FCA: 'F CA',
    C: 'C'
};

//estos son para la parte grafica
export const STATE_TURN_WORD = {
	ATTENDED: "Atendidos",
	MISSING: "Ausentes",
	WAITING: "En sala de espera",
	F: 'Falto',
	FCA: 'Falto con aviso',
	ALL: "Todos",
	NOT_YET: "Aun no se presentan",  //solo lo uso para graphs.component.ts, no tiene nada que ver con ls db
	NOT_ATTENDED: "No atendidos" //solo lo uso para graphs.component.ts, no tiene nada que ver con ls db
}


// constante para los errores
export const ERRORS = {
	NEED_RELOG: 'Debe volver a iniciar sesion',
	CLIENT_NOT_EXISTS: "El cliente no existe",
	SESSION_EXPIRED: 'Sesion expirada, debe volver a loguearse',
	UPS: 'Ups! Algo salió mal, intente de nuevo',
	INCORRECT: "incorrecto",
	WRONG_ID: 'Matrícula o contraseña incorrecta',
	BEST_EXPERIENCIE: "Para una mejor experiencia, utilizar el celular de forma horizontal"
}

export const MESSAGES = {
	MESSAGE_SENT: "Mensaje enviado. Gracias por comunicarse con nosotros."
}

export const BOOLEAN_VAL = {
	TRUE: "true",
	FALSE: "false"
}

export const LOCAL_STORAGE = {
	LOGGED: "logged",
	LOADING: "loading",
	RELOG: "relog",
	USER: "usr",
	PASSWORD: "pass",
	CHECKED: "checked",
	URL: "url"
}

export const SUBTOPIC = {
    WEB: 'MediWeb',
    DESKTOP: 'escritorio'
};

//constante que se usa en turns
export const VALUES_GROUP_BY = {
	COV: "Cobertura",
	SER: "Servicio",
	DOC: "Medico"
};

export const DESTINATION_DATA = {
			EMAIL:" alan.hiese@gmail.com",
			NAME: "Alan Hiese"
};