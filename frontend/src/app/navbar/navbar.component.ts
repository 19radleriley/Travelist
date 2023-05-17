import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { CountryService } from '../services/country.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  navExpanded : Boolean = false;
  user? : User;

  constructor(
    private userService : UserService,
    private countryService : CountryService,
    private router : Router
  ) { }

  /*
   * On init, attempt to grab the current user
   */
  ngOnInit(): void {
    this.userService.whoami().subscribe(res => {
      if (res.status == 200) {
        this.user = res.body!;
      }
    });
  }

  public setUser(user : User) : void {
    this.user = user;
  }

  /*
   * When in mobile view, this function will expand the 
   * navbar when the hamburger menu is clicked
   */
  toggleNav() : void {
    this.navExpanded = this.navExpanded ? false : true;
  }
 
  /*
   * This function finds and routes the user 
   * to a random country
   */
  spinTheGlobe() : void {
    this.countryService.getCountries()
      .subscribe(res => {
        if (res.status == 200) {
          let rand = res.body[Math.floor(Math.random() * res.body.length)];
          this.router.navigate([`/countries/${rand.name}`])
            .then(() => {
              window.location.reload();
            })
        }
      });
  }
}
