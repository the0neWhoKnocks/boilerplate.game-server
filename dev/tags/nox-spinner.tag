<nox-spinner>
  <div if={ processing } class="spinner"></div>
  
  <style scoped>
    :scope {
      font: 20px Helvetica, Arial, sans-serif;

      width: 1em;
      height: 1em;
      display: inline-block;
      position: absolute;
      top: 50%;
      right: 0.5em;
      transform: translateY(-50%);
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
    }


    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  </style>
  
  <script>
    this.processing = false;

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