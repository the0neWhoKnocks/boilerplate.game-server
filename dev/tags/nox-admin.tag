<nox-admin>
  <nox-top-nav user-data={ userData }></nox-top-nav>
  <div class="bodyContainer">
    <nox-vertical-nav ref="sideNav" nav-items={ navItems } disable-on-select="true"></nox-vertical-nav>
    <div if={ currentView } class="section-container">
      <h2>{ currentView.sectionTitle }</h2>
      <div ref="currView" data-is={ currentView.tagName }></div>
    </div>
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

    .bodyContainer {
      height: calc(100% - 1.75em);
      display: flex;
      flex-direction: row;
    }

    nox-top-nav {
      nav {
        box-shadow: 0 0 1em 0.1em rgba(0,0,0,0.75);
      }
    }

    nox-vertical-nav {
      flex-basis: 230px;
      flex-shrink: 0;

      nav {
        padding-top: 0.5em;
      }

      .nav-item {
        font-size: 1.2em;
        text-align: left;
      }
    }

    nox-vertical-nav,
    .section-container {
      display: flex;
      flex-direction: column;
    }

    .section-container {
      overflow: scroll;
      padding: 1em;
      flex: 1;
    }
  </style>

  <script>
    const _self = this;
    const sections = {
      LOCALIZATION: {
        tagName: 'nox-admin-localization',
        sectionTitle: 'Localization',
        url: 'localization'
      },
      USER: {
        tagName: 'nox-admin-users',
        sectionTitle: 'Users',
        url: 'users'
      }
    };
    this.triggeredOnMount = false;
    this.userData = opts.userData || null;
    this.navItems = [
      {
        type: 'button',
        label: 'Localization',
        id: sections.LOCALIZATION.url,
        action: mountSection.bind(_self, sections.LOCALIZATION.url)
      },
      {
        type: 'button',
        label: 'Users',
        id: sections.USER.url,
        action: mountSection.bind(_self, sections.USER.url)
      }
    ];
    this.currentView = undefined;

    function mountSection(pageURL){
      for(let prop in sections){
        if( sections[prop].url === pageURL ){
          _self.currentView = sections[prop];
          break;
        }
      }

      if( _self.currentView ){
        if( !_self.triggeredOnMount ){
          window.history.pushState('', document.title, `${ window.appData.urls.ADMIN }/${ _self.currentView.url }`);
        }else{
          _self.triggeredOnMount = false;
        }

        _self.update();
      }
    }

    function handleMount(ev){
      if( window.appData.page ){
        const sectionBtn = _self.refs.sideNav.root.querySelector(`[data-id="${ window.appData.page }"]`);
        if( sectionBtn ){
          _self.triggeredOnMount = true;
          sectionBtn.click();
        }
      }
    }

    this.on('mount', handleMount);
  </script>
</nox-admin>