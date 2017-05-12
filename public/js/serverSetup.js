var setupSteps;

function handleInput(ev){
  var input = ev.currentTarget;
  var form = input.form;
  var saveBtn = form.querySelector('#saveBtn');
  var requiredInputs = form.querySelectorAll('[required]');
  var allFilled = true;
  
  for(var i=0; i<requiredInputs.length; i++){
    var curr = requiredInputs[i];
    
    if( curr.value === '' ){
      allFilled = false;
      break;
    }
  }
  
  saveBtn.disabled = !allFilled;
  
  return true; // needed so user can perform normal text actions
}

function handleConfigSuccess(resp){
  setupSteps.refs.nextStepBtn.disabled = false;
  document.querySelector('#saveBtn').disabled = true;
  setupSteps.refs.nextStepBtn.click();
}

function handleUserSuccess(resp){
  setupSteps.refs.nextStepBtn.disabled = false;
  document.querySelector('#saveBtn').disabled = true;
  setupSteps.refs.nextStepBtn.click();
}

function handleVerifiedClick(ev){
  location.reload();
}

var step1 = 
  '<ul>'+
    '<li><a href="https://console.firebase.google.com/" target="_blank">Open Firebase Console</a></li>'+
      '<ul>'+
        '<li>Create a new project and call it whatever you\'d like</li>'+
        '<li>Go to Authentication &gt; Sign-In Method &gt; enable Email/Password</li>'+
        '<li>Go to Database &gt; Rules &gt; set <code>".read"</code> to <code>true</code></li>'+
      '</ul>'+
    "<li>Once you've created a new project click Next.</li>"+
  '</ul>';
var step2 = 
  '<ul>'+
    '<li>In the main nav, click on the <code>Overview</code> button.</li>'+
    '<li>Then click on <code>Add Firebase to your web app</code>.</li>'+
    '<li>Copy just the <code>var config = {...};</code> Object.</li>'+
    '<li>'+
      '<form action="'+ appData.endpoints.v1.DB_CONFIG_ADD +'" method="POST" onsubmit="utils.handleSubmit.call(this, event, handleConfigSuccess)">'+
        '<textarea name="config" placeholder="Paste config here" oninput="handleInput(event)" required></textarea>'+
        '<button id="saveBtn" disabled>Save Config</button>'+
      '</form>'+
    '</li>'+
  '</ul>';
var step3 = 
  'Create an Admin user.<br><br>'+
  '<form action="'+ appData.endpoints.v1.USER_CREATE +'" method="POST" onsubmit="utils.handleSubmit.call(this, event, handleUserSuccess)">'+
    '<label>'+
      'Email'+
      '<input type="email" name="email" placeholder="Email" oninput="handleInput(event)" required>'+
    '</label>'+
    '<label>'+
      'Password'+
      '<input type="password" name="password" placeholder="Password" oninput="handleInput(event)" required>'+
    '</label>'+
    '<button id="saveBtn" disabled>Create User</button>'+
  '</form>';
var step4 =
  'An email was sent to you. Once you\'ve validated your email click the button below.<br><br>'+
  '<button id="emailVerified" type="button" onclick="handleVerifiedClick(event)">Verified</button>';
//var step5 =
//  'This app utilizes Gmail to send emails for things like user password recovery.<br><br>'+
//  'Enter in an email and password for a Gmail account that you want associated '+
//  'with administration for this app.<br><br>'+
//  '<form action="'+ appData.endpoints.v1.EMAIL_CONFIG_ADD +'" method="POST" onsubmit="utils.handleSubmit.call(this, event, handleEmailSuccess)">'+
//    '<input type="email" name="email" placeholder="Email" oninput="handleInput(event)" required />'+
//    '<input type="password" name="pass" placeholder="Password" oninput="handleInput(event)" required />'+
//    '<button id="saveBtn" disabled>Save</button>'+
//  '</form>';

setupSteps = riot.mount('nox-steps', {
  displayStep: appData.displayStep || null,
  isFor: 'db-setup',
  steps: [
    { 
      id: 'db',
      title: 'No Database Detected',
      body: step1
    },
    { 
      title: 'DB Configuration',
      body: step2,
      onShow: function(){
        setupSteps.refs.nextStepBtn.disabled = true;
      },
      onHide: function(){
        setupSteps.refs.nextStepBtn.disabled = false;
      }
    },
    { 
      id: 'admin',
      title: 'Admin User',
      body: step3,
      onShow: function(){
        setupSteps.refs.prevStepBtn.disabled = true;
        setupSteps.refs.nextStepBtn.disabled = true;
      },
      onHide: function(){
        setupSteps.refs.nextStepBtn.disabled = false;
      }
    },
    {
      title: 'Admin Verification',
      body: step4
    },
    //{
    //  id: 'email',
    //  title: 'Email Configuration',
    //  body: step5,
    //  onShow: function(){
    //    setupSteps.refs.prevStepBtn.disabled = true;
    //    setupSteps.refs.nextStepBtn.disabled = true;
    //  },
    //  onHide: function(){
    //    setupSteps.refs.nextStepBtn.disabled = false;
    //  }
    //}
  ]
})[0];

setupSteps.display();