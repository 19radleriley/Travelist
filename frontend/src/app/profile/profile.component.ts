import { Component, Inject, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Country } from '../models/country.model';
import { Checklist } from '../models/checklist.model';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ChecklistComponent } from '../checklist/checklist.component';
import { Subscription } from 'rxjs';
import { UserComponent } from '../user/user.component';
import { FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  options : String[] = [
    "Saved",
    "Visited",
    "Todos",
    "Settings"
  ]

  user? : User;
  users? : User[];
  savedCountries? : Country[];
  visitedCountries? : Country[];
  checklists? : Checklist[];
  selectedOption : String = this.options[0];

  username = new FormControl("");
  email = new FormControl("");
  password = new FormControl("");

  checklistsSubscription : Subscription = this.countryService
    .checklists.subscribe(updatedList => {
      this.checklists = updatedList;
    });

  usersSubscription : Subscription = this.userService
    .nonAdmins.subscribe(updatedList => {
      this.users = updatedList;
    });

  constructor(
    private countryService : CountryService,
    private userService : UserService,
    private router : Router,
    public checklistDialog : MatDialog,
    public userDialog : MatDialog
  ) { }

  /*
   * On init, get the current user, determine if they
   * are an admin, and then init data accordingly
   */
  ngOnInit(): void {
    this.userService.whoami().subscribe(res => {
      if (res.status == 200) {
        this.user = res.body!;
        if (this.user.admin == true) {
          this.options.unshift("Users");
          this.selectedOption = this.options[0];
          this.initUsers();
        }
        this.initSavedCountries();
        this.initVisitedCountries();
        this.initTodos();

        this.username.setValue(this.user.username);
        this.email.setValue(this.user.email);
      }
      else {
        this.router.navigate(["/login"]);
      }
    });
  }

  /*
   * This function opens the dialog to view a checklist 
   * for the user.
   */
  viewChecklist(currentChecklist : Checklist) : void {
    this.checklistDialog.open(ChecklistComponent, {
      data : { checklist : currentChecklist, uid : this.user!._id, country : false }
    });
  }

  /*
   * This function opens a dialog for an admin 
   * to be able to view and update users
   */
  viewUser(user? : User) : void {
    this.userDialog.open(UserComponent, {
      data : {user : user, aid : this.user?._id}
    });
  }

  /*
   * This function routes the user to a country 
   * that they clicked on
   */
  viewCountry(cName : String) : void {
    this.router.navigate([`/profile/${cName}`]);
  }

  /*
   * This function gets the list of users (if current
   * user is an admin) for being displayed
   */
  initUsers() : void {
    this.userService.setUsers(this.user!._id);
  }

  /*
   * This function initializes this user's saved countries
   */
  initSavedCountries() : void {
    this.countryService.getUserCountries(this.user!._id, false)
      .subscribe(res => {
        this.savedCountries = res.body!;
      });
  }

  /*
   * This function initializes this user's visited countries
   */
  initVisitedCountries() : void {
    this.countryService.getUserCountries(this.user!._id, true)
      .subscribe(res => {
        this.visitedCountries = res.body!;
      });
  }

  /*
   * This function initializes this user's checklists
   */
  initTodos() : void {
    this.countryService.setChecklists(this.user!._id);
  }

  /*
   * This function attempts to update this user's settings
   */
  updateSettings() : void {
    if (this.password.value != "") {
      if (confirm("Are you sure you wish to change your password?")) {
        this.makeChanges();
      }
    }
    else {
      this.makeChanges();
    }
  }

  /*
   * This function makes the changes to the user's settings
   */
  makeChanges() : void {
    let user = new User(
      this.username.value,
      this.email.value,
      this.user!._id,
      this.user!.admin,
      this.user!.active,
      this.password.value,
    );
    this.userService.updateMyself(user._id, user)
      .subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          alert(res.error);
        }
        else if (res.status == 200) {
          this.user = res.body!;
          this.password.setValue("");
        }
      });
  }

  /*
   * This function calls the backend to log the user out
   */
  logout() : void {
    this.userService.logout().subscribe(res => {
      this.userService.notifyAboutChange(undefined);
      this.router.navigate(["/countries"]);
    });
  }

  /*
   * This function changes which tab the user is 
   * viewing in their profile
   */
  selectOption(option : String) : void {
    this.selectedOption = option;
  }
}
