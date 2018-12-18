//aca van las interfaces de la aplicacion


//se usan para el login
export interface UserCredentials {
  enrollmentId: string,      // numero de matricula
  password: string           // password (texto plano)
}

export interface JSONResponse {
  data: any,
  error: {
    code: number,
    message: string
  }
}

export interface LoginResponse {
  usuario: UserAccount,       // datos de usuario
  conexion: { data: Client }, // conexion con la fuente de datos (automatico)
  publicidad: string          // URI de la imagen/gif publicitario
}

export interface UserAccount {
  idUsuario: number,          // id de usuario
  nombreCompleto: string,     // nombre completo del usuario
  codigo: number,             // ??
  matricula: number,          // matricula del medico
  tipomatric: string,         // tipo de matricula
  esMedico: boolean,          // "S"
  daTurnos: boolean,          // "S"
  permisos: string,           // ""
  especialidad: string,       // nombre de la especialidad del medico
  categoria: string,          // categoria del medico
  logoDefault: string,        // logo del usuario por default
  logoChicoDefault: string,   // logo del usuario por default (chico)
  fuenteDatos: DataSource[],  
}

export interface DataSource {
  nombreFuente: string,       // nombre de la fuente de datos
  nombre: string,             // nombre de la empresa
  logo: string,               // logo de la empresa
  logoChico: string,          // logo de la empresa (chico)
}
 
export interface Client {
  cliente: string,            // nombre de la fuente de datos
  empresa: string,            // nombre de la empresa
  usuarioEnCliente: UserAccount, 
  logo: string,               // logo de la empresa
  logoChico: string,          // logo de la empresa (chico)
  logoDefault: string,        // logo por default
  logoChicoDefault: string,   // logo por default (chico)
  servicios: Service[], //arreglo de servicios
  medicos: Doctor[], //arreglo de medicos
  coberturas: Coverage[], //arreglo de coberturas
  horarios: Hour, // horarios disponibles ?
  turnos: Turn[] //AppointmentQuery    // turnos del dia actual 
  other: any //esto es para contemplar los cambios que aun no estan en la documentacion
}

export interface changeClientResponse{
  data:Client
}

export interface Service{
	SERVIOCIO: string
}

export interface Doctor{
	TIPOMATRIC: string,
	MATRICULA: string,
	DURATURNO: string,
	LeyendaWeb: any,
	categoria: string,
	especialidad: string,
	codigo: string,
	nombre: string,
	cantcons: string,
	idxMedIniHora: string,
	idxMedFinHora: string,
	idxMedIniAus: string,
	idxMedFinAus: string,
	idxMedIniTur: string,
	idxMedFinTur: string,
	restriccionesOS: any[]
}

export interface Coverage{
	nombre: string,
	label: string,
	value: string,
	estado: string,
	gerenciadora: string,
	codigo: string
}

export interface Hour{
	msg: string,
	horarios: any
}

export interface Turn{
	msg: string,
	turnos: any //??
}

//sirve para el getStatistics (los turnos cumplen con esta interface)
export interface turnosV0{
  id:any;
  tema:any;
  subTema:any;
  nomUsuario:any;
  fecha1:any;
  fecha2:any;
  campo1:any;
  valor1:any;
  campo2:string;
  valor2:any;
  campo3:string;
  valor3:any;  
  campo4:string;
  valor4:any;
  campo5:any;
  valor5:any;
  campo6:any;
  valor6:any;
  campo7:any;
  valor7:any;
}

//utilizado en los graficos para el almacenamiento de datos (es la interface de las variables)
export interface regStatistics{

  name: string;
  avgDoctor: number;
  avgPatient: number;
  countWeb: number;
  countDesktop: number;
  
}

export interface webVSdesktop{ 
  name:string;
  web: number;
  desktop: number;
}

//esta interface la uso en turnos
export interface tuple{
    name: string;
    percentage: number;
    count: number;
}

export interface serviceObject{
  SERVICIO;
}

export interface coverageObject{
  codigo;
  estado;
  gerenciadora;
  label;
  nombre;
  value;
}