import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CountryService } from '../services/country.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  countrySearch = new FormControl("");

  constructor(
    private countryService : CountryService
  ) { }

  ngOnInit(): void {
  }
 
  /*
   * This function searches for a country
   * based on the input supplied by the user 
   * and updates the countrylist accordingly
   */
  searchForCountry() {
    let name = this.countrySearch.value.toLowerCase().trim();
    if (name.length && /^[a-z ]+$/g.test(name)) {
      this.countryService.setCountries(`name=${name}`);
      this.countrySearch.setValue("");
    }
  }
}
