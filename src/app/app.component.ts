import { Component, ViewChild, ElementRef } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { User } from './user';
import { Patient } from './patient';
import { AuthService } from './_services/auth.service';
import { TokenStorageService } from './_services/token-storage.service';
import { PatientService } from './_services/patient.service';
import { HttpEventType, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators'; 
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ThrowStmt } from '@angular/compiler';
import { HdBaseLine } from './hdBaseLine';
import { HdMonthlyfollowUp } from './HdMonthlyfollowUp';
import { Donor } from './donor';
import { TrFollowUp } from './trFollowUp';
import { FormArray } from '@angular/forms';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})

export class AppComponent {
  
  title = 'salma-Archiv';

  //autherity
  private roles: string[];
  isLoggedIn = false;
  username: string;
  userrole: string;

  //profile
  currentUser: any;

  //menue
  toggled = false;

  //loign
  formLogin: any = {};
  isLoginFailed = false;
  errorMessage = '';

  //regiser User
  [x: string]: any;
  formRegisterUser: any = {};
  isSuccessful = false;
  isSignUpFailed = false;
  rolesProfiles: [];  
  showUserRegisterForm : boolean;
  showUsersList : boolean;

  //users list
  sub: Subscription
  users: User[]

  //register patient
  formRegisterPatient: any = {}
  showPatientRegistrationForm :boolean; 
  showPatientsList :boolean;
  patients: Observable<Patient[]>;
  genders: string[] = ['Male', 'Female'];  
  residence: string[] = ['Khartoum', 'Omdurman','Bahri'];  


  //searchPatientByPersonalId
  formSearchPatientByPersonalId: any = {}
  showPatientPage: boolean;
  patient:Patient;
  personId:number;
  patientObject:any;

  //upload files
  fileData: File = null;
  previewUrl:any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;

  //HdBaseLine
  formPatientHdBaseLineRegistration: any={}
  showPatientHdBaseLineRegistrationForm : boolean;
  currentDate = new Date();
  _hds: Observable<HdBaseLine[]>;
  hdBaseLineObject:any;
  daysSelect: Array<any>;

  //register Donor
   formRegisterDonor: any={}
   showDonorRegistrationForm: boolean;
   showDonorList : boolean;
   shwDonorDetails: boolean;
   donors: Observable<Donor[]>;  
   donorObject:any;

  //Transplant

  formRegisterTransplant: any={}
  showTransplantRegistrationForm: boolean;
  transplantObject:any;
  showTransplantList : boolean;
  shwTransplantDetails: boolean;

  //TrFollowUp
  formTrFollowUp: any={}
  showTrFollowUpForm: boolean;
  _followUps: Observable<TrFollowUp[]>;
  shwTrFollowUpDetails: boolean;

  //
  public surgeonsList:{ [key: string]: Object; }[] = [
    { Name: 'Dr.Sarra', Code: 'Dr.Sarra' },
    { Name: 'Dr.Aisha', Code: 'Dr.Aisha' },
    ];
  public weekdays: { [key: string]: Object; }[] = [
    { Name: 'Saturday', Code: 'Saturday' },
    { Name: 'Sunday', Code: 'Sunday' },
    { Name: 'Monday', Code: 'Monday' },
    { Name: 'Tuesday', Code: 'Tuesday' },
    { Name: 'Wednesday', Code: 'Wednesday' },
    { Name: 'Thursday', Code: 'Thursday' },
    { Name: 'Friday', Code: 'Friday' }
    ];

    //HdMonthlyfollowUp
    formHdMonthlyfollowUp: any={}
    showHdMonthlyfollowUpForm:boolean;
    _hdFollowups:Observable<HdMonthlyfollowUp[]>;
    currentMonth = (new Date().getMonth() + 1).toString() + '-' + new Date().getFullYear().toString();

    //weekdays obj
    public localFields: Object = { text: 'Name', value: 'Code' };
    public selectedDays: string = 'Select weekdays';

    //surgeons obj
    public localFields: Object = { text: 'Name', value: 'Code' };
    public selected: string = 'Select surgeonsList';

  //validation
  mobNumberPattern = "[0-9]*"; 
  personalIdPattern= "[0-9]*";  
  namePattern = "[a-zA-Z ]*";
  decimalPatten ="[0-9]+(\.[0-9][0-9]?)?"; 


  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private tokenStorageService: TokenStorageService,
    private patientService: PatientService,
    private token: TokenStorageService
  ){}

  ngOnInit() {

    this.currentUser = this.token.getUser();

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.username=this.tokenStorage.getUser().userName;
      this.userrole = this.tokenStorage.getUser().roles;
      
    }
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.userrole = user.roles;
      this.username = user.username;

    }
    this.closeAllForms();
  }

  closeAllForms(){
    this.showUserRegisterForm = false;
    this.showPatientRegistrationForm = false;
    this.showDonortRegistrationForm = false;
    this.showUsersList= false;
    this.showPatientsList = false; 
    this.showPatientHdBaseLineRegistrationForm = false;
    //this.showPatientPage =false;
    this.showHdMonthlyfollowUpForm=false;
    this.showHdBaseLineDetails=false;
    this.shwHdFollowUpDetails=false;
    this.shwDonorDetails= false;
    this.showTransplantRegistrationForm=false;
    this.shwDonorDetails= false;
    this.showTransplantList= false;
    this.shwTransplantDetails=false;
    this.showTrFollowUpForm= false;
    this.shwTrFollowUpDetails =false;
  }
  onSubmitLogin() {
    this.authService.login(this.formLogin).subscribe(
      data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.reloadPage();
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }

  reloadPage() {
    window.location.reload();
  }

  logout() {
    this.tokenStorageService.signOut();
    window.location.reload();
  }

  loadRolesProfiles(){
    this.authService.getRoles().subscribe(_data => {
      //this.rolesProfiles = data;
    });
  }
//

collapseNav() {
  if (this.navBarTogglerIsVisible()) {
    console.log('collapseNav in NavigationComponent clicking navbarToggler');
    this.navbarToggler.nativeElement.click();
  }
}  


//users
upateUser(user: User){
  this.newUser=false;
  this.formRegisterUser=user;
  this.showUserRegisterForm= true;

}

onSubmitRegisterUser() {
    this.authService.register(this.formRegisterUser).subscribe(
      data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    );   
}
onsubmitShowUserList(){
  this.closeAllForms();
  this.showPatientPage=false;
  this.authService.getAllUsers().subscribe((result)=>{
  this.users = result;})
  this.showUsersList = true;
}

onsubmitShowUserRegisterForm(){
  this.closeAllForms();
  this.showUserRegisterForm = true;
}

matchPassword(_password: string, _confirmPassword: string) {
  if (!this.formRegisterPatient.passwordControl || !this.formRegisterPatient.confirmPasswordControl) {
    return null;
  }

  if (this.formRegisterPatient.confirmPasswordControl.errors && !this.formRegisterPatient.confirmPasswordControl.errors.passwordMismatch) {
    return null;
  }

  if (this.formRegisterPatient.passwordControl.value !== this.formRegisterPatient.confirmPasswordControl.value) {
    this.formRegisterPatient.confirmPasswordControl.setErrors({ passwordMismatch: true });
  } else {
    this.formRegisterPatient.confirmPasswordControl.setErrors(null);
  }
}


//patients
upatePatient(patient: Patient){
  this.formRegisterPatient=patient;
  this.showPatientRegistrationForm= true;
}
onsubmitShowPatientRegisterForm()
{
  this.showPatientRegistrationForm= true;
}
onSubmitRegisterPatient() {
  this.formRegisterPatient.createdBy=this.username;
  this.formRegisterPatient.createdBy=this.username;
  this.patientService.registerPatient(this.formRegisterPatient).subscribe(
    data => {
      console.log(data);
      this.isSuccessful = true;
      this.isSignUpFailed = false;
    },
    err => {
      this.errorMessage = err.error.message;
      this.isSignUpFailed = true;
    }
  );   

}

onSubmitShowPatientList(){
  this.closeAllForms();
  this.showPatientPage=false;
  this.patientService.getPatientsList().subscribe(patients => {
    this.patients = patients;
  });
  //this.patients = this.patientService.getPatientsList();
  this.showPatientsList = true;
}
onSubmitSearchPatientByPersonalId(personalId: number){ 
  //clear patints
  this.patientObject= new Patient;  
  //clear error message
  this.errorMessage="";
  this.showPatientPage=false;
  this.closeAllForms();
  console.log(personalId);
  this.personId=personalId;
  this.patientService.getPatientByPersonalId(personalId).subscribe(patients => {
    this.patientObject = patients;  
    
  }, error => {('No Patient Found For This Personal Id !. Please Try Again');  
    this.showPatientPage=false;
    console.log(error);  
    this.errorMessage="No Patient Found For This Personal Id !. Please Try Again";
  }  
  );
    this.showPatientPage=true;
}
public CalculateAge(): void
  {
    if(this.birthdate){
      var timeDiff = Math.abs(Date.now() - this.birthdate);
      //Used Math.floor instead of Math.ceil
      //so 26 years and 140 days would be considered as 26, not 27.
      this.age = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
  }
}

//HdBaseline

onsubmitedShowPatientHdBaseLineRegistrationForm(patient : Patient){
  this.closeAllForms();
  this.getHdBaseLineByPersonalId();
  this.showPatientHdBaseLineRegistrationForm = true;
  //this.formPatientHdBaseLineRegistration.patient = patient;
 
}
onsubmitedHidePatientHdBaseLineRegistrationForm(){
  this.showPatientHdBaseLineRegistrationForm = false;
}
onsubmitHdBaseLineRegister(){
  this.formPatientHdBaseLineRegistration.createdBy=this.username;
  this.formPatientHdBaseLineRegistration.updatedBy=this.username;
  this.formPatientHdBaseLineRegistration.patient=this.patientObject;
  this.patientService.registerHdBaseLine(this.formPatientHdBaseLineRegistration).subscribe(
    data => {
      console.log(data);
      this.errorMessage = data.body
      
      this.isSuccessful = true;
      this.isSignUpFailed = false;
  
    },
    err => {
      this.errorMessage = err.error.message;
      this.isSignUpFailed = true;
    }
  );   
  this.closeAllForms();
  this.getHdBaseLineByPersonalId();
  this.showHdBaseLineDetails=true;

}
getHdBaseLineByPersonalId(){
  const id=this.personId;
  this.patientService.getHdBaseLineByPersonalId(id).subscribe((result)=>{
    this.hdBaseLineObject = result;
    this.formPatientHdBaseLineRegistration=result;
  })
}

getHdFollowupByPersonalId(){
  const id=this.personId;
  this.patientService.getHdMonthlyfollowUpByPersonalId(id).subscribe((result)=>{
    this._hdFollowups = result; 
  })
}
getDonorByPersonalId(){
  const id=this.personId;
  this.patientService.getDonorByPersonalId(id).subscribe((result)=>{
    this.donorObject = result;
    this.formRegisterDonor = result;  
  })
}

getTransplantByPersonalId(){
  const id=this.personId;
  this.patientService.getTransplantByPersonalId(id).subscribe((result)=>{
    this.transplantObject = result;
    this.formRegisterTransplant = result;
  })
}
getTrFollowUpByPersonalId(){
  const id=this.personId;
  this.patientService.getTrFollowUpByPersonalId(id).subscribe((result)=>{
    this._followUps = result;})
}





//Hd MonthlyFollow up
onsubmitedShowHdMonthlyfollowUpForm(patient : Patient){
  this.closeAllForms();
  this.showHdMonthlyfollowUpForm = true;
  this.formHdMonthlyfollowUp.patient = patient;
  

}
onsubmitHdMonthlyfollowUpRegister(){
  this.formHdMonthlyfollowUp.createdBy=this.username;
  this.formHdMonthlyfollowUp.monthOfFollowUp=this.currentMonth;
  this.formHdMonthlyfollowUp.patient=this.patientObject;
  this.patientService.registerHdMonthlyfollowUp(this.formHdMonthlyfollowUp).subscribe(
    data => {
      console.log(data);
      this.isSuccessful = true;
      this.isSignUpFailed = false;
    },
    err => {
      this.errorMessage = err.error.message;
      this.isSignUpFailed = true;
    }
  );   
  this.closeAll();
  this.getHdMonthlyfollowUpByPersonalId();
  this.shwHdFollowUpDetail=true;
}
onsubmitedHideHdMonthlyfollowUpForm(){
 this.closeAllForms();
}
onsubmitedShowHdBaseLineDetails(patient : Patient){
  this.closeAllForms();
  this.getHdBaseLineByPersonalId();
  this.showHdBaseLineDetails=true;
}
onsubmitedShowHdMonthlyFollowUpDetails(patient : Patient){
  this.closeAllForms();
  this.getHdFollowupByPersonalId();
  this.shwHdFollowUpDetails=true;
}
//Donor
onsubmitShowDonorRegisterForm(patient : Patient){
  this.closeAllForms();
  this.getDonorByPersonalId();
  this.showDonortRegistrationForm = true;
  this.formRegisterDonor.patient = patient;
}
onsubmitedShowDonorDetails(patient : Patient){
  this.closeAllForms();
  this.getDonorByPersonalId();
  this.shwDonorDetails=true;
}
onSubmitRegisterDonor() {
  this.formRegisterDonor.createdBy=this.username;
  this.formRegisterDonor.updatedBy=this.username;
  this.formRegisterDonor.patient=this.patientObject;
  this.patientService.registerDonor(this.formRegisterDonor).subscribe(
    data => {
      console.log(data);
      this.isSuccessful = true;
      this.isSignUpFailed = false;
    },
    err => {
      this.errorMessage = err.error.message;
      this.isSignUpFailed = true;
    }
  );   
  this.closeAllForms();
  this.getDonorByPersonalId();
  this.shwDonorDetails=true;
}

//Transplant
onsubmitShowTransplantRegisterForm(patient : Patient){
  this.closeAllForms();
  this.getTransplantByPersonalId();
  this.showTransplantRegistrationForm = true;
  this.formRegisterTransplant.patient = patient;
}
onsubmitedHideTransplantForm(){
  this.showTransplantRegistrationForm = false;
}
onsubmitTransplantRegister(){
  this.formRegisterTransplant.createdBy=this.username;
  this.formRegisterTransplant.createdBy=this.username;
  this.formRegisterTransplant.patient=this.patientObject;
  this.patientService.registerTransplant(this.formRegisterTransplant).subscribe(
    data => {
      console.log(data);
      this.isSuccessful = true;
      this.isSignUpFailed = false;
    },
    err => {
      this.errorMessage = err.error.message;
      this.isSignUpFailed = true;
    }
  );   
  this.closeAllForms();
  this.getTransplantByPersonalId();
  this.shwTransplantDetails=true;

}
onsubmitedShowTransplantDetails(){
  this.closeAllForms();
  this.getTransplantByPersonalId();
  this.shwTransplantDetails=true;
}


//TrFollowUp
onsubmitedShowTrFollowUpForm(patient : Patient){
  this.closeAllForms();
  this.showTrFollowUpForm = true;
  this.formTrFollowUp.patient = patient;
}
onsubmitedHideTrfollowUpForm(){
  this.showTrFollowUpForm = false;
}
onsubmitTrFollowUpRegister(){
  this.formTrFollowUp.createdBy=this.username;
  this.formTrFollowUp.patient=this.patientObject;
  this.patientService.registerTrFollowUp(this.formTrFollowUp).subscribe(
    data => {
      console.log(data);
      this.isSuccessful = true;
      this.isSignUpFailed = false;
    },
    err => {
      this.errorMessage = err.error.message;
      this.isSignUpFailed = true;
    }
  );   
  this.closeAllForms();
  this.getTrFollowUpByPersonalId();
  this.shwTrFollowUpDetails=true;

}
onsubmitedShowTrFollowUpDetails(){
  this.closeAllForms();
  this.getTrFollowUpByPersonalId();
  this.shwTrFollowUpDetails=true;
}
}
