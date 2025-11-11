// The file contents for the current environment will be reloaded if the browser window is resized.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=production` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api', // Matches your backend's server.port from application.properties
  googleMapsApiKey: 'AIzaSyAesghwjP4rRIsl2qyuVGe9JVD1yRiQ_ww' // Replace with your actual API key
};
