var emailSetupSteps;

function handleSuccess(resp){
  location.reload();
}

function handleInput(ev){
  var input = ev.currentTarget;
  var form = input.form;
  var saveBtn = document.querySelector('#saveBtn');
  var requiredInputs = form.querySelectorAll('[required]');
  var allFilled = true;
  
  for(var i=0; i<requiredInputs.length; i++){
    var curr = requiredInputs[i];
    
    if( curr.value === '' ){
      allFilled = false;
      break;
    }
  }
  
  if( allFilled ){
    saveBtn.disabled = false;
  }else {
    saveBtn.disabled = true;
  }
  
  return true; // needed so user can perform normal text actions
}


var step1 = 
  'This app utilizes Gmail to send emails for things like user password recovery.<br><br>'+
  'Enter in an email and password for a Gmail account that you want associated '+
  'with administration for this app.<br><br>'+
  '<form action="'+ appData.endpoints.v1.EMAIL_CONFIG_ADD +'" method="POST" onsubmit="utils.handleSubmit.call(this, event, handleSuccess)">'+
    '<input type="email" name="email" placeholder="Email" oninput="handleInput(event)" required />'+
    '<input type="password" name="pass" placeholder="Password" oninput="handleInput(event)" required />'+
    '<button id="saveBtn" disabled>Save</button>'+
  '</form>';

emailSetupSteps = riot.mount('nox-steps', {
  isFor: 'email-setup',
  steps: [
    { 
      title: 'Email Config Setup',
      body: step1
    }
  ]
})[0];

emailSetupSteps.display();