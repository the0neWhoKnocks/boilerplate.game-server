<nox-modal>
  <div
    if={ modalIsOpen }
    id={ args.id }
    class={has--close-disabled:args.closeDisabled}
  >
    <div
      class="modal-mask" 
      title={ 'Click to close':!args.closeDisabled }
      onclick={ !args.closeDisabled ? closeModal : null }
    ></div>
    <div 
      if={ modalIsOpen }
      class="modal"
    >
      <nav
        if={ !args.closeDisabled && args.hasNav }
        class="modal__top-nav"
      >
        <button 
          type="button" 
          title="Close"
          onclick={ closeModal }
        >X</button>
      </nav>
      <div 
        class="modal__body"
        ref="modalBody"
      ><yield/></div>
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
    
    button {
      cursor: pointer;
    }

    .modal {
      width: 12em;
      padding: 1.5em 1em 1em;
      border: solid 1px #666;
      border-radius: 0.5em;
      box-shadow: 0px 8px 20px 2px rgba(0,0,0,0.05);
      background: #fff;
      display: inline-block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      
      &-mask {
        background: rgba(0,0,0,0.25);
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 10;
        
        .has--close-disabled & {
          cursor: default;
        }
      }
      
      &__top-nav {
        text-align: right;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        
        button {
          border: none;
          background: transparent;
        }
      }
      
      .has--close-disabled & {
        padding-top: 1em;
      }
    }
  </style>
  
  <script>
    const _self = this;
    
    this.events = {
      CLICK: 'click'
    };
    this.args = {
      closeDisabled: opts.closeDisabled || false,
      hasNav: opts.hasNav || true,
      id: opts.id || null
    };
    this.modalIsOpen = false;
    
    this.handleMount = function(ev){};
    
    this.openModal = function(ev){
      this.modalIsOpen = true;
      this.update();
    };
    
    this.closeModal = function(ev){
      this.modalIsOpen = false;
      this.update();
    };
    
    this.setBody = function(content){
      this.refs.modalBody.innerHTML = content;
    };
    
    this.on('mount', this.handleMount);
  </script>
</nox-modal>