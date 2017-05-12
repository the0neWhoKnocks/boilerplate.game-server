window.utils = {
  buildQueryFromForm: function(form){
    var field, l, s = [];
    
    if(
      typeof form == 'object' 
      && form.nodeName == "FORM"
    ){
      var len = form.elements.length;
      
      for (var i=0; i<len; i++) {
        field = form.elements[i];
        
        if(
          !field.disabled
          && field.name 
          && field.type != 'file' 
          && field.type != 'reset' 
          && field.type != 'submit' 
          && field.type != 'button'
        ){
          if(field.type == 'select-multiple'){
            l = form.elements[i].options.length;
            
            for(var j=0; j<l; j++){
              if(field.options[j].selected){
                s[s.length] = field.name +'='+ field.options[j].value;
              }
            }
          }else if( field.type === 'textarea' ){
            s[s.length] = field.name +'='+ encodeURIComponent( field.value.replace(/\t|\n/g, '') );
          }else if((field.type != 'checkbox' && field.type != 'radio') || field.checked){
            s[s.length] = field.name +'='+ field.value;
          }
        }
      }
    }
    
    return s.join('&');
  },

  buildQueryFromObject: function(data){
    var query = [];

    for( var key in data ){
      var curr = data[key];

      if( Array.isArray(curr) ){
        var currArr = [];

        for(var i=0; i<curr.length; i++){
          currArr.push( key +'['+ i +']='+ encodeURIComponent(curr[i]) );
        }

        query.push( currArr );
      }else if( typeof curr === 'string' ){
        query.push( key +'='+ encodeURIComponent(curr) );
      }
    }

    return query.join('&');
  },
  
  formToJSON: function(form, returnString){
    var data = {};
    
    [].forEach.call(form.elements, function(el){
      if( 
        el
        && !el.disabled
        && el.name
        && el.value
        && el.type != 'file' 
        && el.type != 'reset' 
        && el.type != 'submit' 
        && el.type != 'button'
      ){
        switch(el.type){
          case 'checkbox' :
            if( el.checked ) data[el.name] = el.value;
            break;

          default :
            data[el.name] = el.value;
        }
      }
    });
    
    return ( returnString ) ? JSON.stringify(data) : data;
  },
  
  transformResp: function(resp){
    switch( resp.status ){
      case 200 :
        return resp.json();
        break;
      
      default :
        return new Promise(function(resolve, reject){
          resp.json().then(function(data){
            reject({
              msg: data.error,
              status: resp.status
            });
          });
        });
    }
  },
  
  handleError: function(err){
    console.error(err.message);
  },
  
  handleSubmit: function(ev, successCallback){
    ev.preventDefault();
    var form = ev.currentTarget;
    var submitBtn = form.querySelector('button'); // works only if there is one submit button

    submitBtn.disabled = true;

    window.utils.submitForm(form, successCallback, function(){
      submitBtn.disabled = false;
    });
  },

  request: function(opts){
    var reqData = {
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }),
      method: (opts.method) ? opts.method.toUpperCase() : 'GET'
    };

    if( !opts.url || opts.url === '' ) throw new Error('`url` not set');

    switch(reqData.method){
      case 'POST' :
      case 'PUT' :
        reqData.body = ( opts.data.nodeName && opts.data.nodeName === 'FORM' )
          ? window.utils.formToJSON(opts.data, true)
          : JSON.stringify(opts.data);
        break;

      case 'GET' :
        if( opts.data ) opts.url += '?'+ window.utils.buildQueryFromObject(opts.data);
        break;
    }

    return fetch( new Request(opts.url, reqData) );
  },

  submitForm: function(form, successCallback, errorCallback){
    var req = new Request(form.action, {
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }),
      method: form.method,
      body: window.utils.formToJSON(form, true)
    });

    fetch(req)
    .then(window.utils.transformResp)
    .then(successCallback)
    .catch(function(err){
      if( errorCallback ) errorCallback(err);
      window.utils.handleError(err);
    });
  }
};