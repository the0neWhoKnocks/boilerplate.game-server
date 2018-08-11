<nox-admin-users>
  <div if={ users } class="wrapper">
    <nox-pagination ref="topNav"></nox-pagination>
    <nox-data-table ref="table"></nox-data-table>
    <nox-pagination ref="btmNav"></nox-pagination>
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

    > .wrapper {
      border-radius: 0.5em;
      border: solid 0.2em #333;
      overflow: hidden;
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
        width: 4.5em;
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

        &.col-controls {
          text-align: center;
          position: relative;

          button {
            cursor: pointer;
          }

          nox-spinner {
            .wrapper {
              background: #fff;
            }
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
    this.headers = [ { label: '' }, { label: '' }, { label: 'Email' }, { label: 'Role' } ];
    this.users = opts.users;

    function handleSaveClick(data){
      const oldData = _self.users[data.id];
      let updatedData;

      // check if data was updated before hitting the server
      for(let prop in oldData){
        if( data[prop] && data[prop] != oldData[prop] ){
          if( !updatedData ) updatedData = {};
          updatedData[prop] = data[prop];
        }
      }

      if( updatedData ){
        updatedData.uid = data.id;

        data.spinner.show();

        RiotControl.one(window.userAPI.events.USER_UPDATED, function(){
          delete updatedData.uid;

          // update old data so future checks are valid.
          for(let prop in updatedData){
            oldData[prop] = updatedData[prop];
          }

          console.log('Update user data:', updatedData);
          data.spinner.hide();
        });
        RiotControl.one(window.userAPI.events.USER_UPDATE_ERROR, function(err){
          console.error("Error updating user role:", err);
          data.spinner.hide();
        });
        RiotControl.trigger(window.userAPI.events.USER_UPDATE, {
          data: updatedData
        });
      }else{
        console.warn("[ ADMIN ] Data hasn't changed, skipping update.");
      }
    }

    function handleDeleteClick(data){

    }

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
                modifier: ( val === 'connected' ) ? 'is--online' : 'is--offline',
                text: ( val === 'connected' ) ? chars.ONLINE : chars.OFFLINE,
                title: ( val === 'connected' ) ? 'online' : 'offline'
              };
              break;

            case 'verified' :
              val = {
                modifier: ( val ) ? 'is--verified' : 'is--not-verified',
                text: ( val ) ? chars.VERIFIED : chars.NOT_VERIFIED,
                title: ( val ) ? 'verified' : 'not verified'
              };
              break;

            case 'email' :
              val = {
                text: val
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
                editable: true,
                options: opts
              };
              break;
          }

          obj[prop] = val;
        }

        transformed[uid] = obj;
      }

      return transformed;
    }

    function setTableData(updatedUID){
      const uids = Object.keys(_self.users);
      const pageNum = _self.refs.topNav.pageNumber;
      const itemsPerPage = _self.refs.topNav.itemsPerPage;
      const start = (pageNum - 1) * itemsPerPage;
      const end = ( uids.length < itemsPerPage ) ? uids.length : start + itemsPerPage;
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
          items: transformData(currUserData),
          onSave: handleSaveClick,
          onDelete: handleDeleteClick
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