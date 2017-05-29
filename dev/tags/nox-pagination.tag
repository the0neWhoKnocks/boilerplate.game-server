<nox-pagination>
  <nav if={ itemsCount }>
    <button
      type="button"
      class="page-btn is--newer"
      onclick={ handlePageChange }
    >&lt;</button>
    <span class="page-btns">
      <virtual if={ firstPage }>
        <button
          type="button"
          class="page-btn is--first"
          onclick={ handlePageChange }
        >{ firstPage }</button>
        <span class="ellipsis"> ... </span>
      </virtual>
      <button
        each={ pageBtn in pageBtns }
        type="button"
        class="page-btn { is--start:pageBtn.start } { is--end:pageBtn.end } { is--current:pageBtn.current }"
        onclick={ handlePageChange }
      >{ pageBtn.btnText }</button>
      <virtual if={ lastPage }>
        <span class="ellipsis"> ... </span>
        <button
          type="button"
          class="page-btn is--last"
          onclick={ handlePageChange }
        >{ lastPage }</button>
      </virtual>
    </span>
    <select if={ selectBtns } onchange={ handlePageChange }>
      <option
        each={ option in selectBtns }
        value={ option.btnText } selected={ selected:option.current }
      >{ option.formattedBtnText }</option>
    </select>
    <button
      type="button"
      class="page-btn is--older"
      onclick={ handlePageChange }
    >&gt;</button>
  </nav>

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

    nav {
      text-align: center;
      border: solid 2px #808080;
      background: #c0c0c0;
      display: block;
      overflow: hidden;
      position: relative;

      &.is--top {
        border-bottom: none;
        border-top-right-radius: 15px;
        border-top-left-radius: 15px;
      }

      &.is--btm {
        border-top: none;
        border-bottom-right-radius: 15px;
        border-bottom-left-radius: 15px;
      }
    }

    .page-btns {
      display: block;
    }

    .page-btn,
    .ellipsis {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      display: inline-block;
      vertical-align: top;
    }

    .ellipsis {
      color: #666;
      padding: 5px;
      background: #aaa;
    }

    .page-btn {
      border: 1px #808080;
      border-style: none solid;
      padding: 5px 10px;
      background: #c0c0c0;
      cursor: pointer;

      &:hover {
        background: #eee;
      }

      &.is--newer,
      &.is--older {
        padding: 5px 12px;
        position: absolute;
        top: 0;
      }

      &.is--newer {
        border-left: none;
        border-right-width: 2px;
        left: 0;
      }

      &.is--older {
        border-right: none;
        border-left-width: 2px;
        right: 0;
      }

      &.is--start,
      &.is--first {
        border-left-width: 2px;
      }

      &.is--end,
      &.is--last {
        border-right-width: 2px;
      }

      &.is--first {
        border-right-color: #ddd;
      }

      &.is--last {
        border-left-color: #ddd;
      }

      &.is--current {
        color: #c0c0c0;
        background: #808080;
        cursor: default;
      }
    }

    select,
    option {
      font-size: 14px;
      font-weight: bold;
    }

    select {
      padding: 0 5px;
      position: absolute;
      top: 2px;
      right: 38px;
    }

    option {
      text-align: left;
      margin: 4px 6px;
    }
  </style>

  <script>
    if( !window.paginationStore ){
      window.paginationStore = new PaginationStore();
      RiotControl.addStore( window.paginationStore );
    }

    const _self = this;
    this.itemsCount = opts.items || 0;
    this.itemsPerPage = opts.itemsPerPage || 10;
    this.maxPageBtns = opts.maxPageBtns || 10;
    this.pageNumber = window.paginationStore.pageNum || 1;
    this.navOffset = Math.ceil(this.maxPageBtns / 2);

    this.handlePageChange = function(ev){
      var btn = ev.currentTarget;
      var pageNum = ( btn.nodeName === 'SELECT' )
        ? btn.value
        : btn.innerText;

      if( pageNum != _self.pageNumber ){
        switch( pageNum ){
          case '<' :
            _self.pageNumber = (_self.pageNumber > 1)
              ? _self.pageNumber - 1
              : _self.totalPages;
            break;

          case '>' :
            _self.pageNumber = (_self.pageNumber < _self.totalPages)
              ? _self.pageNumber + 1
              : 1;
            break;

          default :
            _self.pageNumber = Number(pageNum);
        }

        RiotControl.trigger(window.paginationStore.events.PAGE_CHANGE, _self.pageNumber);
      }
    };

    function setupNav(){
      _self.pageBtns = [];
      _self.selectBtns = [];
      _self.firstPage = _self.lastPage= null;
      _self.totalPages = Math.ceil(_self.itemsCount / _self.itemsPerPage);

      // if there's only one page, there'll be no need for a nav.
      if( _self.totalPages > 1 ){
        let offset = ( _self.pageNumber > _self.navOffset )
          ? _self.pageNumber - _self.navOffset
          : 0;

        // if the offset will make the number of buttons less than the maxPageBtns, determine what needs to be added back
        if(
          (_self.totalPages - offset) < _self.maxPageBtns
          && _self.totalPages > _self.maxPageBtns
        ){
          const diff = _self.totalPages - offset;
          offset -= _self.maxPageBtns - diff;
        }

        let count = 0;
        const currPageNumber = _self.pageNumber - 1;
        const maxPageBtnIndex = offset + (_self.maxPageBtns - 1);
        let i;

        // Page buttons
        for( i=offset; i<_self.totalPages; i++ ){
          const btnModel = {
            // determine the classes for buttons
            start   : i == offset,
            end     : i == maxPageBtnIndex,
            current : currPageNumber === i,
            // button text
            btnText : i+1
          };

          // give a link to the first page if it's not listed
          if( count == 0 && i != 0 ) _self.firstPage = 1;

          // limit the number of page buttons and display a link to the last page
          if(
            count == _self.maxPageBtns - 1
            && i != _self.totalPages - 1
          ){
            i = _self.totalPages;
            _self.lastPage = i;
          }

          _self.pageBtns.push( btnModel );
          count++;
        }

        // Select input options
        for( i=1; i<_self.totalPages+1; i++ ){
          var btnModel = {
            // determine the classes for buttons
            current : currPageNumber === i-1,
            // button text
            formattedBtnText : window.utils.addLeading(i, '000'),
            btnText : i
          };

          _self.selectBtns.push( btnModel );
        }
      }
    }

    function handlePageChanged(pageNum){
      // only update if data doesn't match (happens if there's more than one
      // pagination instance on a page
      if( _self.pageNumber != pageNum ){
        _self.pageNumber = pageNum;
        _self.update();
      }
    }

    function handleMount(ev){
      setupNav();
      RiotControl.on(window.paginationStore.events.PAGE_CHANGED, handlePageChanged);
    }

    function handleUnMount(ev){
      RiotControl.off(window.paginationStore.events.PAGE_CHANGED, handlePageChanged);
    }

    this.on('mount', handleMount);
    this.on('unmount', handleUnMount);
    this.on('update', setupNav);

    // =========================================================================

    function PaginationStore(){
      riot.observable(this);

      const _self = this;
      const params = window.utils.getUrlParams();

      _self.events = {
        PAGE_CHANGE: 'page.change',
        PAGE_CHANGED: 'page.changed'
      };
      _self.queryParam = 'page';
      _self.pageNum = Number(params[_self.queryParam]) || 1;

      _self.on(_self.events.PAGE_CHANGE, function(pageNum){
        _self.pageNum = pageNum;
        window.history.pushState('', document.title, `${ location.pathname }?${ _self.queryParam }=${ pageNum }`);
        _self.trigger(_self.events.PAGE_CHANGED, pageNum);
      });
    }
  </script>
</nox-pagination>