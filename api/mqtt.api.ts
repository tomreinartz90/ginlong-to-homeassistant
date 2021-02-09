/*
# Push to MQTT
if mqtt.lower() == "true":
logging.info('MQTT output is enabled, posting results now...')

import paho.mqtt.publish as publish
msgs = []

mqtt_topic = ''.join([mqtt_client, "/" ])   # Create the topic base using the client_id and serial number

if (mqtt_username != "" and mqtt_password != ""):
auth_settings = {'username':mqtt_username, 'password':mqtt_password}
else:
auth_settings = None

msgs.append((mqtt_topic + "updateDate", int(updateDate), 0, False))
for key,value in inverterData.items():
msgs.append((mqtt_topic + key, value, 0, False))

publish.multiple(msgs, hostname=mqtt_server, auth=auth_settings)*/
import { connect, } from "mqtt";

import { DeviceClassEnum } from "../models/device-class.enum";
import { IClientOptions, MqttClient } from "mqtt/types/lib/client";

export class MqttApi {

  constructor() {
  }

  static createClient( url: string, opts?: IClientOptions ): MqttClient {
    return connect( url, opts );
  }

  private static getBaseTopic( serialNumber: string, key: string ) {
    return `homeassistant/sensor/ginlong_${serialNumber}_${key}`;
  }

  static createSensor( client: MqttClient, serialNumber: string, key: string, name: string, uom: string ) {
    let type = "None";
    switch ( uom.toLowerCase() ) {
      case 'a':
        type = DeviceClassEnum.current;
        break;
      case 'v':
        type = DeviceClassEnum.voltage;
        break;
      case 'w':
        type = DeviceClassEnum.power;
        break;
      case 'kwh':
        type = DeviceClassEnum.energy;
        break;
      case '℃':
        type = DeviceClassEnum.temperature;
        break;
    }

    const topic = `${MqttApi.getBaseTopic( serialNumber, key )}/config`;
    const message = {
      "manufacturer": "Ginlong",
      "device_class": type,
      "name": `Ginlong ${name}`,
      "expire_after": 60 * 15, // expect an update at least every 15 minutes
      "uniq_id": `${serialNumber}_${key}`,
      "identifiers": `${serialNumber}_${key}`,
      "device": { "identifiers": [ `ginlong_${serialNumber}_${key}` ] },
      "unit_of_measurement": uom,
      "state_topic": `${MqttApi.getBaseTopic( serialNumber, key )}/state`,
    };

    console.log( topic, message );
    client.publish( topic, JSON.stringify( message ), {}, ( err ) => err ? console.log( 'err', err ) : '' );
  }

  static updateSensors( client: MqttClient, serialNumber: string, values: Array<{ key: string, value: string }> ) {
    values.forEach( item => {
      client.publish( `${MqttApi.getBaseTopic( serialNumber, item.key )}/state`, item.value, {}, ( err ) => err ? console.log( 'err', err ) : '' );
      console.log( `${MqttApi.getBaseTopic( serialNumber, item.key )}/state`, item.value );
    } );

  }

  static removeSensor( client: MqttClient, serialNumber: string, key: string ) {
    const topic = `${MqttApi.getBaseTopic( serialNumber, key )}/config`;
    client.publish( topic, "" );
  }
}

