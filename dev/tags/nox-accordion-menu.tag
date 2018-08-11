<nox-accordion-menu>
  <nav class="menu">
    <ul>
      <li each="{ item, ndx in items }">
        <input id="item-{ menuId }-{ ndx }" type="checkbox" class="menu__checkbox" checked="{ opened }">
        <div class="menu__btn { btnClass }">
          <label class="menu__btn-label { labelClass }" for="item-{ menuId }-{ ndx }">
            { item.label }
            <div class="menu__plus-minus">
              <span class="menu__minus1"></span>
              <span class="menu__minus2"></span>
            </div>
          </label>
        </div>
        <ul class="menu__items">
          <li each="{ child in item.children }">
            <a
              if="{ child.url }"
              href="{ child.url }"
              class="menu__item"
            >{ child.label }</a>
            <button
              if="{ child.onclick }"
              class="menu__item"
              onclick="{ child.onclick }"
            >{ child.label }</button>
            <raw if="{ child.raw }" content="{ child.raw }"></raw>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
  
  <style scoped>
    :scope {
      font: 20px Helvetica, Arial, sans-serif;
    }

    $namespace = '.menu';
    $plusMinusDims = 16px; // have to use px values otherwise the elements don't render aligned correctly :\

    {$namespace} {
      font-size: 12px;

      &__plus-minus {
        width: $plusMinusDims;
        height: $plusMinusDims;
        color: #000;
        position: absolute;
        top: 50%;
        right: 1em;
        transform: translateY(-50%);
      }

      &__minus1,
      &__minus2 {
        width: $plusMinusDims;
        height: $plusMinusDims;
        display: block;
        position: absolute;
        top: 0;
        transition: all 0.25s;

        &::after {
          content: '';
          width: 100%;
          height: 2px;
          background: currentColor;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      &__minus1 {
        transform: rotate(0deg);
      }

      &__minus2 {
        transform: rotate(90deg);
      }

      &__item {
        color: #000;
        text-decoration: none;
        padding: 1em;
        border-left: solid 10px #eee;
        border-bottom: solid 1px #eee;
        display: block;

        &:hover {
          background: #eee;
        }
      }

      &__items {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.25s cubic-bezier(0, 1, 0, 1) -0.1s;
      }

      &__btn {

        &-label {
          width: 100%;
          text-align: left;
          font-size: 1.4em;
          text-transform: uppercase;
          padding: 1em;
          border: solid 1px #ddd;
          border-right: none;
          border-left: none;
          background: transparent;
          position: relative;
          cursor: pointer;
          display: block;
          box-sizing: border-box;
          user-select: none;
        }
      }

      &__checkbox {
        display: none;

        &:checked {

          ~ {$namespace} {

            &__btn {

              {$namespace} {

                &__minus1,
                &__minus2 {
                  transform: rotate(180deg);
                }
              }
            }

            &__items {
              max-height: 9999px;
              transition: max-height 0.25s cubic-bezier(1, 0, 1, 0) 0s;
            }
          }
        }
      }
    }
  </style>
  
  <script>
    this.opened = false;
    this.menuId = Date.now() + Math.random(); // ensures a truly unique id since `now` sometimes returns the same # for multiple instances.
    this.btnClass = opts.btnClass || undefined;
    this.labelClass = opts.labelClass || undefined;
    this.items = opts.items || [];

    this.open = function(){
      this.opened = true;
      this.update();
    };

    this.close = function(){
      this.opened = false;
      this.update();
    };
  </script>
</nox-accordion-menu>