import { GinlonApi } from "./api/ginlon.api";
import { MqttApi } from "./api/mqtt.api";
import { CONFIG } from "./config";

const mqttClient = MqttApi.createClient( CONFIG.mqtt_host, CONFIG.mqtt_config );
const updateHASS = ( initial: boolean = false ) => {
  try {

    GinlonApi.authenticate( CONFIG.username, CONFIG.password ).then( ( cookie: string | Array<string> ) => {
      GinlonApi.getInverterDetails( cookie, CONFIG.plantId ).then( details => {
        const interterData: Array<{ name: string, value: string, unit: string, key: string }> = [
          ...details.result.deviceWapper.realTimeDataElect,
          ...details.result.deviceWapper.realTimeDataImp,
          ...details.result.deviceWapper.realTimeDataOther,
        ];
        const serialNumber = details.result.deviceWapper.sn;
        const lastUpdated = new Date( details.result.deviceWapper.updateDate );
        const dateDiff = new Date().getTime() - lastUpdated.getTime();
        const online = dateDiff < (1000 * 60 * 15);

        // default static sensors
        MqttApi.createSensor( mqttClient, serialNumber, 'online', `Inverter ${serialNumber} online:`, '' );
        MqttApi.createSensor( mqttClient, serialNumber, 'last_online', `Last seen online:`, 'timestamp' );

        // dynamic sensors
        interterData.forEach( item => {
          MqttApi.createSensor( mqttClient, serialNumber, item.key, item.name, item.unit );
        } );

        MqttApi.updateSensors( mqttClient, serialNumber, [
          { key: 'online', value: online ? 'On' : 'Off' },
          { key: 'last_online', value: lastUpdated.toISOString() }
        ] );

        // update with current value
        MqttApi.updateSensors( mqttClient, serialNumber, interterData.map( item => ({ key: item.key, value: item.value }) ) );

        console.log( "SN:", serialNumber );
        console.log( "lastUpdated:", lastUpdated );
        console.log( "online:", online );

      } );
    } );
  } catch ( e ) {
    console.log( 'Issue during update of sensor data' );
    console.log( e );
  }

};
mqttClient.on( 'connect', () => {
  console.log( mqttClient.connected );

// periodic update every 1 minutes;
  setInterval( () => {
    updateHASS();
  }, 1000 * 60 );

// initial update;
  updateHASS( true );
} );
