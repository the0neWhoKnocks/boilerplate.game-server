<nox-admin-users>
  <div if={ users } class="wrapper">
    <nox-pagination ref="topNav" items={ users }></nox-pagination>
    <nox-data-table ref="table" headers={ headers } items={ users }></nox-data-table>
    <nox-pagination ref="btmNav" items={ users }></nox-pagination>
  </div>
  <div if={ !users } class="loader">
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

    .wrapper {
      border-radius: 0.5em;
      border: solid 0.2em #333;
      overflow: hidden;
    }

    .loader {
      position: relative;
    }

    nox-spinner {
      right: 50%;
      font-size: 2em;
    }

    nox-data-table {
      col.col-1 {
        width: 0.5em;
      }

      col.col-2 {
        width: 0.5em;
      }

      col.col-4 {
        width: 0.5em;
      }

      col.col-5 {
        width: 1em;
      }

      td {
        &.col-status {
          color: #808080;
          background: #333;

          &.is--online {
            color: #00ff00;
            text-shadow: 0 0px 1em;
          }
        }

        &.col-verified {
          color: #808080;
          background: #333;

          &.is--verified {
            color: #51d8c6;
          }
        }

        &.col-spinner {

          nox-spinner {
            position: relative;
            right: initial;
            top: initial;
            transform: initial;
            font-size: 1em;
            vertical-align: middle;
          }
        }
      }
    }
  </style>

  <script>
    const _self = this;
    const chars = {
      OFFLINE: '⚫',
      ONLINE: '⚫',
      VERIFIED: '✔',
      NOT_VERIFIED: '✘'
    };
    let trSpinners = {};
    this.headers = [ { label: '' }, { label: '' }, { label: 'Email' }, { label: 'Role' }, { label: '' } ];
    this.users = opts.users;

    this.handleRoleChange = function(ev){
      const el = ev.currentTarget;
      const parentRow = window.utils.parentBySelector(el, '[data-row-id]');
      const newRole = Number(el.value);
      const uid = parentRow.dataset.rowId;
      const currSpinner = trSpinners[uid];

      if( uid ){
        currSpinner.show();

        RiotControl.one(window.userAPI.events.USER_UPDATED, function(){
          console.log('Update user role to:', newRole);
          currSpinner.hide();
        });
        RiotControl.one(window.userAPI.events.USER_UPDATE_ERROR, function(err){
          console.error("Error updating user role:", err);
          currSpinner.hide();
        });
        RiotControl.trigger(window.userAPI.events.USER_UPDATE, {
          data: {
            uid: uid,
            role: newRole
          }
        });
      }else{
        console.error("No UID specified for 'role' update.");
      }
    };

    function transformData(data){
      const transformed = {};

      for(let uid in data){
        const obj = {};
        const currUser = data[uid];

        for(var prop in currUser){
          let val = currUser[prop];

          switch(prop){
            case 'status' :
              val = {
                text: ( val === 'connected' ) ? chars.ONLINE : chars.OFFLINE,
                title: ( val === 'connected' ) ? 'online' : 'offline',
                modifier: ( val === 'connected' ) ? 'is--online' : 'is--offline'
              };
              break;

            case 'verified' :
              val = {
                text: ( val ) ? chars.VERIFIED : chars.NOT_VERIFIED,
                title: ( val ) ? 'verified' : 'not verified',
                modifier: ( val ) ? 'is--verified' : 'is--not-verified'
              };
              break;

            case 'role' :
              let opts = [];

              for(let roleProp in window.appData.roles){
                const roleVal = window.appData.roles[roleProp];

                opts.push({
                  selected: val == roleVal,
                  value: roleVal,
                  text: roleProp
                });
              }

              val = {
                onchange: _self.handleRoleChange,
                options: opts
              };
              break;
          }

          obj[prop] = val;
        }

        // append column at end for spinner
        obj.spinner = '';

        transformed[uid] = obj;
      }

      return transformed;
    }

    function setTableData(updatedUID){
      const pageNum = _self.refs.topNav.pageNumber;
      const itemsPerPage = _self.refs.topNav.itemsPerPage;
      const start = (pageNum - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const uids = Object.keys(_self.users);
      let currUserData = {};
      let shouldUpdate = true;

      for(let i=start; i<end; i++){
        const uid = uids[i];
        currUserData[uid] = _self.users[uid];
      }

      // if a user's info updated, but you're not on a page that contains the user, don't update.
      if( updatedUID && !currUserData[updatedUID] ) shouldUpdate = false;

      if( shouldUpdate ){
        _self.refs.table.update({
          headers: _self.headers,
          items: transformData(currUserData)
        });

        trSpinners = {};
        _self.refs.table.root.querySelectorAll('tr[data-row-id]').forEach(function(tr){
          var uid = tr.dataset.rowId;
          var spinner = document.createElement('nox-spinner');
          var td = tr.querySelector('.col-spinner');

          td.innerHTML = '';
          td.appendChild(spinner);
          trSpinners[uid] = riot.mount(`tr[data-row-id="${ uid }"] nox-spinner`)[0];
        });
      }
    }

    function handleMount(ev){
      _self.refs.loader.show();

      window.utils.request({
        url: window.appData.endpoints.v1.admin.USERS
      })
      .then(function(data){
        _self.users = data.users;
        const usersLength = Object.keys(_self.users).length;

        _self.refs.loader.hide();
        _self.update();

        _self.refs.topNav.update({
          itemsCount: usersLength
        });
        _self.refs.btmNav.update({
          itemsCount: usersLength
        });
        setTableData();

        RiotControl.on(window.paginationStore.events.PAGE_CHANGED, setTableData);

        _self.socket = io.connect();
        _self.socket.once('connect', function(){
          console.log('[ SOCKET ] Connected');

          _self.socket.on('server.playerJoined', function(currentPlayers){
            for(let uid in currentPlayers){
              console.log('[ SOCKET ] player connected', uid);
              _self.users[uid].status = 'connected';
              setTableData(uid);
            }
          });

          _self.socket.on('server.playerDisconnected', function(uid){
            console.log('[ SOCKET ] player disconnected');
            _self.users[uid].status = 'disconnected';
            setTableData(uid);
          });
        });
      });
    }

    this.on('mount', handleMount);
  </script>
</nox-admin-users>