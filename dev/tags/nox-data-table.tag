<nox-data-table>
  <table>
    <colgroup>
      <col each="{ header, i in headers }" class="col-{ i+1 }">
      <col if={ controls && controls.length } class="col-{ headers.length+1 }">
    </colgroup>
    <thead>
      <tr>
        <th each="{ header, i in headers }" class="col-{ i+1 }">{ header.label }</th>
        <th if={ controls && controls.length } class="col-{ headers.length+1 }"></th>
      </tr>
    </thead>
    <tbody ref="tbody">
      <tr each="{ item, itemName in items }" if="{ itemName && itemName != 'undefined' }" data-row-id="{ itemName }">
        <td each="{ prop, propName in item }" class="col-{ propName } { prop.modifier }" title="{ prop.title }">
          <select if={ prop.options } name="{ propName }" onchange="{ prop.onchange }">
            <option each="{ opt in prop.options }" value="{ opt.value }" selected="{ opt.selected }">{ opt.text }</option>
          </select>
          <virtual if={ !prop.options && !prop.controls }>
            <virtual if={ prop.editable }>
              <input type="text" name="{ propName }" value="{ prop.text }">
            </virtual>
            <virtual if={ !prop.editable }>
              { prop.text || prop }
            </virtual>
          </virtual>
        </td>
        <td if={ controls && controls.length } class="col-controls">
          <virtual each={ control in controls }><button
              if="{ control.type === 'button' }"
              type="button"
              title="{ control.title }"
              data-row-id="{ itemName }"
              data-is-for="{ control.for }"
              onclick="{ handleControlClick }"
            >{ control.label }</button></virtual>
          <nox-spinner ref="{ itemName }-spinner" overlay="true"></nox-spinner>
        </td>
      </tr>
    </tbody>
  </table>

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

    :scope {
      display: block;
    }

    table {
      min-width: 100%;
      table-layout: fixed;
      border: solid 2px #808080;
      border-collapse: collapse;
    }

    th {
      color: #fff;
      text-align: left;
      text-transform: uppercase;
      padding: 10px;
      border: solid 1px #c0c0c0;
      background: #808080;
    }

    td {
      color: #808080;
      font-size: 18px;
      border: solid 1px #808080;
      padding: 10px;
      background: #fff;
    }

    input {
      &[type="text"] {
        width: 100%;
        padding: 0.25em;
        border: solid 1px transparent;

        &:hover,
        &:focus {
          border-color: #666;
        }

        &:hover {
          border-style: dashed;
        }

        &:focus {
          border-style: solid;
          outline: none;
        }
      }
    }
  </style>

  <script>
    const _self = this;
    let itemsCount = 0;
    this.headers = opts.headers || [];
    this.items = opts.items || [];
    this.onSave = opts.onSave || null;
    this.onDelete = opts.onDelete || null;
    this.controls = [];

    this.handleControlClick = function(ev){
      const btn = ev.currentTarget;
      const id = btn.dataset.rowId;
      const tr = window.utils.parentBySelector(btn, `tr[data-row-id="${ id }"]`);
      const data = {
        id: id,
        spinner: _self.refs[`${ id }-spinner`]
      };
      const editableEls = tr.querySelectorAll('input[type="text"], select');

      editableEls.forEach(function(el){
        switch(el.nodeName){
          case 'INPUT' :
          case 'SELECT' : data[el.name] = el.value; break;
        }
      });

      switch(btn.dataset.isFor){
        case 'delete' : _self.onDelete(data); break;
        case 'save' : _self.onSave(data); break;
      }
    };

    function addControls(item){
      let hasEditableItems = false;

      // loop over items until it verifies at least one is editable
      for(let prop in item){
        const data = item[prop];

        if( data.editable ){
          hasEditableItems = true;
          break;
        }
      }

      _self.controls = [{
        for: 'delete',
        label: 'X',
        title: 'Delete',
        type: 'button'
      }];

      if( hasEditableItems ) _self.controls = [{
        for: 'save',
        label: 'S',
        title: 'Save',
        type: 'button'
      }].concat(_self.controls);
    }

    function transformData(){
      // if any of the fields are `editable` or is a select, add a Save button
      if( Array.isArray(_self.items) ){
        if( itemsCount != _self.items.length ) itemsCount = _self.items.length;

        for(let i=0; i<_self.items.length; i++){
          const item = _self.items[i];
          addControls(item);
        }
      }else{
        if( itemsCount != Object.keys(_self.items).length ) itemsCount = Object.keys(_self.items).length;

        for(let prop in _self.items){
          const item = _self.items[prop];
          addControls(item);
        }
      }
    }

    function handlePreMount(ev){
      transformData();
    }

    function handleUpdate(ev){
      transformData();
    }

    this.on('before-mount', handlePreMount);
    this.on('update', handleUpdate);
  </script>
</nox-data-table>