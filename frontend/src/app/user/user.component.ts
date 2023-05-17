import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  username = new FormControl("");
  email = new FormControl("");
  password = new FormControl("");
  active = new FormControl(true);
  admin = new FormControl(false);

  constructor(
    private userService : UserService,
    private dialog : MatDialogRef<UserComponent>,
    @Inject(MAT_DIALOG_DATA) public data : {
      user : User,
      aid : String
    }
  ) { }

  /* 
   * On init, set the values of the form fields to 
   * the current values that the user has.
   */
  ngOnInit(): void {
    if (this.data.user) {
      this.username.setValue(this.data.user.username);
      this.email.setValue(this.data.user.email);
      this.active.setValue(this.data.user.active);
      this.admin.setValue(this.data.user.admin);
    }
  }

  /* 
   * This function directs traffic to update a user's information (or create a user)
   */
  setUser() : void {
    if (this.data.user) {
      if (this.password.value != "") {
        if(confirm("Are you sure you wish to change this user's password?")) {
          this.makeChanges();
        }
      }
      else {
        this.makeChanges();
      }
    }
    else {
      this.createUser();
    }
  }

  /* 
   * This function sets up and returns a user 
   * object based on the form fields
   */
  getUser() : User {
    return new User(
      this.username.value,
      this.email.value,
      this.data.user ? this.data.user._id : "",
      this.admin.value,
      this.active.value,
      this.password.value
    );
  }

  /* 
   * This function attempts to create a new user
   */
  createUser() : void {
    let user = this.getUser();
    this.userService.createUser(this.data.aid, user)
      .subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          alert(res.error);
        }
        else if (res.status == 200) {
          this.userService.setUsers(this.data.aid);
          this.dialog.close();
        }
      })
  }

  /* 
   * This function attempts to update
   * a user's information
   */
  makeChanges() : void {
    let user = this.getUser();
    this.userService.updateUser(this.data.aid, user)
      .subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          alert(res.error);
        }
        if (res.status == 200) {
          this.data.user = res.body!;
          this.userService.setUsers(this.data.aid);
          this.dialog.close();
        }
      });
  }

  /*
   *  This function deletes a user from the system.
   *  This includes deleting the countries, checklists,
   *  and todos associated with that user.
   */
  deleteUser() : void {
    if (confirm("Are you sure you wish to delete this user?")) {
      this.userService.deleteUser(this.data.aid, this.data.user._id)
        .subscribe(res => {
          if (res.status == 200) {
            this.userService.setUsers(this.data.aid);
            this.dialog.close();      
          }
        });
    } 
  }
}
