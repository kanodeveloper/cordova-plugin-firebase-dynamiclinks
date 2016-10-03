module.exports = function (context) {

  function logMe(what) {
    console.error(what);
  }

  logMe("Running hook to copy any available google-services file to Android");

  var fs = require('fs');

  function fileExists(path) {
    try  {
      return fs.statSync(path).isFile();
    } catch (e) {
      logMe("fileExists error: " + e);
      return false;
    }
  }

  function directoryExists(path) {
    try  {
      return fs.statSync(path).isDirectory();
    } catch (e) {
      logMe("directoryExists error: " + e);
      return false;
    }
  }

  if (directoryExists("platforms/android")) {
    var paths = ["google-services.json", "platforms/android/assets/www/google-services.json"];

    for (var i = 0; i < paths.length; i++) {
      if (fileExists(paths[i])) {
        logMe("Found this file to write to Android: " + paths[i]);
        try {
          var contents = fs.readFileSync(paths[i]).toString();
          fs.writeFileSync("platforms/android/google-services.json", contents);

          var json = JSON.parse(contents);
          var strings = fs.readFileSync("platforms/android/res/values/strings.xml").toString();

          // strip non-default value
          strings = strings.replace(new RegExp('<string name="google_app_id">([^\@<]+?)</string>', "i"), '');

          // strip non-default value
          strings = strings.replace(new RegExp('<string name="google_api_key">([^\@<]+?)</string>', "i"), '');

          // strip empty lines
          strings = strings.replace(new RegExp('(\r\n|\n|\r)[ \t]*(\r\n|\n|\r)', "gm"), '$1');

          // replace the default value
          strings = strings.replace(new RegExp('<string name="google_app_id">([^<]+?)</string>', "i"), '<string name="google_app_id">' + json.client[0].client_info.mobilesdk_app_id + '</string>');

          // replace the default value
          strings = strings.replace(new RegExp('<string name="google_api_key">([^<]+?)</string>', "i"), '<string name="google_api_key">' + json.client[0].api_key[0].current_key + '</string>');

          fs.writeFileSync("platforms/android/res/values/strings.xml", strings);
        } catch(err) {
          logMe(err);
        }

        break;
      }
    }
  }
}