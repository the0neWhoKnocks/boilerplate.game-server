<nox-steps>
  <div 
    if={ isVisible }
    id={ args.id }
    class={ 'steps'+ args.isFor }
  >
    <div 
      class="steps__container"
      style="animation-duration:{ args.animationDuration }s"
      ref="stepsContainer"
    >
      <div class="steps__items">
        <div 
          each={ step, ndx in args.steps }
          class={`steps__step step${ this.ndx+1 }${ ( this.ndx === this.parent.currStep ) ? ' is--current' : ''}`}
          ref={`step${this.ndx+1}`}
        >
          <h3 class="steps__title">{ ( step.title ) ? step.title : `Step #${ this.ndx+1 }` }</h3>
          <div class="steps__body">
            <raw content="{ step.body }"/>
          </div>
        </div>
      </div>
      <nav
        if={ args.steps.length > 1 }
        class="steps__btm-nav"
      >
        <button 
          ref="prevStepBtn"
          type="button" 
          title="Previous Step"
          class="steps__btm-nav-btn"
          disabled={ currStep === 0 }
          onclick={ handlePrevClick }
        >Prev</button><button 
          ref="nextStepBtn"
          type="button" 
          title="Next Step"
          class="steps__btm-nav-btn"
          disabled={ currStep === args.steps.length - 1 }
          onclick={ handleNextClick }
        >Next</button>
      </nav>
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
    
    :scope {
      width: 100%;
      height: 100%;
      text-align: center;
      display: table;
    }
    
    button {
      cursor: pointer;
    }

    .steps {
      vertical-align: middle;
      display: table-cell;
      perspective: 1000px;
      
      &__container {
        min-width: 12em;
        text-align: left;
        border: solid 1px #666;
        border-radius: 0.5em;
        box-shadow: 0px 8px 20px 2px rgba(0,0,0,0.05);
        background: #fff;
        display: inline-block;
        transition: 0.3s;
        transform-style: preserve-3d;
        transform: rotateY(0deg);
        backface-visibility: hidden;
        overflow: hidden;
        
        &.is--flipping-left {
          animation: flipLeft;
        }
        
        &.is--flipping-right {
          animation: flipRight;
        }
      }
      
      &__step {
        display: none;
        
        &.is--current {
          display: block;
        }
      }
      
      &__title {
        padding: 0.5em;
        margin: 0;
        border-bottom: solid 1px #666;
      }
      
      &__body {
        padding: 1em;
      }
      
      &__btm-nav {
        text-align: center;
        padding: 0.5em 1em;
        border-top: solid 1px #666;
        
        button {
          
          &:disabled {
            cursor: default;
          }
        }
      }
    }
    
    @keyframes flipLeft {
      0% {
        transform: rotateY(0deg);
      }
      49% {
        transform: rotateY(-90deg);
      }
      50% {
        transform: rotateY(90deg);
      }
      100% {
        transform: rotateY(0deg);
      }
    }
    
    @keyframes flipRight {
      0% {
        transform: rotateY(0deg);
      }
      49% {
        transform: rotateY(90deg);
      }
      50% {
        transform: rotateY(-90deg);
      }
      100% {
        transform: rotateY(0deg);
      }
    }
  </style>
  
  <script>
    const _self = this;
    
    this.cssModifiers = {
      IS_FLIPPING_LEFT: 'is--flipping-left',
      IS_FLIPPING_RIGHT: 'is--flipping-right'
    };
    this.events = {
      CLICK: 'click',
      ANIMATION_END: 'animationend',
      ANIMATION_START: 'animationstart'
    };
    this.args = {
      id: opts.id || null,
      isFor: ` for--${opts.isFor}` || '',
      steps: opts.steps || [],
      animationDuration: opts.animationDuration || 0.25
    };
    this.isVisible = false;
    this.currStep = 0;
    
    if( opts.displayStep ){
      for( var i=0; i<opts.steps.length; i++ ){
        var currStep = opts.steps[i];
        
        if( currStep.id && currStep.id === opts.displayStep ){
          this.currStep = i;
          break;
        }
      }
    }
    
    this.handleMount = function(ev){
      if( this.opts.open ) this.display();
    };
    
    this.display = function(ev){
      this.isVisible = true;
      this.update();
      
      if( this.args.steps[this.currStep].onShow ){
        this.args.steps[this.currStep].onShow();
      }
    };
    
    this.hide = function(ev){
      this.isVisible = false;
      this.update();
    };
    
    this.handlePrevFlip = function(ev){
      switch( ev.type ){
        case this.events.ANIMATION_START :
          setTimeout(function(){
            this.currStep--;
            if( this.currStep < 0 ) this.currStep = 0;
            this.update();
          }.bind(this), this.args.animationDuration/2 * 1000);
          break;
        
        case this.events.ANIMATION_END :
          this.refs.stepsContainer.removeEventListener(this.events.ANIMATION_START, this.prevFlipRef);
          this.refs.stepsContainer.removeEventListener(this.events.ANIMATION_END, this.prevFlipRef);
          this.prevFlipRef = null;
          this.refs.stepsContainer.classList.remove( this.cssModifiers.IS_FLIPPING_RIGHT );
          break;
      }
    };
    
    this.handlePrevClick = function(ev){
      if( this.args.steps[this.currStep].onHide ){
        this.args.steps[this.currStep].onHide();
      }
      
      this.prevFlipRef = this.handlePrevFlip.bind(this);
      
      this.refs.stepsContainer.addEventListener(this.events.ANIMATION_START, this.prevFlipRef, false);
      this.refs.stepsContainer.addEventListener(this.events.ANIMATION_END, this.prevFlipRef, false);
      ev.currentTarget.blur();
      this.refs.stepsContainer.classList.add( this.cssModifiers.IS_FLIPPING_RIGHT );
    };
    
    this.handleNextFlip = function(ev){
      switch( ev.type ){
        case this.events.ANIMATION_START :
          setTimeout(function(){
            this.currStep++;
            if( this.currStep > this.args.steps.length-1 ) this.currStep = this.args.steps.length-1;
            this.update();
            
            if( this.args.steps[this.currStep].onShow ){
              this.args.steps[this.currStep].onShow();
            }
          }.bind(this), this.args.animationDuration/2 * 1000);
          break;
        
        case this.events.ANIMATION_END :
          this.refs.stepsContainer.removeEventListener(this.events.ANIMATION_START, this.nextFlipRef);
          this.refs.stepsContainer.removeEventListener(this.events.ANIMATION_END, this.nextFlipRef);
          this.nextFlipRef = null;
          this.refs.stepsContainer.classList.remove( this.cssModifiers.IS_FLIPPING_LEFT );
          break;
      }
    };
    
    this.handleNextClick = function(ev){      
      this.nextFlipRef = this.handleNextFlip.bind(this);
      
      this.refs.stepsContainer.addEventListener(this.events.ANIMATION_START, this.nextFlipRef, false);
      this.refs.stepsContainer.addEventListener(this.events.ANIMATION_END, this.nextFlipRef, false);
      ev.currentTarget.blur();
      this.refs.stepsContainer.classList.add( this.cssModifiers.IS_FLIPPING_LEFT );
    };
    
    this.on('mount', this.handleMount);
  </script>
</nox-steps>