var isOpen = false;

function toggleOptions(e) {

   isOpen = !isOpen;
   if (isOpen) {
      document.getElementById('selectContainer').style.visibility = 'visible';
      document.getElementById('selectContainer').focus();
   } else {
      document.getElementById('selectContainer').blur();
      document.getElementById('selectContainer').style.visibility = 'hidden';
   }

}

function selected(val, flag) {
   document.getElementById('valueText').innerHTML = '<img src="' + flag + '" width="35px" style="padding-right: 10px;">' + val;
   document.getElementById('selectedValue').val = val;
   toggleOptions();
}

function terms_changed(termsCheckBox){
   //If the checkbox has been checked
   if(termsCheckBox.checked){
       //Set the disabled property to FALSE and enable the button.
       document.getElementById("startBtn").disabled = false;
   } else{
       //Otherwise, disable the submit button.
       document.getElementById("startBtn").disabled = true;
   }
}

