export enum DeviceClassEnum {
  battery= 'battery', //
  current= 'current', // Current in A.
  energy= 'energy', // Energy in Wh or kWh.
  humidity= 'humidity', // Percentage of humidity in the air.
  illuminance= 'illuminance', // The current light level in lx or lm.
  signal_strength= 'signal_strength', // Signal strength in dB or dBm.
  temperature= 'temperature', // Temperature in °C or °F.
  power= 'power', // Power in W or kW.
  power_factor= 'power_factor', // Power factor in %.
  pressure= 'pressure', // Pressure in hPa or mbar.
  timestamp= 'timestamp', // Datetime object or timestamp string (ISO 8601).
  voltage= 'voltage', // Voltage in V.
}
