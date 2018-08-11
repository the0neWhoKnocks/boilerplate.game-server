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
      credentials: 'include', // required so that cookies are sent
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

    return new Promise(function(resolve, reject){
      function parseContentType(header){
        if( header ){
          if( header.indexOf('application/javascript') > -1 ){
            return 'javascript';
          }else if( header.indexOf('application/json') > -1 ){
            return 'json';
          }
        }

        return '';
      }

      fetch( new Request(opts.url, reqData) )
      .then(function(resp){
        var type = parseContentType(resp.headers.get('Content-Type'));

        switch(type){
          case 'javascript' :
            resp.text()
            .then(function(respText){
              //eval.call(window, respText);

              var script = document.createElement('script');
              script.text = respText;
              document.body.appendChild(script);

              resolve();
            });
            break;

          case 'json' :
            resp.json()
            .then(function(data){
              resolve(data);
            });
            break;

          default :
            resolve(resp);
        }
      })
      .catch(function(err){
        console.error(err);
        reject(err);
      });
    });
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
    .then(successCallback)
    .catch(function(err){
      if( errorCallback ) errorCallback(err);
      window.utils.handleError(err);
    });
  },

  clone: function(obj){
    var duplicate = {};

    for(var key in obj){
      if( obj.hasOwnProperty(key) ){
        var currProp = obj[key];

        if( Array.isArray(currProp) ){
          if( !duplicate[key] ) duplicate[key] = [];
          duplicate[key] = duplicate[key].concat(currProp);
        }else if(
          !currProp
          || typeof currProp === 'boolean'
          || typeof currProp === 'function'
          || typeof currProp === 'number'
          || typeof currProp === 'string'
        ){
          duplicate[key] = currProp;
        }else{
          duplicate[key] = this.clone(currProp);
        }
      }
    }

    return duplicate;
  },

  combine: function(){
    // get objects to combine
    var items = [].slice.call(arguments);
    // the first will be the starting point
    var combined = items.shift();

    for(var i=0; i<items.length; i++){
      var currItem = items[i];

      if( Array.isArray(currItem) ){
        combined = combined.concat(currItem);
      }else{
        // create a dupe of the Object so as not to mutate the original
        var dupeItem = this.clone(currItem);

        for(var key in dupeItem){
          if( dupeItem.hasOwnProperty(key) ){
            var currProp = dupeItem[key];

            // if it doesn't exist on the original, just add it
            if( !combined[key] ){
              combined[key] = currProp;
            }else{
              if( Array.isArray(currProp) ){
                if( !combined[key] ) combined[key] = [];
                combined[key] = combined[key].concat(currProp);
              }else if(
                !currProp
                || typeof currProp === 'boolean'
                || typeof currProp === 'function'
                || typeof currProp === 'number'
                || typeof currProp === 'string'
              ){
                combined[key] = currProp;
              }else{
                combined[key] = this.combine(combined[key], currProp);
              }
            }
          }
        }
      }
    }

    return combined;
  },

  /**
   * Add a number of characters to the beginning of a value
   * @param	{String} str - What you want to add leading characters to.
   * @param	{String} [chars] - This acts as the final length of your string & what you want the leading characters to be.
   * @returns {String}
   * @example
   * // returns "001"
   * addLeading('1', '000')
   */
  addLeading: function(str, chars){
    str = (str) ? String(str) : chars;
    chars = (chars) ?  chars : 'XXXX';

    return chars.substring(chars.length-str.length, 0)+str;
  },

  getUrlParams: function(url){
    if( url && !url.split('?')[1] ){
      console.warn( "Can't get query params from - "+ url );
      return;
    }
    
    var retObj = {};
    var query = (url) ? url.split('?')[1] : window.location.search.substring(1);

    if( query != '' ){
      var params = query.split('&');

      for( var i=0; i<params.length; i++ ){
        var prop = params[i].split('=');

        if( prop[0] && prop[0] != '' ){
          retObj[prop[0]] = (prop[1]) ? decodeURIComponent( prop[1] ) : prop[1];
        }
      }
    }

    return retObj;
  },

  /**
   * Traverses an elements hierarchy until it finds an element with the
   * specified selectors.
   *
   * @param {HTMLElement} el - The element that the parent traversal will occur on.
   * @param {string} selector - A selector that's acceptable by `querySelector`.
   * @returns {HTMLElement|null}
   */
  parentBySelector: function(el, selector){
    var climbTree = true;

    if( el && selector ){
      while( climbTree ){
        el = el.parentNode;

        if( el.nodeName === 'HTML' ){
          climbTree = false;
        }else{
          var result = el.querySelector(selector);
          if( result ){
            climbTree = false;
            return result;
          }
        }
      }
    }else{
      throw new Error('Requires element & selector');
    }

    return null;
  }
};