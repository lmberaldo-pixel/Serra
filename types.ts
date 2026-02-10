
export interface ServiceRequest {
  clientName: string;
  phone: string;
  description: string;
  serviceType: string;
}

export enum ServiceCategory {
  PORTAO = 'Portão',
  FECHADURA = 'Fechadura/Tranca',
  GRADES = 'Grades',
  CORRIMAO = 'Corrimão',
  SOLDA = 'Corte e Solda',
  OUTROS = 'Outros Reparos'
}