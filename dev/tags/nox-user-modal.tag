<nox-user-modal>
  <nox-modal ref="userModal" close-disabled="true">
    <form
      if={ !parent.showVerificationMessage }
      ref="userForm"
      action=""
      method="POST"
      onsubmit={ parent.handleSubmit }
    >
      <label class="is--required">
        Email
        <input
          type="email"
          name="email"
          oninput={ parent.handleInput }
          required
          autofocus
        >
      </label>
      <label class="is--required">
        Password
        <input
          type="password"
          name="password"
          oninput={ parent.handleInput }
          required
        >
      </label>
      <label>
        <input ref="alwaysIn" type="checkbox" name="alwaysIn" value="true"> Stay signed in.
      </label>
      <button
        type="submit"
        value="signin"
        class="sign-in-btn { is--processing:(parent.processing === parent.processingTypes.SIGN_IN) }"
        onclick={ parent.handleSignIn }
        disabled={ parent.submitDisabled }
      >Sign In</button>
      <div class="separator-title" data-text="Or">Or</div>
      <button
        type="button"
        value="create"
        class={ is--processing:(parent.processing === parent.processingTypes.CREATE) }
        onclick={ parent.handleCreate }
        disabled={ parent.submitDisabled }
      >Create an Account</button>
    </form>
    <div if={ parent.showVerificationMessage }>
      A verification email was sent to the email address you provided. Once validated, you'll be able to sign in.
      <button
        onclick={ parent.closeVerification }
      >Sign In</button>
    </div>
  </nox-modal>
  
  <style scoped>
    :scope,
    input,
    button, 
    *::after, 
    *::before {
      font: 20px Helvetica, Arial, sans-serif;
    }
    
    :scope {

    }
    
    label {
      margin-top: 0.5em;
      display: block;

      > input {
        margin-top: 0.5em;
      }

      &.is--required::before {
        content: '*';
        color: #ffa500;
      }
    }
    
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 0.25em;
      border: solid 1px #ccc;
    }
    
    .modal {
      width: 18em;

      &__body button {
        width: 100%;
        padding: 0.5em 1em;
        border: solid 1px #808080;
        border-radius: 0.25em;;
        margin-top: 1em;
        background: #eee;
        transition: 0.25s opacity;

        &[disabled]{
          opacity: 0.5;
          cursor: default;
        }
      }
    }

    .separator-title {
      font-size: 0;
      text-align: center;
      position: relative;
      
      &::before {
        content: '';
        height: 0.1em;
        background: #ccc;
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        z-index: -1;
      }
      
      &::after {
        content: attr(data-text);
        padding: 0 0.5em;
        background: #fff;
        display: inline-block;
      }
    }

    .sign-in-btn {
      margin-bottom: 1em;
    }

    .is--processing {
      position: relative;

      &::after {
        content: '';
        width: 1em;
        height: 1em;
        border: dotted 0.15em;
        border-radius: 100%;
        position: absolute;
        top: 50%;
        right: 0.25em;
        transform: translate(-50%, -50%);
        animation: spin 3s linear infinite;
      }
    }

    @keyframes spin {
      0% {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      100% {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  </style>
  
  <script>
    const _self = this;

    this.cssModifiers = {};
    this.events = {};
    this.args = {
      userAPI: opts.userAPI || {},
      onSignIn: opts.onSignIn || null,
      onError: opts.onError || null
    };
    this.submitDisabled = true;
    this.processing = false;
    this.processingTypes = {
      SIGN_IN: 'signIn',
      CREATE: 'create'
    };
    this.showVerificationMessage = false;
    
    this.handleMount = function(ev){};

    this.open = function(){
      _self.refs.userModal.openModal();
    };

    this.close = function(){
      _self.refs.userModal.closeModal();
    };

    this.closeVerification = function(){
      _self.showVerificationMessage = false;
      _self.refs.userModal.update();
    };

    this.handleFormSuccess = function(data){
      if( _self.processing === _self.processingTypes.CREATE ){
        _self.showVerificationMessage = true;
      }

      if( _self.processing === _self.processingTypes.SIGN_IN ){
        if( _self.args.onSignIn ) _self.args.onSignIn(data);
      }

      // if the user hasn't been verified, the data will be null
      _self.submitDisabled = !(!data && _self.processing === _self.processingTypes.SIGN_IN);
      _self.processing = false;
      _self.refs.userModal.refs.alwaysIn.checked = false;
      _self.refs.userModal.update();

      if( data && !_self.showVerificationMessage ) _self.refs.userModal.closeModal();
    };

    this.handleFormError = function(err){
      if( _self.args.onError ) _self.args.onError(err);

      _self.submitDisabled = false;
      _self.processing = false;
      _self.refs.userModal.update();
    };

    this.handleInput = function(ev){
      var input = ev.currentTarget;
      var form = input.form;
      var requiredInputs = form.querySelectorAll('[required]');
      var allFilled = true;

      for(var i=0; i<requiredInputs.length; i++){
        var curr = requiredInputs[i];

        if( curr.value === '' ){
          allFilled = false;
          break;
        }
      }

      if( _self.submitDisabled && allFilled ){
        _self.submitDisabled = false;
        _self.refs.userModal.update();
      }else if( !_self.submitDisabled && !allFilled ){
        _self.submitDisabled = true;
        _self.refs.userModal.update();
      }

      return true; // needed so user can perform normal text actions
    };

    this.handleSubmit = function(ev){
      ev.preventDefault();
      _self.handleSignIn(ev);
    };

    this.handleSignIn = function(ev){
      _self.submitDisabled = true;
      _self.processing = _self.processingTypes.SIGN_IN;
      _self.refs.userModal.update();

      var form = _self.refs.userModal.refs.userForm;
      _self.args.userAPI
      .signIn( window.utils.formToJSON(form) )
      .then(_self.handleFormSuccess)
      .catch(_self.handleFormError);
    };

    this.handleCreate = function(ev){
      _self.submitDisabled = true;
      _self.processing = _self.processingTypes.CREATE;
      _self.refs.userModal.update();

      var form = _self.refs.userModal.refs.userForm;
      _self.args.userAPI
      .create( window.utils.formToJSON(form) )
      .then(_self.handleFormSuccess)
      .catch(_self.handleFormError);
    };
    
    this.on('mount', this.handleMount);
  </script>
</nox-user-modal>