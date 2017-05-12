<nox-profile-avatar>

  <div class="avatar__upload-container js-avatarUploadContainer">
    <div class="avatar__dz-and-btns js-avatarDzAndBtns">
      <div
        class="avatar__drop-zone"
        style="width:{ imgWidth }px; height:{ imgHeight }px;"
        data-drop-zone-text={ dropZoneText }
      ></div>
      <div class="avatar__btn-container">
        <button type="button" class="avatar__choose-btn avatar--is-base-btn js-avatarChooseBtn">{ fileInputText }</button>
        <input class="avatar__file-input js-avatarUploadInput" type="file" name="uploaded_file" accept={ acceptedFormats }>
      </div>
    </div>
    <div class="avatar__error-messages avatar--is-hidden js-avatarErrorMessages"></div>
    <div class="avatar__success-message avatar--is-hidden js-avatarSuccessMessage"></div>
  </div>
  <!--<div class="img-wrapper" style="width:{ imgWidth }px; height:{ imgHeight }px;">-->
    <!--<img-->
      <!--ref="avatarImg"-->
      <!--class="avatar__img"-->
      <!--src="data:image/png;base64,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"-->
      <!--alt="avatar image"-->
    <!-- > -->
    <!--<img if={ currentImg } src={ currentImg }>-->
  <!--</div>-->
  <!--<input type="file">-->
  <!--<button type="button">Upload</button>-->
  
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

    /*.img-wrapper {*/
      /*border: solid 1px #ccc;*/
    /*}*/

    /*button {*/
      /*width: 100%;*/
      /*text-transform: uppercase;*/
      /*padding: 0.5em;*/
      /*cursor: pointer;*/
    /*}*/
    /**/
    /*.avatar {*/
      /**/
      /*&__img {*/
        /*width: 100%;*/
      /*}*/
    /*}*/

    $namespace = '.avatar';
    $animSpeed = 0.25s;

    {$namespace} {

      &__image-container,
      &__upload-container {
        display: inline-block;
        vertical-align: top;
      }

      &__image-container {
        width: 150px;
        margin-right: 5px;
        border: 1px solid gray;
        overflow: hidden;
        position: relative;
      }

      &__upload-container {
        position: relative;
        opacity: 1;
        transition: opacity $animSpeed;
      }

      &__edit-btn {
        width: 100%;
        padding-bottom: 4px;
        border: none;
        border-top: solid 1px #808080;
        border-radius: 0;
        margin-top: -3px;
      }

      &__drop-zone {
        height: 140px;
        border: 3px dashed rgba(0,0,0,0.25);
        margin-bottom: 10px;
        background-image: url('data:image/png;base64,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');
        background-size: contain;
        position: relative;
        transition: all $animSpeed;

        &:after {
          content: attr(data-drop-zone-text);
          color: rgba(0,0,0,0.4);
          font-size: 1.2rem;
          font-weight: bold;
          white-space: nowrap;
          position: absolute;
          left: 50%;
          bottom: 0.5em;
          transform: translateX(-50%);
        }
      }

      &__btn-container {
        position: relative;
      }

      &__choose-btn,
      &__upload-btn {
        width: 100%;
        transition: opacity 0.25s;
      }

      &__upload-btn {
        position: absolute;
        top: 0;
        left: 0;
      }

      &__file-input {
        width: 100%;
        height: 100%;
        font-size: 0;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        cursor: pointer;
      }

      &__upload-progress {
        width: 95%;
        height: 60%;
        border: solid 1px #B0B0B0;
        border-radius: 0.5em;
        overflow: hidden;
        display: block;
        position: absolute;
        bottom: 50%;
        left: 50%;
        transform: translate(-50%, 50%);
        appearance: none;

        &[value] {
          &::-webkit-progress-bar {
            background-color: #eee;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
          }

          &::-webkit-progress-value {
            border-radius: 0em 0.4em 0.4em 0em;
            background-image: linear-gradient(#DBFF00, #009913);
            transition: width .25s;
          }
        }
      }

      &__error-messages,
      &__success-message {
        font-weight: bold;
        font-size: 1.25rem;
        text-align: left;
        white-space: pre;
        padding: 0.5em 1em;
        border: solid 2px;
        border-radius: 0.5em;
        margin-top: 10px;
      }

      &__error-messages {
        color: #fff;
        border-color: #843232;
        background: #E85050;
      }

      &__success-message {
        color: #2E5F3F;
        border-color: #2E5F3F;
        background: #52f28b;
      }

      &__api-errors {
        color: #812C3B;
        font-weight: bold;
        padding: 1rem;
        border: dotted 2px #812C3B;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
        overflow: hidden;
        background: #ffc0cb;
        transition: all .25s;

        li {
          list-style-position: inside;
        }
      }

      // == Modifiers ================================================================

      &--is-invisible {
        height: 0;
        min-height: 0;
        opacity: 0;
        padding: 0;
        border-width: 0;
        margin: 0;
        pointer-events: none;
      }

      &--is-hidden {
        display: none;
      }

      &--drop-the-file {
        border-color: #1AC1DF;
      }

      // base styling (like for inputs)
      &--is-base {

        &-btn {
          color: #333;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          padding: 5px 20px;
          border: 1px solid #808080;
          border-radius: 5px;
          cursor: pointer;
          display: inline-block;
          background: #ddd;

          &:hover {
            background-color: #EEEEEE;
            opacity: 1;
          }
        }
      }
    }
  </style>
  
  <script>
    const _self = this;
    const formatPresets = {
      IMAGES: [ 'image/png', 'image/jpeg', 'image/gif' ]
    };
    this.imgWidth = opts.imgWidth || 300;
    this.imgHeight = opts.imgHeight || 300;
    this.dropZoneText = opts.dropZoneText || 'Drop Image Here';
    this.fileInputText = opts.fileInputText || 'Choose Image';
    this.acceptedFormats = opts.acceptedFormats || formatPresets.IMAGES.join(',');
    
    // C:\wamp\www\dev.CE.git\dev\js\admin\plugins\FileUploader
    
    function handleMount(ev){}
    
    this.on('mount', handleMount);
  </script>
</nox-profile-avatar>