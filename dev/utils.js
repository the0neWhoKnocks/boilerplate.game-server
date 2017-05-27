var fs = require('fs');
var path = require('path');
var process = require('process');
var glob = require('glob-all');
var color = require('cli-color');
var cP = require('child_process');
var riot = require('riot');
var chokidar = require('chokidar');
var crypto = require('crypto');
var appConfig = require('../conf.app.js');
var riotConfig = require(appConfig.paths.RIOT_CONFIG);


function writeCompileMessage(tags, updating, isLast){
  var rootPath = appConfig.paths.ROOT.replace(/\\/g, '/');
  var lines = [];
  var statusText = 'COMPILING';
  var i;
  
  if( tags.length ){
    if( updating ){
      // number of lines preceding/trailing the tags output
      var linePadding = 3;
      
      // clears the previously printed lines
      for(i=0; i<(tags.length+linePadding); i++){
        process.stdout.write(color.move.up(1));
        process.stdout.write(color.erase.line);
      }
    }
    
    for(i=0; i<tags.length; i++){
      var tag = tags[i];
      var branch = ( i === tags.length-1 ) ? '└─' : '├─';
      var srcPath = tag.src.replace(rootPath, '');
      var outPath = tag.out.replace(rootPath, '');
      var statusDot = '';
      
      // list of supported chars - https://en.wikipedia.org/wiki/Code_page_437
      switch( tag.status ){
        case 'pending' : statusDot = `${color.yellow('●')}`; break;
        case 'success' : statusDot = `${color.green.bold('●')}`; break;
        case 'error'   : statusDot = `${color.red.bold('●')}`; break;
      }
      
      lines.push(`  ${color.green.bold(branch)} ${ statusDot } ${ srcPath } ${ color.cyan('➜') } ${ outPath }`);
    }
    
    if( isLast ) statusText = 'COMPILED';
    
    process.stdout.write(`${color.green.bold('[ '+ statusText +' ]')} Riot tags.\n`);
    process.stdout.write(`${ color.green.bold('──┬──────────') }\n${ lines.join("\n") }\n\n`);
  }
}

function buildTagsQueue(tagPaths, srcPath, outputPath){
  var queue = [];
  
  for(var i=0; i<tagPaths.length; i++){
    var src = tagPaths[i];
    var out = src.replace(srcPath, outputPath).replace('.tag', '.js');
    
    queue.push({
      status: 'pending', 
      src: src,
      out: out
    });
  }
  
  return queue;
}

function compileRiotTag(srcPath, outPath){
  try{
    var srcTag = fs.readFileSync(srcPath, 'utf8');
    var mtime = (new Date( fs.statSync(srcPath).mtime )).getTime();
    var compTag = riot.compile(srcTag, riotConfig);
    
    if( outPath ){
      fs.writeFileSync(outPath, compTag, 'utf8');
      // Make modified times match that of source, so watcher can be more accurate.
      // Pass in a Unix style number where the milliseconds are represented in 1/1000s
      fs.utimesSync(outPath, Date.now()/1000, mtime/1000);
    }else{
      return compTag;
    }
  }catch(err){
    throw new Error(err);
  }
}

function compileRiotTagsFromQueue(tagsArr, srcPath, outputPath){
  var queue = buildTagsQueue(tagsArr, srcPath, outputPath);
  
  writeCompileMessage(queue);

  for(var i=0; i<queue.length; i++){
    var tag = queue[i];
    
    compileRiotTag(tag.src, tag.out);
    
    queue[i].status = 'success';
    writeCompileMessage(queue, true, i === queue.length-1);
  }
}

module.exports = {
  /**
   * Compiles all Riot tags into a bundle or individual JS files.
   *
   * @param {function} [callback] - Will be called once the command has completed/failed.
   * @param {boolean} [watch] - Compiles the tags, and watches for future changes.
   */
  compileRiotTags: function(callback, watch){
    var _self = this;
    var msg, srcPath, outputPath;
    
    if(
      (!riotConfig.from || !riotConfig.from.length)
      || (!riotConfig.to || !riotConfig.to.length)
    ){
      msg = 'Input and output paths are required to compile Riot tags.';
      ( callback )
        ? callback(new Error(msg))
        : console.log(`${color.red.bold('[ ERROR ]')} ${msg}`);
      return;
    }
    
    srcPath = _self.normalizePath(riotConfig.from);
    outputPath = _self.normalizePath(riotConfig.to);

    // on first run, check if tags exist, and if they need to be re-compiled
    var srcTags = glob.sync(`${srcPath}/*.tag`);
    var cmpTags = glob.sync(`${outputPath}/*.js`);
    var needsCompiling = [];
    
    // check if there's a compiled tag for every source tag
    if( srcTags.length && cmpTags.length ){
      var cmpTagsStr = cmpTags.join('|').replace(new RegExp(outputPath, 'g'), '');
      var cmpTagNdx = 0;

      for(var i=0; i<srcTags.length; i++){
        var srcTag = srcTags[i];
        var name = path.basename(srcTags[i], '.tag');

        // no compiled tag found so add it to the queue
        if( cmpTagsStr.indexOf(name) < 0 ){
          needsCompiling.push(srcTag);
        }else{
          var cmpTag = cmpTags[cmpTagNdx];
          var srcMtime = (new Date( fs.statSync(srcTag).mtime )).getTime()/1000;
          var cmpMtime = (new Date( fs.statSync(cmpTag).mtime )).getTime()/1000;
          cmpTagNdx++;

          // The comped tag will have a zeroed out millisecond value regardless of
          // setting the mtime to that of the source tag. So the millisecond value
          // needs to be trimmed off to get an accurate reading.
          if( parseInt(srcMtime) !== cmpMtime ) needsCompiling.push(srcTag);
        }
      }
    }else{
      needsCompiling = srcTags;
    }
    
    if( needsCompiling.length ){
      compileRiotTagsFromQueue(needsCompiling, srcPath, outputPath);
    }else{
      msg = 'Tag compilation skipped';
      
      ( callback )
        ? callback()
        : console.log(`${color.yellow.bold('[ WARN ]')} ${msg}`);
    }
    
    if( watch ){
      var watcher = chokidar.watch(srcPath, {
        ignored: /(^|[\/\\])\../,
        ignoreInitial: true,
        persistent: true
      });
      var timeout;
      needsCompiling = [];
      
      // Add event listeners.
      watcher
        .on('add', function(path){
          console.log(`${color.white('[ CREATED ]')} ${ _self.normalizePath(path, true) }`);
          
          clearTimeout(timeout);
          needsCompiling.push( _self.normalizePath(path) );
          
          // throttle in case multiple files get created at once
          timeout = setTimeout(function(){
            compileRiotTagsFromQueue(needsCompiling, srcPath, outputPath);
            needsCompiling = [];
          }, 100);
        })
        .on('change', function(path){
          clearTimeout(timeout);
          needsCompiling.push( _self.normalizePath(path) );
          
          // throttle in case multiple file changes get saved at once
          timeout = setTimeout(function(){
            compileRiotTagsFromQueue(needsCompiling, srcPath, outputPath);
            needsCompiling = [];
          }, 100);
        })
        .on('unlink', function(path){
          console.log(`${color.white('[ DELETED ]')} ${ _self.normalizePath(path, true) }`);
          // kill the generated tag as well
          var deadTag = _self.normalizePath(path).replace(srcPath, outputPath).replace('.tag', '.js');
          try{
            fs.unlinkSync(deadTag);
            console.log(`${color.white('[ DELETED ]')} ${ _self.normalizePath(deadTag, true) }`);
          }catch(err){
            console.log(`${color.red.bold('[ ERROR ]')} couldn't delete ${ deadTag }`, err);
          }
        });
      
      if( callback ) callback();
    }
  },
  
  /**
   * Ensures a function doesn't run too often.
   *
   * @param {function} func - Function that shouldn't be called too often.
   * @param {number} delay - Time to wait between function calls in milliseconds.
   * @param {boolean} [immediate] - No delay, call the function now.
   * @returns {function}
   * @example
   * debounce(callback);
   *
   * debounce(function(){
   *   // your code
   * }, 500);
   */
  debounce: function(func, delay, immediate){
    var timeout;
    
    return function(){
      var context = this;
      var args = arguments;
      var later = function(){
        timeout = null;
        if( !immediate ) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      timeout = setTimeout(later, delay);
      
      if( callNow ) func.apply(context, args);
    };
  },
  
  normalizePath: function(path, removeRoot){
    path = path.replace(/\\/g, '/');
    
    if( removeRoot ) path = path.replace(appConfig.paths.ROOT.replace(/\\/g, '/'), '');
    
    return path;
  },

  encrypt: function(text){
    var cipher = crypto.createCipher(appConfig.CIPHER_ALGORITHM, appConfig.CIPHER_KEY);
    var crypted = cipher.update(text, 'utf8', 'hex');

    crypted += cipher.final('hex');

    return crypted;
  },

  decrypt: function(text){
    var decipher = crypto.createDecipher(appConfig.CIPHER_ALGORITHM, appConfig.CIPHER_KEY);
    var decrypted = decipher.update(text, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
  },

  handleRespError: function(res, msg){
    var respData = {
      msg: msg,
      status: 500
    };

    console.log( `${color.red.bold('[ ERROR ]')} ${msg}` );

    res.status(respData.status);
    res.send({ error: respData.msg });
  },

  clone: function(obj){
    var duplicate = {};

    for(var key in obj){
      if( obj.hasOwnProperty(key) ){
        var currProp = obj[key];

        if( Array.isArray(currProp) ){
          if( !duplicate[key] ) duplicate[key] = [];
          duplicate[key] = duplicate[key].concat(currProp);
        }else if(
          !currProp
          || typeof currProp === 'boolean'
          || typeof currProp === 'function'
          || typeof currProp === 'number'
          || typeof currProp === 'string'
        ){
          duplicate[key] = currProp;
        }else{
          duplicate[key] = this.clone(currProp);
        }
      }
    }

    return duplicate;
  },

  combine: function(){
    // get objects to combine
    var items = [].slice.call(arguments);
    // the first will be the starting point
    var combined = items.shift();

    for(var i=0; i<items.length; i++){
      var currItem = items[i];

      if( Array.isArray(currItem) ){
        combined = combined.concat(currItem);
      }else{
        // create a dupe of the Object so as not to mutate the original
        var dupeItem = this.clone(currItem);

        for(var key in dupeItem){
          if( dupeItem.hasOwnProperty(key) ){
            var currProp = dupeItem[key];

            // if it doesn't exist on the original, just add it
            if( !combined[key] ){
              combined[key] = currProp;
            }else{
              if( Array.isArray(currProp) ){
                if( !combined[key] ) combined[key] = [];
                combined[key] = combined[key].concat(currProp);
              }else if(
                !currProp
                || typeof currProp === 'boolean'
                || typeof currProp === 'function'
                || typeof currProp === 'number'
                || typeof currProp === 'string'
              ){
                combined[key] = currProp;
              }else{
                combined[key] = this.combine(combined[key], currProp);
              }
            }
          }
        }
      }
    }

    return combined;
  }
};