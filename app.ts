import { GinlonApi } from "./api/ginlon.api";
import { MqttApi } from "./api/mqtt.api";
import { CONFIG } from "./config";

const mqttClient = MqttApi.createClient( CONFIG.mqtt_host, CONFIG.mqtt_config );

const updateHASS = ( initial: boolean = false ) => {
  try {

    GinlonApi.authenticate( CONFIG.username, CONFIG.password ).then( ( cookie: string | Array<string> ) => {
      GinlonApi.getInverterDetails( cookie, CONFIG.plantId ).then( details => {
        const interterData: Array<{ name: string, value: string, unit: string, key: string }> = JSON.parse( details.result.deviceWapper.paramDaySelectors );
        const serialNumber = details.result.deviceWapper.sn;
        const lastUpdated = new Date( details.result.deviceWapper.updateDate );
        const dateDiff = new Date().getTime() - lastUpdated.getTime();
        const online = dateDiff < (1000 * 60 * 15);
        if ( initial ) {
          interterData.forEach( item => {
            MqttApi.createSensor( mqttClient, serialNumber, item.key, item.name, item.unit );
          } );
        }

        // only update if device was updated last 15 minutes;
        if ( online ) {
          MqttApi.updateSensors( mqttClient, serialNumber, interterData.map( item => ({ key: item.key, value: item.value }) ) );
        } else {
          console.log( "Inverter is offline" );
        }

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

// periodic update every 5 minutes;
  setInterval( () => {
    updateHASS();
  }, 1000 * 60 * 5 );

// initial update;
  updateHASS( true );
} );
