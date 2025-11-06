// Constants for Auto Order Generator
// Following Google Engineering Practices

export const STATUS = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  PENDING: 'PENDING'
}

export const DELIVERY_SLOTS = ['09:00-12:00', '12:00-15:00', '15:00-18:00']

export const DELIVERY_NOTES = [
  'Llamar al llegar',
  'Dejar con portero',
  'Torre A, piso 5',
  'Apartamento 12B',
  'Timbre 3',
  ''
]

export const CUSTOMER_NOTES = [
  'Regalo de cumpleaños',
  'Aniversario de bodas',
  'Ocasión especial',
  'Día de la madre',
  'San Valentín',
  ''
]

export const ADDRESSES = [
  'Av. Francisco de Miranda, Chacao, Caracas',
  'Calle Principal de Los Palos Grandes, Caracas',
  'Av. Libertador, Altamira, Caracas',
  'Urbanización Las Mercedes, Caracas',
  'Centro Comercial San Ignacio, Caracas',
  'Calle Paris, Las Mercedes, Caracas',
  'Av. Principal de La Castellana, Caracas',
  'Calle Madrid, Las Mercedes, Caracas',
  'Av. Luis Roche, Altamira, Caracas',
  'Urbanización La Florida, Caracas',
  'Residencias El Rosal, Caracas',
  'Av. Orinoco, Las Mercedes, Caracas',
  'Calle Los Samanes, Los Palos Grandes, Caracas',
  'Centro Comercial Sambil, Chacao, Caracas',
  'Av. Abraham Lincoln, Sabana Grande, Caracas',
  'Parque Cristal, Los Palos Grandes, Caracas',
  'Av. Andrés Bello, Los Palos Grandes, Caracas',
  'Urbanización Colinas de Bello Monte, Caracas',
  'Los Dos Caminos, Caracas',
  'La California Norte, Caracas'
]

export const PHONE_PREFIXES = ['412', '414', '424', '416', '426']

export const EMAIL_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']
