import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  email = new FormControl("");
  password = new FormControl("");

  constructor(
    private userService : UserService,
    private router : Router
  ) { }

  ngOnInit(): void {
  }

  /*
   * This function attempts to register a user 
   * with the application. If unsuccessful, an 
   * error message from the backend is displayed
   */
  register() : void {
    this.userService.register(
      this.email.value,
      this.password.value
    ).subscribe(res => {
      if (res instanceof HttpErrorResponse) {
        alert(res.error);
      }
      else if (res.status == 200) {
        this.userService.notifyAboutChange(res.body!);
        this.router.navigate(["/profile"]);
      }
    });
  }
}
