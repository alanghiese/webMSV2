import { Injectable } from '@angular/core';

import { LoginResponse, UserAccount, Client, DataSource, Turn } from '../interfaces';


@Injectable()
export class SessionProvider {

  private session: LoginResponse = null;


  isActive(): boolean {
    return this.session != null;
  }

  setSession(session: LoginResponse): void {
    this.session = session;
  }

  removeSession(): void {
    this.session = null;
  }

  getUser(): UserAccount {
    return this.session.usuario;
  }

  getUserName(): string {
    if (!this.session)
      return '';
    
    return this.session.usuario.nombreCompleto;
  }

  getUserCode(): number {
    return this.session.usuario.codigo;;
  }

  getDataSourceList(): DataSource[] {
    return this.session.usuario.fuenteDatos;
  }

  getDefaultAppointments(): Turn[] {
    return this.getActiveClient().turnos;
  }

  setActiveClient(client: Client): void {
    if (this.session) {
      this.session.conexion.data = client;
    }
  }

  getActiveClient(): Client {
    return this.session.conexion.data;
  }

  getActiveClientName(): string {
    if (!this.session)
      return '';

    return this.getActiveClient().empresa;
  }

  getAdsURL(): string {
    if (!this.session)
      return '';

    return this.session.publicidad;
  }
}
