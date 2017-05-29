<nox-data-table>
  <table>
    <colgroup>
      <col each="{ header, i in headers }" class="col-{ i+1 }">
    </colgroup>
    <thead>
      <tr>
        <th each="{ header, i in headers }" class="col-{ i+1 }">{ header.label }</th>
      </tr>
    </thead>
    <tbody ref="tbody">
      <tr each="{ item, itemName in items }" if="{ itemName && itemName != 'undefined' }" data-row-id="{ itemName }">
        <td each="{ prop, name in item }" class="col-{ name } { prop.modifier }" title="{ prop.title }">
          <select if={ prop.options } onchange="{ prop.onchange }">
            <option each="{ opt in prop.options }" value="{ opt.value }" selected="{ opt.selected }">{ opt.text }</option>
          </select>
          <virtual if={ !prop.options }>{ prop.text || prop }</virtual>
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
  </style>

  <script>
    const _self = this;
    this.headers = opts.headers || [];
    this.items = opts.items || [];

    function handleMount(ev){}

    this.on('mount', handleMount);
  </script>
</nox-data-table>