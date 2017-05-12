function browserSyncScript(dev){
  if( !dev ) return '';
  
  return `
    <script id="__bs_script__">
      document.write("<script async src='http://HOST:8082/browser-sync/browser-sync-client.js?v=2.18.7'><\\/script>".replace("HOST", location.hostname) );
    </script>
  `;
}

function addStyles(arr){
  var styles = '';
  
  if( arr && arr.length ){
    for(var i=0; i<arr.length; i++){
      styles += `<link rel="stylesheet" type="text/css" href="${ arr[i] }">`;
    }
  }
  
  return styles;
}

function addScripts(arr){
  var scripts = '';
  
  if( arr && arr.length ){
    for(var i=0; i<arr.length; i++){
      scripts += `<script language="javascript" type="text/javascript" src="${ arr[i] }"></script>`;
    }
  }
  
  return scripts;
}

function addIf(val){
  return ( val ) ? val : '';
}

module.exports = function(model){
  return `
    <!DOCTYPE html>
    <html lang="en-US">
      <head>
        <title>${ model.title }</title>
        <link rel="shortcut icon" type="image/png" href="/imgs/favicon.png">
        ${ addStyles(model.styles) }
        <script>
          window.appData = ${ JSON.stringify(model.appData) };
        </script>
        <script language="javascript" type="text/javascript" src="/js/vendor/riot.min.js"></script>
        <script language="javascript" type="text/javascript" src="/js/vendor/riotcontrol.js"></script>
        <script language="javascript" type="text/javascript" src="${ model.appData.endpoints.v1.CONCAT_TAGS }"></script>
        ${ addScripts(model.scripts.head) }
      </head>
      <body class="${ model.viewName }">
        ${ addIf( model.body ) }
        ${ browserSyncScript(model.dev) }
        ${ addScripts(model.scripts.body) }
      </body>
    </html>
  `;
};