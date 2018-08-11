<nox-admin-localization>
  <div if={ localization } class="wrapper">
    <raw content="{ renderMarkup2(localization) }"></raw>
  </div>
  <div if={ !localization } class="loader">
    <nox-spinner ref="loader"></nox-spinner>
  </div>

  <style scoped>
    :scope,
    input,
    button,
    *::after,
    *::before {
      font: 20px Helvetica, Arial, sans-serif;
    }

    :scope * {
      box-sizing: border-box;
    }

    > .loader {
      position: relative;

      nox-spinner {

        .wrapper {
          font-size: 2em;
          right: 50%;
          transform: translateY(50%);
        }
      }
    }

    > .wrapper {
      ul {
        font-family: monospace;
        list-style-type: none;
      }

      > ul {
        padding: 0;
      }
    }

    .prop-child,
    .prop-parent {
      > label {
        text-transform: none;
      }
    }

    .prop-parent {
      > label {
        background: #fff;
      }

      + .menu__items {
        box-shadow: inset 0 8px 2em;
        padding: 0.2em 0.5em;
        background: linear-gradient(to bottom, #888, #eee);
      }
    }

    .prop-child {
      box-shadow: 0 5px 0.5em 2px rgba(0,0,0,0.4);
    }

    .prop,
    .val {
      vertical-align: top;
      display: inline-block;
    }

    .prop {
      color: #d3ff54;
      font-weight: bold;
      text-shadow: 0 3px 2px #000;
      letter-spacing: 0.05em;
      padding: 0.25em 0.5em;
      border-radius: 0.4em 1em 0 0;
      background: #333;
      display: flex;
      flex-direction: row;

      > .menu__plus-minus {
        color: #eee;
      }
    }

    .val-lang {
      border: solid 1px #333;
      background: #fff;
      display: flex;
      flex-direction: row;
    }

    .lang,
    .val {
      padding: 0.15em 0.5em;
      vertical-align: top;
      display: flex;
      flex-direction: column;
    }

    .lang {
      background: #eee;
      flex-basis: 2.25em;
      flex-shrink: 0;
    }

    .val {
      flex: 1;
    }
  </style>

  <script>
    const _self = this;
    let _menus = {};
    let updatedKeys = [];
    this.localization = undefined;

    this.renderMarkup = function(data){
      function loop(data){
        var markup = '';

        for(var prop in data){
          var curr = data[prop];
          var children = '';
          var nested = false;

          // if current is an Object and it's first child is a prop:string val, then there are no subs
          if( typeof curr !== 'string' ){
            var childKeys = Object.keys(curr);

            if( typeof curr[childKeys[0]] === 'string' ){
              var langVals = '';

              for(var lang in curr){
                langVals += `<span class="val-lang"><span class="lang">${ lang }</span><span class="val">${ curr[lang] }</span></span>`;
              }

              children += `<li class="prop-child"><span class="prop">${ prop }</span>${ langVals }</li>`;
            }else{
              nested = true;
              children += `<li class="prop-parent"><button type="button">${ prop }</button><div>${ loop(curr) }</div></li>`;
            }
          }

          markup += `<ul class="localizations" data-prop="${ prop }">${ children }</ul>`;
        }

        return markup;
      }

      return loop(data);
    };

    this.renderMarkup2 = function(data){
      function loop(data, parProp){
        var markup = '';

        for(var prop in data){
          var curr = data[prop];
          var children = '';
          var nested = false;
          var ref = ( parProp ) ? `${ parProp }-${ prop }` : prop;

          // if current is an Object and it's first child is a prop:string val, then there are no subs
          if( typeof curr !== 'string' ){
            var childKeys = Object.keys(curr);

            if( typeof curr[childKeys[0]] === 'string' ){
              var langVals = [];

              for(var lang in curr){
                langVals.push({
                  raw: `<span class="val-lang"><span class="lang">${ lang }</span><textarea class="val">${ curr[lang] }</textarea></span>`
                });
              }

              _menus[ref] = {
                label: prop,
                children: langVals
              };
              children += `<nox-accordion-menu id="${ ref }"></nox-accordion-menu>`;
            }else{
              nested = true;
              _menus[ref] = curr;

              children += `<nox-accordion-menu id="${ ref }">${ loop(curr, ref) }</nox-accordion-menu>`;
            }
          }

          markup += `<div class="localizations">${ children }</div>`;
        }

        return markup;
      }

      return loop(data);
    };

    function transformData(data){
      var formatted = {};

      function getChildData(obj, lang, childData){
        for(var prop in childData){
          var childVal = childData[prop];
          if( !obj[prop] ) obj[prop] = {};

          if( typeof childVal === 'string' ){
            obj[prop][lang] = childVal;
          }else{
            getChildData(obj[prop], lang, childVal);
          }
        }
      }

      for(var lang in data){
        var child = data[lang];
        getChildData(formatted, lang, child);
      }

      return formatted;
    }

    function handleMount(ev){
      _self.refs.loader.show();

      window.utils.request({
        url: window.appData.endpoints.v1.admin.LOCALIZATION
      })
      .then(function(data){
        _self.refs.loader.hide();

        _self.update({
          localization: transformData(data.localization)
        });
      })
      .catch(function(err){
        console.error(err);
      });
    }

    function handleUpdate(data){
      updatedKeys = Object.keys(data);
    }

    function handleUpdated(){
      if( updatedKeys.indexOf('localization') > -1 ){
        var menus = _self.root.querySelectorAll('nox-accordion-menu');

        menus.forEach(function(el){
          var menuCtx = _menus[el.id];

          if( menuCtx.label ){
            riot.mount(`nox-accordion-menu#${ el.id }`, {
              items: [menuCtx],
              btnClass: 'prop-child',
              labelClass: 'prop'
            });
          }else{
            riot.mount(`nox-accordion-menu#${ el.id }`, {
              items: [{
                label: el.id.split('-').pop(),
                children: [{
                  raw: el.innerHTML
                }]
              }],
              btnClass: 'prop-parent'
            });
          }
        });
      }
    }

    this.on('mount', handleMount);
    this.on('update', handleUpdate);
    this.on('updated', handleUpdated);
  </script>
</nox-admin-localization>