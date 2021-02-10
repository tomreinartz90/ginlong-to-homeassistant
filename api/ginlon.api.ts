import request from "request";

export class GinlonApi {
  static authenticate( userName: string, password: string ): Promise<string | Array<string>> {
    return new Promise( ( resolve, reject ) => {
      console.info( `Authenticating ${userName}` );

      request.post( {
          url: `https://m.ginlong.com/cpro/login/validateLogin.json`,
          formData: {
            userName,
            userNameDisplay: userName,
            password,
            lan: '2',
            domain: "m.ginlong.com",
            userType: "C",
            rememberMe: "true",
          }
        },
        ( error, response, body ) => {
          const result: any = body && body.charAt(0) === "{" ? JSON.parse( body ) : {};
          const cookie = response ? (response.headers[ 'Set-Cookie' ] || response.headers[ 'set-cookie' ] ) : null;
          if ( result.state === 5 && cookie ) {
            return resolve( cookie );
          }
          console.error( error );
          console.info( response );
          return reject( 'could not authenticate' );
        } );
    } );
  }

  static getInverterDetails( cookie: string | Array<string>, deviceId: string ): Promise<any> {
    return new Promise( ( resolve, reject ) => {
      console.info( `getInverterDetails for ${deviceId}` );

      request.post( {
          url: `https://m.ginlong.com/cpro/device/inverter/goDetailAjax.json`,
          formData: {
            deviceId,
          },
          headers: {
            cookie
          }
        },
        ( error, response, body ) => {
          const result: any = body && body.charAt(0) === "{" ? JSON.parse( body ) : {};
          if ( result ) {
            return resolve( result );
          }
          console.error( error );
          console.info( response );
          return reject( 'could not get details' );
        } );
    } );
  }
}
