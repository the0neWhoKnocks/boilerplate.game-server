<nox-spinner>
  <div if="{ processing }" class="wrapper { for--overlay:overlay }">
    <div class="spinner"></div>
  </div>
  
  <style scoped>
    :scope {
      font: 20px Helvetica, Arial, sans-serif;
    }

    .wrapper {
      width: 1em;
      height: 1em;
      display: inline-block;
      position: absolute;
      top: 50%;
      right: 0.5em;
      transform: translateY(-50%);

      &.for--overlay {
        width: auto;
        height: auto;
        background: rgba(0,0,0,0.25);
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: initial;
      }
    }

    .spinner {
      width: 100%;
      height: 100%;
      border-top: solid 0.12em;
      border-right: solid 0.12em rgba(0,0,0,0.15);
      border-bottom: solid 0.12em rgba(0,0,0,0.15);
      border-left: solid 0.12em rgba(0,0,0,0.15);
      border-radius: 100%;
      animation: spin 0.75s linear infinite;

      .for--overlay & {
        width: 1em;
        height: 1em;
        left: 50%;
        position: absolute;
        top: 50%;
        animation: overlaySpin 0.75s linear infinite;
      }
    }


    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes overlaySpin {
      0% {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      100% {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  </style>
  
  <script>
    this.processing = false;
    this.overlay = opts.overlay || false;

    this.show = function(){
      this.processing = true;
      this.update();
    };

    this.hide = function(){
      this.processing = false;
      this.update();
    };
  </script>
</nox-spinner>